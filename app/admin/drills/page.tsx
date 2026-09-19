import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Programado",
  fired: "Disparado",
  completed: "Completado",
  cancelled: "Cancelado",
};

export default async function AdminDrillsPage() {
  const supabase = await createClient();
  const { data: windows } = await supabase
    .from("p8_drill_windows")
    .select("id, starts_at, ends_at, status, p8_sites(name)")
    .order("starts_at", { ascending: false });

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

      <ul className="flex flex-col gap-2">
        {(windows ?? []).map((w) => (
          <li key={w.id} className="rounded border border-white/10 p-3 text-sm">
            <span className="font-mono">
              {new Date(w.starts_at).toLocaleString("es-MX")} –{" "}
              {new Date(w.ends_at).toLocaleString("es-MX")}
            </span>{" "}
            <span className="text-zinc-500">
              · {STATUS_LABEL[w.status] ?? w.status}
            </span>
          </li>
        ))}
        {(windows ?? []).length === 0 && (
          <li className="text-zinc-500">Sin ventanas programadas todavía.</li>
        )}
      </ul>
    </div>
  );
}
