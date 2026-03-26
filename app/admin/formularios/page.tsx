import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getForms } from "@/app/actions/forms";
import { FormsTable } from "./FormsTable";

export const dynamic = "force-dynamic";

export default async function AdminFormulariosPage() {
  const forms = await getForms();

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Formularios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestione los formularios disponibles para los ciudadanos
          </p>
        </div>
        <Link href="/admin/formularios/nuevo">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Nuevo formulario
          </Button>
        </Link>
      </div>

      <FormsTable initialForms={forms} />
    </div>
  );
}
