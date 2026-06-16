import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getForms } from "@/app/actions/forms";
import { FormsTable } from "./FormsTable";

export const dynamic = "force-dynamic";

export default async function AdminFormulariosPage() {
  const forms = await getForms();

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <AdminPageHeader
        title="Formularios"
        icon={FileText}
        action={
          <Link href="/admin/formularios/nuevo">
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Nuevo formulario
            </Button>
          </Link>
        }
      />

      <FormsTable initialForms={forms} />
    </div>
  );
}
