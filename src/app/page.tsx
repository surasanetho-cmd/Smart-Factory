import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
          Smart Factory
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          Supabase connected
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          This app is wired for Supabase Auth and database access using the
          official Next.js SSR helpers. Add your project credentials to{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-900">
            .env.local
          </code>{" "}
          to finish setup.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/api/supabase/health"
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Check connection
          </Link>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 px-5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Supabase dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
