#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

const DEFAULT_SHEET_ID = "1BRk-wf2VLcCSaFTpXcTAN7FD6KLcoJq1iIzybWcvqQo";

function loadEnvFile(path) {
  try {
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Optional local env file.
  }
}

loadEnvFile(resolve(rootDir, ".env.local"));
loadEnvFile(resolve(rootDir, ".env"));

const projectRef =
  process.env.SUPABASE_PROJECT_REF ??
  process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
    /https:\/\/([^.]+)\.supabase\.co/,
  )?.[1];

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const sheetId =
  process.env.GOOGLE_SHEETS_MASTER_EMPLOYEES_ID ?? DEFAULT_SHEET_ID;
const sheetGid = process.env.GOOGLE_SHEETS_MASTER_EMPLOYEES_GID ?? "0";

function log(step, message) {
  console.log(`[${step}] ${message}`);
}

function fail(message) {
  console.error(`\nERROR: ${message}`);
  process.exit(1);
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsv(text) {
  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map(parseCsvLine);
}

async function runMigration() {
  if (!projectRef) {
    fail("Missing project ref. Set NEXT_PUBLIC_SUPABASE_URL in .env.local.");
  }

  if (!accessToken) {
    fail(
      [
        "Missing SUPABASE_ACCESS_TOKEN.",
        "Create one at https://supabase.com/dashboard/account/tokens",
        "Then add it to .env.local and rerun: npm run setup:master",
      ].join("\n"),
    );
  }

  const sql = readFileSync(
    resolve(rootDir, "supabase/sql/master_users.sql"),
    "utf8",
  )
    .replace(/^--.*$/gm, "")
    .trim();

  log("migrate", `Creating master.users on project ${projectRef}...`);

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/migrations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "create_master_users",
        query: sql,
      }),
    },
  );

  const body = await response.text();
  let parsed = body;

  try {
    parsed = JSON.parse(body);
  } catch {
    // Keep raw text response.
  }

  if (!response.ok) {
    const message =
      typeof parsed === "object" && parsed !== null && "message" in parsed
        ? parsed.message
        : body;

    if (
      typeof message === "string" &&
      (message.toLowerCase().includes("already exists") ||
        message.toLowerCase().includes("duplicate"))
    ) {
      log("migrate", "master.users already exists, continuing.");
      return;
    }

    fail(`Migration failed (${response.status}): ${message}`);
  }

  log("migrate", "master.users created successfully.");
}

async function fetchEmployeesFromSheet() {
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheetGid}`;
  const response = await fetch(exportUrl);

  if (!response.ok) {
    fail(`Google Sheets export failed with status ${response.status}`);
  }

  const [header, ...rows] = parseCsv(await response.text());
  const expected = [
    "employee_ID",
    "prefix",
    "first_Name",
    "last_Name",
    "position",
    "level",
    "department",
  ];

  if (header.join(",") !== expected.join(",")) {
    fail(`Unexpected Google Sheet headers: ${header.join(", ")}`);
  }

  return rows
    .map((row) => ({
      employee_id: row[0]?.trim(),
      prefix: row[1]?.trim() ?? "",
      first_name: row[2]?.trim() ?? "",
      last_name: row[3]?.trim() ?? "",
      position: row[4]?.trim() ?? "",
      level: row[5]?.trim() ?? "",
      department: row[6]?.trim() ?? "",
      synced_at: new Date().toISOString(),
    }))
    .filter((row) => row.employee_id);
}

async function syncUsers() {
  if (!serviceRoleKey || !supabaseUrl) {
    log(
      "sync",
      "Skipped data sync. Add SUPABASE_SERVICE_ROLE_KEY to .env.local for automatic import.",
    );
    return 0;
  }

  const employees = await fetchEmployeesFromSheet();
  log("sync", `Importing ${employees.length} users from Google Sheets...`);

  const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
      "Content-Profile": "master",
    },
    body: JSON.stringify(employees),
  });

  if (!response.ok) {
    const message = await response.text();
    fail(`Sync failed (${response.status}): ${message}`);
  }

  log("sync", `Imported ${employees.length} users into master.users.`);
  return employees.length;
}

async function verifyUsers() {
  if (!serviceRoleKey || !supabaseUrl) {
    return;
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/users?select=employee_id&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Accept-Profile": "master",
      },
    },
  );

  if (response.ok) {
    const rows = await response.json();
    log(
      "verify",
      `master.users is reachable through Supabase API (${rows.length} sample row returned).`,
    );
    return;
  }

  log(
    "verify",
    [
      "Table exists, but custom schema may not be exposed yet.",
      "Supabase Dashboard -> Project Settings -> API -> Exposed schemas -> add `master`.",
    ].join(" "),
  );
}

async function main() {
  console.log("Smart Factory automatic master setup\n");

  await runMigration();
  await syncUsers();
  await verifyUsers();

  console.log("\nDone.");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
