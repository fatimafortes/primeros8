import { createClient } from "@/lib/supabase/server";
import { createSite } from "@/app/actions/sites";

export default async function AdminSitesPage(props: PageProps<"/admin/sites">) {
  const { error } = await props.searchParams;
  const supabase = await createClient();
  const { data: sites } = await supabase
    .from("p8_sites")
    .select("id, name, timezone")
    .order("created_at");

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-xl font-bold">Sitios</h1>
        <ul className="mt-4 flex flex-col gap-2">
          {(sites ?? []).map((site) => (
            <li key={site.id} className="rounded border border-white/10 p-3">
              {site.name} <span className="text-zinc-500">· {site.timezone}</span>
            </li>
          ))}
          {(sites ?? []).length === 0 && (
            <li className="text-zinc-500">Sin sitios todavía.</li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Nuevo sitio</h2>
        {error && (
          <p className="mt-2 text-sm text-red-400">
            {Array.isArray(error) ? error[0] : error}
          </p>
        )}
        <form action={createSite} className="mt-3 flex max-w-sm flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Nombre
            <input
              name="name"
              required
              maxLength={120}
              className="rounded border border-white/20 bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Zona horaria
            <input
              name="timezone"
              required
              maxLength={60}
              defaultValue="America/Mexico_City"
              className="rounded border border-white/20 bg-transparent px-3 py-2"
            />
          </label>
          <p className="text-xs text-zinc-500">
            Nota: un sitio nuevo no aparece en esta lista hasta que tu perfil
            de admin apunte a él — limitación conocida de este slice, un
            admin por sitio, asignado por seed.
          </p>
          <button
            type="submit"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950"
          >
            Crear sitio
          </button>
        </form>
      </section>
    </div>
  );
}
