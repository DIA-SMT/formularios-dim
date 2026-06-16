import { Download, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getResponses } from "@/app/actions/responses";
import { getForms } from "@/app/actions/forms";
import { ResponsesTable } from "./ResponsesTable";

export const dynamic = "force-dynamic";

export default async function RespuestasPage() {
  const responses = await getResponses();
  const forms = await getForms();

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <AdminPageHeader
        title="Respuestas recibidas"
        icon={Inbox}
        action={
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        }
      />

      <ResponsesTable initialResponses={responses} forms={forms} />
    </div>
  );
}
