import { createClient } from "@/lib/supabase/server";
import { createDrillWindow, createTestWindow } from "@/app/actions/drills";
import { ZONES, SHIFTS } from "@/lib/validation";
import { SCENARIO_VARIANTS } from "@/lib/scheduler";

export default async function NewDrillWindowPage(
  props: PageProps<"/admin/drills/new">,
) {
  const { error } = await props.searchParams;
  const supabase = await createClient();
  const { data: sites } = await supabase
    .from("p8_sites")
    .select("id, name")
    .order("created_at");

  // Default to the site with the most enrolled workers, not just the
  // first one created — "first created" is exactly how a window ended
  // up pointed at a leftover test site nobody was actually enrolled
  // in.
  const { data: workerProfiles } = await supabase
    .from("p8_profiles")
    .select("site_id")
    .eq("role", "worker");

  const siteWorkerCounts = new Map<string, number>();
  for (const row of workerProfiles ?? []) {
    if (row.site_id) {
      siteWorkerCounts.set(row.site_id, (siteWorkerCounts.get(row.site_id) ?? 0) + 1);
    }
  }
  const defaultSiteId =
    [...siteWorkerCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
    sites?.[0]?.id ??
    "";

  return (
    <div className="max-w-sm">
      <h1 className="text-xl font-bold">Programar ventana</h1>
      {error && (
        <p className="mt-2 text-sm text-red-400">
          {Array.isArray(error) ? error[0] : error}
        </p>
      )}
      {(sites ?? []).length > 0 && (
        <div className="mt-4 rounded border border-amber-400/40 bg-zinc-900 p-3">
          <p className="text-sm font-semibold">Ventana de prueba</p>
          <p className="mt-1 text-xs text-zinc-500">
            Empieza ahora, termina en 30 minutos. Toda la planta, escenario
            por defecto — para probar el disparo o grabar el demo sin
            pelear con fechas.
          </p>
          <form action={createTestWindow} className="mt-2 flex flex-col gap-2">
            <label className="flex flex-col gap-1 text-sm">
              Sitio
              <select
                name="siteId"
                required
                defaultValue={defaultSiteId}
                className="rounded border border-white/20 bg-transparent px-3 py-2"
              >
                {(sites ?? []).map((site) => (
                  <option key={site.id} value={site.id} className="bg-zinc-950">
                    {site.name}
                    {siteWorkerCounts.get(site.id)
                      ? ` (${siteWorkerCounts.get(site.id)} trabajador(es))`
                      : " (sin trabajadores)"}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-950"
            >
              Crear ventana de prueba (ahora + 30 min)
            </button>
          </form>
        </div>
      )}

      <form action={createDrillWindow} className="mt-6 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Sitio
          <select
            name="siteId"
            required
            defaultValue={defaultSiteId}
            className="rounded border border-white/20 bg-transparent px-3 py-2"
          >
            {(sites ?? []).map((site) => (
              <option key={site.id} value={site.id} className="bg-zinc-950">
                {site.name}
                {siteWorkerCounts.get(site.id)
                  ? ` (${siteWorkerCounts.get(site.id)} trabajador(es))`
                  : " (sin trabajadores)"}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-zinc-500">
          Hora de Ciudad de México (UTC-6). El campo de tu navegador
          muestra fecha y hora — si solo ves fecha, agranda la ventana o
          usa el ícono de reloj del picker.
        </p>
        <label className="flex flex-col gap-1 text-sm">
          Empieza
          <input
            type="datetime-local"
            name="startsAt"
            required
            className="rounded border border-white/20 bg-transparent px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Termina
          <input
            type="datetime-local"
            name="endsAt"
            required
            className="rounded border border-white/20 bg-transparent px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Escenario
          <select
            name="scenarioVariant"
            className="rounded border border-white/20 bg-transparent px-3 py-2"
          >
            {SCENARIO_VARIANTS.map((v) => (
              <option key={v} value={v} className="bg-zinc-950">
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Zona objetivo (opcional — vacío = toda la planta)
          <select
            name="targetZone"
            defaultValue=""
            className="rounded border border-white/20 bg-transparent px-3 py-2"
          >
            <option value="" className="bg-zinc-950">
              Toda la planta
            </option>
            {ZONES.map((z) => (
              <option key={z} value={z} className="bg-zinc-950">
                {z}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Turno objetivo (opcional)
          <select
            name="targetShift"
            defaultValue=""
            className="rounded border border-white/20 bg-transparent px-3 py-2"
          >
            <option value="" className="bg-zinc-950">
              Todos los turnos
            </option>
            {SHIFTS.map((s) => (
              <option key={s} value={s} className="bg-zinc-950">
                {s}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-zinc-500">
          El momento exacto del disparo se elige al azar dentro de la
          ventana y no se muestra aquí ni en ninguna otra pantalla —
          eso es lo que lo hace un simulacro sin aviso.
        </p>
        <button
          type="submit"
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950"
        >
          Programar
        </button>
      </form>
    </div>
  );
}
