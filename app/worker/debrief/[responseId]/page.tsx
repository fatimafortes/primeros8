import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";
import { deleteMyData } from "@/app/actions/responses";

function formatMs(ms: number | null | undefined) {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(1)} s`;
}

export default async function DebriefPage(
  props: PageProps<"/worker/debrief/[responseId]">,
) {
  const { responseId } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: response } = await supabase
    .from("p8_responses")
    .select("id, time_to_protective_action_ms, time_to_assembly_ms")
    .eq("id", responseId)
    .maybeSingle();
  if (!response) notFound();

  const { data: zoneAggregate } = await supabase
    .rpc("p8_my_zone_aggregate")
    .maybeSingle<{
      response_count: number;
      avg_protective_action_ms: number | null;
      avg_assembly_ms: number | null;
    }>();

  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-10">
        <h1 className="text-2xl font-bold">Tu resultado</h1>
        <p className="text-sm text-zinc-400">
          Solo tú lo ves. Tu planta recibe promedios por zona, nunca
          nombres.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded border border-white/10 p-3">
            <span className="text-sm text-zinc-400">
              Tiempo hasta protegerte
            </span>
            <span className="font-mono text-xl font-bold">
              {formatMs(response.time_to_protective_action_ms)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded border border-white/10 p-3">
            <span className="text-sm text-zinc-400">
              Llegada al punto de reunión
            </span>
            <span className="font-mono text-xl font-bold">
              {formatMs(response.time_to_assembly_ms)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded border border-white/10 p-3">
            <span className="text-sm text-zinc-400">Promedio de tu zona</span>
            <span className="font-mono text-sm font-bold">
              {zoneAggregate?.avg_protective_action_ms != null
                ? formatMs(zoneAggregate.avg_protective_action_ms)
                : "Aún no hay suficientes datos de tu zona"}
            </span>
          </div>
        </div>

        <div className="rounded border-l-2 border-amber-400 bg-zinc-900 p-3 text-xs text-zinc-300">
          No existe evidencia de que este ensayo cambie el comportamiento en
          un sismo real. Mide el ensayo, no la supervivencia. Completarlo no
          es competencia certificada ni cumplimiento legal.
        </div>

        <a
          href="/worker"
          className="rounded-full bg-amber-400 px-5 py-3 text-center font-semibold text-zinc-950"
        >
          Volver
        </a>
        <form action={deleteMyData}>
          <button
            type="submit"
            className="w-full text-center text-sm text-zinc-500 underline"
          >
            Borrar mis datos
          </button>
        </form>
      </div>
      <DisclaimerFooter />
    </div>
  );
}
