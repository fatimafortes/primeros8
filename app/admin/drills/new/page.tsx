import { createClient } from "@/lib/supabase/server";
import { createDrillWindow } from "@/app/actions/drills";

export default async function NewDrillWindowPage(
  props: PageProps<"/admin/drills/new">,
) {
  const { error } = await props.searchParams;
  const supabase = await createClient();
  const { data: sites } = await supabase
    .from("p8_sites")
    .select("id, name")
    .order("created_at");

  return (
    <div className="max-w-sm">
      <h1 className="text-xl font-bold">Programar ventana</h1>
      {error && (
        <p className="mt-2 text-sm text-red-400">
          {Array.isArray(error) ? error[0] : error}
        </p>
      )}
      <form action={createDrillWindow} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Sitio
          <select
            name="siteId"
            required
            className="rounded border border-white/20 bg-transparent px-3 py-2"
          >
            {(sites ?? []).map((site) => (
              <option key={site.id} value={site.id} className="bg-zinc-950">
                {site.name}
              </option>
            ))}
          </select>
        </label>
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
