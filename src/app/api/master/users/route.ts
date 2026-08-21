import { createClient } from "@/lib/supabase/server";
import { MASTER_USERS_TABLE } from "@/lib/master/employees";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department")?.trim().toUpperCase();
  const limit = Number(searchParams.get("limit") ?? "0");

  try {
    const supabase = await createClient();
    let query = supabase
      .schema(MASTER_USERS_TABLE.schema)
      .from(MASTER_USERS_TABLE.name)
      .select(
        "employee_id, prefix, first_name, last_name, position, level, department, synced_at",
      )
      .order("employee_id", { ascending: true });

    if (department) {
      query = query.eq("department", department);
    }

    if (Number.isFinite(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          source: "supabase",
          table: `${MASTER_USERS_TABLE.schema}.${MASTER_USERS_TABLE.name}`,
          error: error.message,
          hint:
            "Run supabase/sql/master_users.sql in SQL Editor and expose the master schema in Supabase API settings.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      source: "supabase",
      table: `${MASTER_USERS_TABLE.schema}.${MASTER_USERS_TABLE.name}`,
      count: data?.length ?? 0,
      users: data ?? [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Supabase error";

    return NextResponse.json(
      {
        source: "supabase",
        error: message,
      },
      { status: 502 },
    );
  }
}
