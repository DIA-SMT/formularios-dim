import {
  FileText,
  Inbox,
  CheckCircle2,
  Clock,
  ArrowRight,
  CalendarDays,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ResponsesTrendChart } from "./ResponsesTrendChart";
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

  const NAME_KEYWORDS = [
    "apellido", "nombre", "razón social", "razon social", "solicitante", "titular", "contribuyente", "interesado", "firmante",
  ];

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

  // Weekly report logic
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weeklyResponses = responses.filter((r) => new Date(r.submittedAt) >= oneWeekAgo);
  const weeklyTotal = weeklyResponses.length;

  const weeklyByForm = weeklyResponses.reduce((acc, r) => {
    acc[r.formName] = (acc[r.formName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const weeklyReportData = Object.entries(weeklyByForm)
    .sort((a, b) => b[1] - a[1]); // all forms with activity this week

  // Trend: responses per day over the last 14 days
  const TREND_DAYS = 14;
  const trendData = Array.from({ length: TREND_DAYS }).map((_, i) => {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - (TREND_DAYS - 1 - i));
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const count = responses.filter((r) => {
      const t = new Date(r.submittedAt);
      return t >= dayStart && t < dayEnd;
    }).length;

    return {
      date: dayStart.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
      }),
      count,
    };
  });

  const trendTotal = trendData.reduce((sum, d) => sum + d.count, 0);
  const trendDailyAvg = (trendTotal / TREND_DAYS).toFixed(1);
  const trendPeak = trendData.reduce(
    (max, d) => (d.count > max.count ? d : max),
    trendData[0]
  );

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Page header */}
      <AdminPageHeader title="Dashboard" icon={LayoutDashboard} />

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
                        {resp.citizenName?.startsWith("data:image") ? "Ciudadano" : resp.citizenName}
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

        {/* Weekly Report */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                <CardTitle className="text-base font-semibold">
                  Informe Semanal
                </CardTitle>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                Últimos 7 días
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Total completados en la semana</p>
              <p className="text-3xl font-bold text-indigo-700 mt-1">{weeklyTotal}</p>
            </div>
            
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Desglose por formulario
            </p>
            
            <div className="space-y-3">
              {weeklyReportData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 italic">Sin actividad reciente</p>
              ) : (
                weeklyReportData.map(([formName, count]) => (
                  <div key={formName} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground line-clamp-1 flex-1 pr-2">{formName}</span>
                      <span className="font-bold text-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(count / weeklyTotal) * 100}%` }}
                      />
                    </div>
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

      {/* Responses trend chart */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Respuestas por día
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                Promedio diario:{" "}
                <span className="font-semibold text-foreground">
                  {trendDailyAvg}
                </span>
              </span>
              <span>
                Día pico:{" "}
                <span className="font-semibold text-foreground">
                  {trendPeak?.count ?? 0} ({trendPeak?.date ?? "—"})
                </span>
              </span>
              <Badge variant="secondary" className="font-mono">
                Últimos 14 días
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {trendTotal === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">
              Sin respuestas en los últimos 14 días
            </p>
          ) : (
            <ResponsesTrendChart data={trendData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
