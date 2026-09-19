import { DisclaimerFooter } from "@/components/DisclaimerFooter";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-zinc-50">
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-3xl font-bold">PRIMEROS 8</h1>
        <p className="max-w-md text-zinc-400">
          Simulacro sin aviso, medido. En construcción.
        </p>
        <a href="/login" className="text-sm underline text-zinc-300">
          Iniciar sesión
        </a>
      </main>
      <DisclaimerFooter />
    </div>
  );
}
