import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/start");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-950 text-zinc-50">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <p className="text-sm text-zinc-400">PRIMEROS 8 · Admin</p>
        <nav className="flex gap-4 text-sm">
          <a href="/admin/sites" className="underline">
            Sitios
          </a>
          <a href="/admin/drills" className="underline">
            Simulacros
          </a>
        </nav>
      </header>
      <div className="flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
