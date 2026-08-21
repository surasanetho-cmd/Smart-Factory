import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  employeeToDbRow,
  fetchEmployeesFromGoogleSheet,
} from "@/lib/master/employees";
import { NextResponse } from "next/server";

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST() {
  const supabase = getServiceRoleClient();

  if (!supabase) {
    return NextResponse.json(
      {
        synced: false,
        status: "missing_service_role",
        message:
          "Add SUPABASE_SERVICE_ROLE_KEY to .env.local and run the employees_master migration in Supabase.",
      },
      { status: 503 },
    );
  }

  try {
    const { employees } = await fetchEmployeesFromGoogleSheet();
    const rows = employees.map(employeeToDbRow);

    const { error } = await supabase
      .from("employees_master")
      .upsert(rows, { onConflict: "employee_id" });

    if (error) {
      return NextResponse.json(
        {
          synced: false,
          status: "supabase_error",
          message: error.message,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      synced: true,
      status: "ok",
      count: rows.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown sync error";

    return NextResponse.json(
      {
        synced: false,
        status: "sync_error",
        message,
      },
      { status: 502 },
    );
  }
}
