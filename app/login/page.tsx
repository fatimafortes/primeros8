"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function handleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-950 px-6 text-center text-zinc-50">
      <h1 className="text-2xl font-bold">PRIMEROS 8</h1>
      <button
        onClick={handleSignIn}
        className="rounded-full bg-white px-6 py-3 font-medium text-zinc-950"
      >
        Iniciar sesión con Google
      </button>
    </main>
  );
}
