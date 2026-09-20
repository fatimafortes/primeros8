import { createClient } from "@/lib/supabase/server";
import { fireWindowNow } from "@/app/actions/drills";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Programado",
  fired: "Disparado",
  completed: "Completado",
  cancelled: "Cancelado",
};

type DrillWindowRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  p8_sites: { name: string } | { name: string }[] | null;
};

function siteName(row: DrillWindowRow): string {
  const rel = row.p8_sites;
  if (!rel) return "sitio desconocido";
  return Array.isArray(rel) ? (rel[0]?.name ?? "sitio desconocido") : rel.name;
}

function isWithinWindow(startsAt: string, endsAt: string): boolean {
  const now = Date.now();
  return now >= new Date(startsAt).getTime() && now <= new Date(endsAt).getTime();
}

// Explicit timeZone, not the viewer's device setting — this is the
// "echo it back so I can confirm" display, so it has to be unambiguous
// regardless of what timezone whoever's looking at it is actually in.
function formatMx(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminDrillsPage(props: PageProps<"/admin/drills">) {
  const { error, created } = await props.searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("p8_drill_windows")
    .select("id, starts_at, ends_at, status, p8_sites(name)")
    .order("starts_at", { ascending: false });
  const windows = (data ?? []) as DrillWindowRow[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Simulacros</h1>
        <a
          href="/admin/drills/new"
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950"
        >
          Programar ventana
        </a>
      </div>

      {error && (
        <p className="text-sm text-red-400">
          {Array.isArray(error) ? error[0] : error}
        </p>
      )}
      {created && (
        <p className="text-sm text-emerald-400">
          Ventana creada en{" "}
          <span className="font-semibold">
            {Array.isArray(created) ? created[0] : created}
          </span>
          .
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {windows.map((w) => {
          const canFireManually =
            w.status === "scheduled" && isWithinWindow(w.starts_at, w.ends_at);

          return (
            <li
              key={w.id}
              className="flex items-center justify-between rounded border border-white/10 p-3 text-sm"
            >
              <div>
                <p className="font-semibold">{siteName(w)}</p>
                <span className="font-mono">
                  {formatMx(w.starts_at)} – {formatMx(w.ends_at)}
                </span>{" "}
                <span className="text-zinc-500">
                  (CDMX) · {STATUS_LABEL[w.status] ?? w.status}
                </span>
              </div>
              {canFireManually && (
                <form action={fireWindowNow}>
                  <input type="hidden" name="windowId" value={w.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-amber-400 px-3 py-1 text-xs font-medium text-amber-400"
                    title="Anulación de demo — el disparo normal es automático y sin aviso"
                  >
                    Disparar ahora (anulación de demo)
                  </button>
                </form>
              )}
            </li>
          );
        })}
        {windows.length === 0 && (
          <li className="text-zinc-500">Sin ventanas programadas todavía.</li>
        )}
      </ul>
    </div>
  );
}
