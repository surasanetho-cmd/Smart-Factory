import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/env";
import { NextResponse } from "next/server";

export async function GET() {
  const env = getSupabaseEnv();

  if (!env.isConfigured) {
    return NextResponse.json(
      {
        connected: false,
        status: "missing_env",
        missing: env.missing,
        message:
          "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
      },
      { status: 503 },
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        {
          connected: false,
          status: "auth_error",
          message: error.message,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      connected: true,
      status: "ok",
      projectUrl: env.url,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Supabase error";

    return NextResponse.json(
      {
        connected: false,
        status: "connection_error",
        message,
      },
      { status: 502 },
    );
  }
}
