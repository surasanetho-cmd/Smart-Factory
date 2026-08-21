import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  employeeToDbRow,
  fetchEmployeesFromGoogleSheet,
  MASTER_USERS_TABLE,
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
    db: {
      schema: MASTER_USERS_TABLE.schema,
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
          "Add SUPABASE_SERVICE_ROLE_KEY to .env.local, run supabase/sql/master_users.sql in SQL Editor, and expose the master schema in Supabase API settings.",
      },
      { status: 503 },
    );
  }

  try {
    const { employees } = await fetchEmployeesFromGoogleSheet();
    const rows = employees.map(employeeToDbRow);

    const { error } = await supabase
      .from(MASTER_USERS_TABLE.name)
      .upsert(rows, { onConflict: "employee_id" });

    if (error) {
      return NextResponse.json(
        {
          synced: false,
          status: "supabase_error",
          table: `${MASTER_USERS_TABLE.schema}.${MASTER_USERS_TABLE.name}`,
          message: error.message,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      synced: true,
      status: "ok",
      table: `${MASTER_USERS_TABLE.schema}.${MASTER_USERS_TABLE.name}`,
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
