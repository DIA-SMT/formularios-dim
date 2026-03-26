import {
  FileText,
  Inbox,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getForms } from "@/app/actions/forms";
import { getResponses } from "@/app/actions/responses";

const statusColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  procesado: "bg-green-100 text-green-800",
  rechazado: "bg-red-100 text-red-800",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [forms, responses] = await Promise.all([
    getForms(),
    getResponses()
  ]);

  const stats = [
    {
      label: "Formularios publicados",
      value: forms.filter((f) => f.status === "published").length,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Respuestas recibidas",
      value: responses.length,
      icon: Inbox,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Procesadas",
      value: responses.filter((r) => r.status === "procesado").length,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pendientes",
      value: responses.filter((r) => r.status === "pendiente").length,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const recentResponses = responses.slice(0, 3);
  const activeForms = forms.filter((f) => f.status === "published").slice(0, 5);

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Dirección de Ingresos Municipales — Municipalidad de San Miguel de Tucumán
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent responses */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Últimas respuestas
              </CardTitle>
              <Link href="/admin/respuestas">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Ver todas <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recentResponses.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No hay respuestas aún</p>
              ) : (
                recentResponses.map((resp) => (
                  <div
                    key={resp.id}
                    className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {resp.citizenName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {resp.formName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {resp.tramiteCode}
                      </p>
                    </div>
                    <Badge
                      className={`text-xs shrink-0 ${statusColors[resp.status]} hover:${statusColors[resp.status]}`}
                    >
                      {resp.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Published forms */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Formularios activos
              </CardTitle>
              <Link href="/admin/formularios">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Gestionar <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {activeForms.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No hay formularios publicados</p>
              ) : (
                activeForms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {form.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{form.area}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs shrink-0"
                    >
                      {form.code}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick tip */}
      <Card className="border-border bg-blue-50/60">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Consejo de administración
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Puede crear nuevos formularios digitales desde la sección{" "}
                <Link
                  href="/admin/formularios/nuevo"
                  className="text-primary underline underline-offset-2"
                >
                  Formularios &rarr; Nuevo formulario
                </Link>
                . Los formularios en borrador no son visibles para el ciudadano
                hasta que sean publicados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
