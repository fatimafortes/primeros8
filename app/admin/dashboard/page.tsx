import { createClient } from "@/lib/supabase/server";

type SiteAggregateRow = {
  zone: string;
  shift: string;
  response_count: number;
  avg_protective_action_ms: number | null;
  avg_assembly_ms: number | null;
};

function formatMs(ms: number | null) {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(1)} s`;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("p8_site_aggregates");
  const aggregates = (data ?? []) as SiteAggregateRow[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Resultados agregados</h1>
      <p className="text-sm text-zinc-400">
        Promedios por zona y turno. Nunca nombres, nunca filas
        individuales — mínimo 5 respuestas para mostrar un promedio.
      </p>

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
    </div>
  );
}
