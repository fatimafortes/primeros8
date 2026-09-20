import { createClient } from "@/lib/supabase/server";
import { proposeNextWindow, acceptProposal } from "@/app/actions/scheduler";

type SiteAggregateRow = {
  zone: string;
  shift: string;
  response_count: number;
  avg_protective_action_ms: number | null;
  avg_assembly_ms: number | null;
};

type SchedulerProposalRow = {
  id: string;
  proposed_starts_at: string;
  proposed_ends_at: string;
  proposed_variant: string;
  target_zone: string | null;
  target_shift: string | null;
  rationale: string | null;
  status: string;
};

function formatMs(ms: number | null) {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(1)} s`;
}

function formatMx(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminDashboardPage(
  props: PageProps<"/admin/dashboard">,
) {
  const { error } = await props.searchParams;
  const supabase = await createClient();
  const { data } = await supabase.rpc("p8_site_aggregates");
  const aggregates = (data ?? []) as SiteAggregateRow[];

  const { data: latestProposal } = await supabase
    .from("p8_scheduler_proposals")
    .select(
      "id, proposed_starts_at, proposed_ends_at, proposed_variant, target_zone, target_shift, rationale, status",
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<SchedulerProposalRow>();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Resultados agregados</h1>
      <p className="text-sm text-zinc-400">
        Promedios por zona y turno. Nunca nombres, nunca filas
        individuales — mínimo 5 respuestas para mostrar un promedio.
      </p>

      {error && (
        <p className="text-sm text-red-400">
          {Array.isArray(error) ? error[0] : error}
        </p>
      )}

      <div className="grid gap-3">
        {(aggregates ?? []).map((row) => (
          <div
            key={`${row.zone}-${row.shift}`}
            className="rounded border border-white/10 p-4"
          >
            <p className="text-sm text-zinc-400">
              {row.zone} · {row.shift}
            </p>
            {row.response_count >= 5 ? (
              <div className="mt-2 flex gap-6">
                <div>
                  <p className="text-xs text-zinc-500">
                    Tiempo a protegerse
                  </p>
                  <p className="font-mono text-lg font-bold">
                    {formatMs(row.avg_protective_action_ms)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">
                    Llegada al punto de reunión
                  </p>
                  <p className="font-mono text-lg font-bold">
                    {formatMs(row.avg_assembly_ms)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Respuestas</p>
                  <p className="font-mono text-lg font-bold">
                    {row.response_count}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-amber-400">
                Datos insuficientes ({row.response_count} de 5 mínimo)
              </p>
            )}
          </div>
        ))}
        {(aggregates ?? []).length === 0 && (
          <p className="text-zinc-500">Sin resultados todavía.</p>
        )}
      </div>

      <section className="rounded border border-white/10 p-4">
        <h2 className="text-lg font-semibold">Próxima ventana sugerida</h2>
        {latestProposal && latestProposal.status === "pending" ? (
          <div className="mt-2 flex flex-col gap-2 text-sm">
            <p>
              {formatMx(latestProposal.proposed_starts_at)} –{" "}
              {formatMx(latestProposal.proposed_ends_at)} (CDMX)
            </p>
            <p className="text-zinc-400">
              {latestProposal.target_zone} · {latestProposal.target_shift} ·{" "}
              {latestProposal.proposed_variant}
            </p>
            <p className="text-xs text-zinc-500">{latestProposal.rationale}</p>
            <div className="flex gap-3">
              <form action={acceptProposal}>
                <input type="hidden" name="proposalId" value={latestProposal.id} />
                <button
                  type="submit"
                  className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950"
                >
                  Aceptar y programar
                </button>
              </form>
              <a
                href="/admin/drills/new"
                className="rounded-full border border-white/20 px-4 py-2 text-sm"
              >
                Programar otra manualmente
              </a>
            </div>
          </div>
        ) : (
          <form action={proposeNextWindow} className="mt-3">
            <button
              type="submit"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950"
            >
              Proponer siguiente ventana
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
