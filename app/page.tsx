import { PublicHeader } from "@/components/public/PublicHeader";
import { getForms } from "@/app/actions/forms";
import { HomeClient } from "./HomeClient";

// Disable cache to ensure newly published forms appear immediately
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const forms = await getForms();
  const publishedForms = forms.filter((f) => f.status === "published");

  return (
    <div className="theme-public min-h-screen flex flex-col bg-background relative">
      <PublicHeader overlay />

      <HomeClient publishedForms={publishedForms} />

      {/* Footer */}
      <footer
        className="mt-auto px-4 sm:px-6 lg:px-8 py-6 bg-primary border-t border-white/20"
      >
        <p className="text-xs text-white/90 font-medium text-left">
          © 2026 Desarrollado por la Dirección de IA, Municipalidad de San Miguel de Tucumán — Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}
