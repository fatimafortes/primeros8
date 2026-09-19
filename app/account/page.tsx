import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center p-8 text-center">
        <p>
          No hay sesión.{" "}
          <a href="/login" className="underline">
            Inicia sesión
          </a>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="text-sm text-zinc-400">Sesión activa</p>
      <p className="font-mono text-sm">{user.email}</p>
      <p className="font-mono text-xs text-zinc-500">
        auth.users.id: {user.id}
      </p>
      <form action="/auth/signout" method="post">
        <button className="mt-4 rounded-full border border-zinc-700 px-4 py-2 text-sm">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
