import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Download,
  Mail,
  Calendar,
  FileText,
  PenLine,
  Paperclip,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getResponse } from "@/app/actions/responses";
import { ResponseActions } from "./ResponseActions";
import { PdfDownloadButton } from "./PdfDownloadButton";

const statusConfig: Record<
  string,
  { label: string; icon: typeof CheckCircle2; color: string; badgeClass: string }
> = {
  pendiente: {
    label: "Pendiente de revisión",
    icon: Clock,
    color: "text-amber-600",
    badgeClass: "bg-amber-100 text-amber-800",
  },
  procesado: {
    label: "Procesado",
    icon: CheckCircle2,
    color: "text-green-600",
    badgeClass: "bg-green-100 text-green-800",
  },
  rechazado: {
    label: "Rechazado",
    icon: XCircle,
    color: "text-red-600",
    badgeClass: "bg-red-100 text-red-800",
  },
};

export default async function RespuestaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getResponse(id);

  if (!response) return notFound();

  const status = statusConfig[response.status] || statusConfig.pendiente;
  const StatusIcon = status.icon;

  const rawData = response.data as Record<string, unknown>;

  // Separate signature fields embedded in data (data:image/...) from normal fields
  const isDataUrl = (v: unknown): v is string =>
    typeof v === "string" && v.startsWith("data:");

  const isTableRows = (v: unknown): boolean =>
    Array.isArray(v) && v.length > 0 && typeof v[0] === "object";

  // Embedded signatures stored in data (e.g. key === "firma" or "firma_hab")
  const embeddedSignatures = Object.entries(rawData).filter(([, v]) =>
    isDataUrl(v)
  );

  // Filter out data-URL fields and keep meaningful fields for display
  const dataEntries = Object.entries(rawData).filter(
    ([, value]) => !isDataUrl(value)
  );

  const fieldLabels: Record<string, string> = {
    periodo: "Período",
    anio: "Año",
    tipo_presentacion: "Tipo de presentación",
    apellido_nombre: "Apellido y Nombre / Razón Social",
    lineas_omnibus: "Línea/s de Ómnibus",
    domicilio_comercial: "Domicilio Comercial",
    cuit: "CUIT",
    nombre_firmante: "Nombre del Firmante",
    caracter: "Carácter",
    fecha: "Fecha",
    razon_social: "Razón Social",
    cuit_comercio: "CUIT",
    email_contacto: "Email de Contacto",
    domicilio_local: "Domicilio del Local",
    rubro: "Rubro",
    superficie: "Superficie (m²)",
    fecha_solicitud: "Fecha de Solicitud",
  };

  // Determine the best signature image: prefer response.signature, then embedded data ones
  const signatureImage =
    response.signature && !response.signature.startsWith("data:image/png;base64,mock")
      ? response.signature
      : embeddedSignatures.length > 0
      ? String(embeddedSignatures[0][1])
      : null;

  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 print:hidden">
        <Link href="/admin/respuestas">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">
              Detalle de respuesta
            </h1>
            <Badge
              className={`text-xs ${status.badgeClass} hover:${status.badgeClass}`}
            >
              <StatusIcon className={`w-3 h-3 mr-1 ${status.color}`} />
              {status.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-mono mt-0.5">
            {response.tramiteCode}
          </p>
        </div>
        <PdfDownloadButton />
      </div>

      {/* Print-only Header (replaces the interactive one) */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold">Detalle de Respuesta - {response.tramiteCode}</h1>
        <p className="text-sm text-muted-foreground mt-1">Estado: {status.label}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column - main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Citizen info */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Datos del ciudadano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nombre / Razón social</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {response.citizenName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Correo electrónico</p>
                  <p className="text-sm text-foreground mt-0.5">{response.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form data */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Datos del formulario</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                {dataEntries.map(([key, value]) => {
                  const label = fieldLabels[key] ?? key;

                  // Table rows → render as a scrollable mini-table
                  if (isTableRows(value)) {
                    const rows = value as Record<string, unknown>[];
                    const cols = Object.keys(rows[0]);
                    return (
                      <div key={key} className="py-3 first:pt-0 last:pb-0 space-y-2">
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd>
                          <div className="overflow-x-auto rounded-md border border-border">
                            <table className="w-full text-xs min-w-[400px]">
                              <thead>
                                <tr className="bg-muted/60">
                                  {cols.map((col) => (
                                    <th key={col} className="px-3 py-2 text-left font-semibold text-foreground border-b border-border whitespace-nowrap">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row, i) => (
                                  <tr key={i} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                                    {cols.map((col) => (
                                      <td key={col} className="px-3 py-2 text-foreground">
                                        {String(row[col] ?? "")}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </dd>
                      </div>
                    );
                  }

                  // Normal scalar value
                  return (
                    <div
                      key={key}
                      className="grid grid-cols-2 gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="text-sm text-foreground font-medium break-words">
                        {String(value)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </CardContent>
          </Card>

          {/* Signature */}
          {(signatureImage || response.signature) && (
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-base">Firma capturada</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg p-3 bg-white">
                  {signatureImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={signatureImage}
                      alt={`Firma de ${response.citizenName}`}
                      className="max-h-36 max-w-full object-contain mx-auto block"
                    />
                  ) : (
                    <div className="h-28 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground italic">
                        [Firma registrada — imagen no disponible]
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Firma del solicitante — {response.citizenName}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {response.hasAttachments && (
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-base">Archivos adjuntos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["documentacion_respaldatoria.pdf", "constancia_inscripcion.pdf"].map(
                    (file) => (
                      <div
                        key={file}
                        className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground">{file}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 gap-1.5">
                          <Download className="w-3.5 h-3.5" />
                          <span className="text-xs">Descargar</span>
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - metadata */}
        <div className="space-y-5">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Información del trámite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Código de trámite</p>
                <p className="text-sm font-bold text-foreground mt-0.5 font-mono">
                  {response.tramiteCode}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Formulario</p>
                <p className="text-sm font-medium text-foreground mt-0.5 leading-snug">
                  {response.formName}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de envío</p>
                  <p className="text-sm text-foreground mt-0.5">
                    {new Date(response.submittedAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Mail de destino</p>
                  <p className="text-sm text-foreground mt-0.5 break-all">
                    {response.destinationEmail}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <ResponseActions responseId={response.id} currentStatus={response.status} />
        </div>
      </div>
    </div>
  );
}
