import { PublicHeader } from "@/components/public/PublicHeader";
import { getForms } from "@/app/actions/forms";
import { HomeClient } from "./HomeClient";

// Disable cache to ensure newly published forms appear immediately
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const forms = await getForms();
  const publishedForms = forms.filter((f) => f.status === "published");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <HomeClient publishedForms={publishedForms} />

      {/* Footer */}
      <footer
        className="mt-auto px-4 py-6 border-t border-border/50"
        style={{ background: "var(--sidebar)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/60">
            © 2024 Municipalidad de San Martín — Todos los derechos reservados
          </p>
          <p className="text-xs text-white/60">
            Mesa de Entradas Digital — División Sistemas y Tecnología
          </p>
        </div>
      </footer>
    </div>
  );
}
