"use client";

import Link from "next/link";
import { CheckCircle2, Download, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SubmissionSuccessProps {
  tramiteCode: string;
  formName: string;
  destinationEmail: string;
}

export function SubmissionSuccess({
  tramiteCode,
  formName,
  destinationEmail,
}: SubmissionSuccessProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Formulario enviado correctamente
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Su formulario <strong>{formName}</strong> fue recibido y será procesado
            por el área correspondiente.
          </p>
        </div>

        <Card className="text-left border-border">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Código de trámite
              </span>
              <span className="font-mono font-bold text-foreground text-sm">
                {tramiteCode}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Estado</span>
              <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                Enviado
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Enviado a</span>
              <span className="text-sm text-foreground">{destinationEmail}</span>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Guarde el código de trámite para hacer seguimiento de su solicitud.
          Recibirá novedades en el correo electrónico que indicó en el formulario.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" />
            Descargar comprobante
          </Button>
          <Link href="/">
            <Button className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
