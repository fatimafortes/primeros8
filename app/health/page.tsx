import { createClient } from "@/lib/supabase/server";

export default async function HealthPage() {
  const hasEnv =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let status: string;
  if (!hasEnv) {
    status =
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local (see .env.example).";
  } else {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.getSession();
      status = error ? `Supabase error: ${error.message}` : "Supabase: connected";
    } catch (err) {
      status = `Supabase client threw: ${(err as Error).message}`;
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <p className="font-mono text-sm">{status}</p>
    </main>
  );
}
