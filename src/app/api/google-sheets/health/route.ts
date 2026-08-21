import { getMasterEmployeesSheetConfig } from "@/lib/google-sheets/config";
import { fetchEmployeesFromGoogleSheet } from "@/lib/master/employees";
import { NextResponse } from "next/server";

export async function GET() {
  const config = getMasterEmployeesSheetConfig();

  try {
    const { employees, totalRows } = await fetchEmployeesFromGoogleSheet();
    const sample = employees[0];

    return NextResponse.json({
      connected: true,
      status: "ok",
      sheetId: config.sheetId,
      sheetUrl: config.sheetUrl,
      totalEmployees: employees.length,
      totalRows,
      columns: [
        "employee_ID",
        "prefix",
        "first_Name",
        "last_Name",
        "position",
        "level",
        "department",
      ],
      sample,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Google Sheets error";

    return NextResponse.json(
      {
        connected: false,
        status: "connection_error",
        sheetId: config.sheetId,
        sheetUrl: config.sheetUrl,
        message,
      },
      { status: 502 },
    );
  }
}
