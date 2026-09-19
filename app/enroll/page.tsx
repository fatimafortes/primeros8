import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { enroll } from "@/app/actions/enrollments";
import { ZONES, SHIFTS } from "@/lib/validation";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";

export default async function EnrollPage(props: PageProps<"/enroll">) {
  const { error } = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("p8_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) redirect("/start");

  const { data: sites } = await supabase
    .from("p8_sites")
    .select("id, name")
    .order("created_at");

  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-10">
        <h1 className="text-2xl font-bold">Antes de empezar</h1>
        <p className="text-sm text-zinc-400">
          Participar es voluntario. Puedes salir en cualquier momento, sin
          avisarle a nadie.
        </p>

        {error && (
          <p className="text-sm text-red-400">
            {Array.isArray(error) ? error[0] : error}
          </p>
        )}

        <form action={enroll} className="flex flex-col gap-4">
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
            Zona
            <select
              name="zone"
              required
              className="rounded border border-white/20 bg-transparent px-3 py-2"
            >
              {ZONES.map((z) => (
                <option key={z} value={z} className="bg-zinc-950">
                  {z}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Turno
            <select
              name="shift"
              required
              className="rounded border border-white/20 bg-transparent px-3 py-2"
            >
              {SHIFTS.map((s) => (
                <option key={s} value={s} className="bg-zinc-950">
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="consentTiming" required className="mt-1" />
            Acepto que se mida mi tiempo de reacción durante un simulacro sin
            aviso.
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="consentIndividualScore"
              required
              className="mt-1"
            />
            Entiendo que mi resultado individual no se comparte con mi
            supervisor.
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="consentDelete" required className="mt-1" />
            Puedo borrar mis datos cuando quiera.
          </label>

          <fieldset className="flex flex-col gap-2 rounded border border-white/10 p-3">
            <legend className="px-1 text-sm">
              ¿Has vivido un sismo o un derrumbe que aún te afecte?
            </legend>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1">
                <input type="radio" name="traumaPrecheck" value="yes" required /> Sí
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="traumaPrecheck" value="no" required /> No
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="traumaPrecheck"
                  value="prefer_not_to_say"
                  required
                />{" "}
                Prefiero no decir
              </label>
            </div>
            <p className="text-xs text-emerald-400">
              ◆ Solo tú ves esta respuesta.
            </p>
          </fieldset>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="optedOutOfImmersion" className="mt-1" />
            Prefiero el camino sin inmersión (texto + vibración). Tiene el
            mismo cronómetro y el mismo resultado.
          </label>

          <button
            type="submit"
            className="rounded-full bg-amber-400 px-5 py-3 font-semibold text-zinc-950"
          >
            Acepto participar
          </button>
        </form>
      </div>
      <DisclaimerFooter />
    </div>
  );
}
