"use client";

import { useTransition, useOptimistic } from "react";
import {
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateResponseStatus } from "@/app/actions/responses";

type Status = "pendiente" | "procesado" | "rechazado";

const STATUS_CONFIG: Record<
  Status,
  { label: string; icon: typeof Clock; bgClass: string; textClass: string; borderClass: string }
> = {
  pendiente: {
    label: "Pendiente de revisión",
    icon: Clock,
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
  procesado: {
    label: "Procesado",
    icon: CheckCircle2,
    bgClass: "bg-green-50",
    textClass: "text-green-700",
    borderClass: "border-green-200",
  },
  rechazado: {
    label: "Rechazado",
    icon: XCircle,
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
  },
};

export function ResponseActions({
  responseId,
  currentStatus,
}: {
  responseId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic<Status>(
    (currentStatus as Status) ?? "pendiente"
  );

  const handleStatusChange = (status: Status) => {
    startTransition(async () => {
      setOptimisticStatus(status);
      await updateResponseStatus(responseId, status);
    });
  };

  const config = STATUS_CONFIG[optimisticStatus] ?? STATUS_CONFIG.pendiente;
  const StatusIcon = config.icon;

  return (
    <Card className="border-border relative overflow-hidden print:hidden">
      {isPending && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="text-base">Estado del trámite</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status badge */}
        <div
          className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 ${config.bgClass} ${config.borderClass}`}
        >
          <StatusIcon className={`w-4 h-4 shrink-0 ${config.textClass}`} />
          <span className={`text-sm font-semibold ${config.textClass}`}>
            {config.label}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Acciones
          </p>

          {/* Download */}
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            size="sm"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" />
            Descargar comprobante
          </Button>

          {/* Transition buttons depending on current status */}
          {optimisticStatus === "pendiente" && (
            <>
              <Button
                onClick={() => handleStatusChange("procesado")}
                className="w-full gap-2"
                size="sm"
                disabled={isPending}
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar como procesado
              </Button>
              <Button
                onClick={() => handleStatusChange("rechazado")}
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
                size="sm"
                disabled={isPending}
              >
                <XCircle className="w-4 h-4" />
                Rechazar trámite
              </Button>
            </>
          )}

          {optimisticStatus === "procesado" && (
            <Button
              onClick={() => handleStatusChange("rechazado")}
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
              size="sm"
              disabled={isPending}
            >
              <XCircle className="w-4 h-4" />
              Rechazar trámite
            </Button>
          )}

          {optimisticStatus === "rechazado" && (
            <>
              <Button
                onClick={() => handleStatusChange("procesado")}
                className="w-full gap-2"
                size="sm"
                disabled={isPending}
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar como procesado
              </Button>
              <Button
                onClick={() => handleStatusChange("pendiente")}
                variant="outline"
                className="w-full gap-2"
                size="sm"
                disabled={isPending}
              >
                <RefreshCcw className="w-4 h-4" />
                Volver a pendiente
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
