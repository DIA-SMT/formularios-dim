import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getResponses } from "@/app/actions/responses";
import { getForms } from "@/app/actions/forms";
import { ResponsesTable } from "./ResponsesTable";

export const dynamic = "force-dynamic";

export default async function RespuestasPage() {
  const responses = await getResponses();
  const forms = await getForms();

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Respuestas recibidas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Formularios completados por ciudadanos
          </p>
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      <ResponsesTable initialResponses={responses} forms={forms} />
    </div>
  );
}
