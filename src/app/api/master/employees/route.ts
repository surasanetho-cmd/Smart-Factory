import { fetchEmployeesFromGoogleSheet } from "@/lib/master/employees";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department")?.trim().toUpperCase();
  const limit = Number(searchParams.get("limit") ?? "0");

  try {
    const { config, employees } = await fetchEmployeesFromGoogleSheet();
    let filtered = employees;

    if (department) {
      filtered = filtered.filter(
        (employee) => employee.department.toUpperCase() === department,
      );
    }

    if (Number.isFinite(limit) && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    return NextResponse.json({
      source: "google_sheets",
      sheetUrl: config.sheetUrl,
      count: filtered.length,
      employees: filtered,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Google Sheets error";

    return NextResponse.json(
      {
        source: "google_sheets",
        error: message,
      },
      { status: 502 },
    );
  }
}
