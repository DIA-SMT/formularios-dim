"use client";

import { useTransition } from "react";
import { Download, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateResponseStatus } from "@/app/actions/responses";

export function ResponseActions({
  responseId,
  currentStatus,
}: {
  responseId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: "procesado" | "rechazado") => {
    startTransition(async () => {
      await updateResponseStatus(responseId, status);
    });
  };

  return (
    <Card className="border-border relative overflow-hidden print:hidden">
      {isPending && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Acciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {currentStatus !== "procesado" && (
          <Button
            onClick={() => handleStatusChange("procesado")}
            className="w-full gap-2"
            size="sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Marcar como procesado
          </Button>
        )}
        <Button variant="outline" className="w-full gap-2" size="sm">
          <Download className="w-4 h-4" />
          Descargar comprobante
        </Button>
        {currentStatus !== "rechazado" && (
          <Button
            onClick={() => handleStatusChange("rechazado")}
            variant="outline"
            className="w-full gap-2 text-destructive hover:text-destructive"
            size="sm"
          >
            <XCircle className="w-4 h-4" />
            Rechazar trámite
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
