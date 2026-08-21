import { getMasterEmployeesSheetConfig } from "@/lib/google-sheets/config";
import { parseCsv } from "@/lib/google-sheets/parse-csv";

export type EmployeeMaster = {
  employeeId: string;
  prefix: string;
  firstName: string;
  lastName: string;
  position: string;
  level: string;
  department: string;
};

const EMPLOYEE_HEADERS = [
  "employee_ID",
  "prefix",
  "first_Name",
  "last_Name",
  "position",
  "level",
  "department",
] as const;

function rowToEmployee(row: string[]): EmployeeMaster | null {
  if (row.length < EMPLOYEE_HEADERS.length) {
    return null;
  }

  const [employeeId, prefix, firstName, lastName, position, level, department] =
    row;

  if (!employeeId?.trim()) {
    return null;
  }

  return {
    employeeId: employeeId.trim(),
    prefix: prefix?.trim() ?? "",
    firstName: firstName?.trim() ?? "",
    lastName: lastName?.trim() ?? "",
    position: position?.trim() ?? "",
    level: level?.trim() ?? "",
    department: department?.trim() ?? "",
  };
}

export async function fetchEmployeesFromGoogleSheet() {
  const config = getMasterEmployeesSheetConfig();
  const response = await fetch(config.exportUrl, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(
      `Google Sheets export failed with status ${response.status}`,
    );
  }

  const csv = await response.text();
  const rows = parseCsv(csv);

  if (rows.length === 0) {
    throw new Error("Google Sheet is empty");
  }

  const [header, ...dataRows] = rows;
  const normalizedHeader = header.map((cell) => cell.trim());

  if (normalizedHeader.join(",") !== EMPLOYEE_HEADERS.join(",")) {
    throw new Error(
      `Unexpected sheet headers: ${normalizedHeader.join(", ") || "(empty)"}`,
    );
  }

  const employees = dataRows
    .map(rowToEmployee)
    .filter((employee): employee is EmployeeMaster => employee !== null);

  return {
    config,
    employees,
    totalRows: dataRows.length,
  };
}

export function employeeToDbRow(employee: EmployeeMaster) {
  return {
    employee_id: employee.employeeId,
    prefix: employee.prefix,
    first_name: employee.firstName,
    last_name: employee.lastName,
    position: employee.position,
    level: employee.level,
    department: employee.department,
    synced_at: new Date().toISOString(),
  };
}
