import { createClient } from "@/lib/supabase/server";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctaHref = user ? "/start" : "/login";
  const ctaLabel = user ? "Continuar" : "Entrar con Google";

  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-zinc-50">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-bold">PRIMEROS 8</h1>
        <p className="max-w-md text-lg text-zinc-300">
          El simulacro no avisa. Mide lo que haces en los primeros ocho
          segundos, no si llegaste a tiempo al punto de reunión.
        </p>
        <p className="max-w-md text-sm text-zinc-500">
          Sin fecha anunciada, sin ensayo previo. Tu resultado es tuyo — tu
          planta solo recibe promedios por zona, nunca nombres.
        </p>
        <a
          href={ctaHref}
          className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-zinc-950"
        >
          {ctaLabel}
        </a>
      </main>
      <DisclaimerFooter />
    </div>
  );
}
