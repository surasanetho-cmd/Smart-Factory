export const DEFAULT_MASTER_EMPLOYEES_SHEET_ID =
  "1BRk-wf2VLcCSaFTpXcTAN7FD6KLcoJq1iIzybWcvqQo";

export function getMasterEmployeesSheetConfig() {
  const sheetId =
    process.env.GOOGLE_SHEETS_MASTER_EMPLOYEES_ID ??
    DEFAULT_MASTER_EMPLOYEES_SHEET_ID;
  const gid = process.env.GOOGLE_SHEETS_MASTER_EMPLOYEES_GID ?? "0";

  return {
    sheetId,
    gid,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
    exportUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
  };
}
