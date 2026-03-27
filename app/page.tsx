import { PublicHeader } from "@/components/public/PublicHeader";
import { getForms } from "@/app/actions/forms";
import { HomeClient } from "./HomeClient";

// Disable cache to ensure newly published forms appear immediately
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const forms = await getForms();
  const publishedForms = forms.filter((f) => f.status === "published");

  return (
    <div className="theme-public min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <HomeClient publishedForms={publishedForms} />

      {/* Footer */}
      <footer
        className="mt-auto px-4 py-6 bg-primary border-t border-white/20"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/90 font-medium">
            © 2026 Municipalidad de San Miguel de Tucumán — Todos los derechos reservados
          </p>
          <p className="text-xs text-white/90 font-medium">
            Dirección de Ingresos Municipales — Sistemas y Tecnología
          </p>
        </div>
      </footer>
    </div>
  );
}
