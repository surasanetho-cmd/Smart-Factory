import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
          Smart Factory
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          Connected services
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Supabase and Google Sheets master data are wired into this app. Use
          the health checks below to verify each connection.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Supabase
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Database and authentication backend.
            </p>
            <Link
              href="/api/supabase/health"
              className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
            >
              Check Supabase
            </Link>
          </section>

          <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Google Sheets master
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Employee master from the shared spreadsheet.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/api/google-sheets/health"
                className="inline-flex text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Check Google Sheets
              </Link>
              <Link
                href="/api/master/employees?limit=5"
                className="inline-flex text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Preview employees (Sheet)
              </Link>
              <Link
                href="/api/master/users?limit=5"
                className="inline-flex text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Preview users (Supabase)
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
