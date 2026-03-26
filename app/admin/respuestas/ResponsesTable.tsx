"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Inbox,
  Paperclip,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormResponse, Form } from "@/lib/data";

const statusColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  procesado: "bg-green-100 text-green-800",
  rechazado: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  procesado: "Procesado",
  rechazado: "Rechazado",
};

export function ResponsesTable({
  initialResponses,
  forms,
}: {
  initialResponses: FormResponse[];
  forms: Form[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formFilter, setFormFilter] = useState("all");

  const filtered = initialResponses.filter((r) => {
    const matchesQuery =
      r.citizenName.toLowerCase().includes(query.toLowerCase()) ||
      r.tramiteCode.toLowerCase().includes(query.toLowerCase()) ||
      r.formName.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesForm = formFilter === "all" || r.formId === formFilter;
    return matchesQuery && matchesStatus && matchesForm;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, código..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="procesado">Procesado</SelectItem>
            <SelectItem value="rechazado">Rechazado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={formFilter} onValueChange={setFormFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Formulario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los formularios</SelectItem>
            {forms.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.code} — {f.name.slice(0, 30)}...
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length}{" "}
        {filtered.length === 1 ? "respuesta encontrada" : "respuestas encontradas"}
      </p>

      <Card className="border-border">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Sin respuestas</p>
              <p className="text-xs text-muted-foreground mt-1">
                No hay respuestas que coincidan con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Ciudadano
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                      Formulario
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                      Código
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                      Fecha
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                      Extras
                    </th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((resp) => (
                    <tr
                      key={resp.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">
                          {resp.citizenName}
                        </p>
                        <p className="text-xs text-muted-foreground">{resp.email}</p>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <p className="text-sm text-foreground line-clamp-1 max-w-[200px]">
                          {resp.formName}
                        </p>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="font-mono text-xs text-muted-foreground">
                          {resp.tramiteCode}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground hidden lg:table-cell">
                        {new Date(resp.submittedAt).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          className={`text-xs ${statusColors[resp.status]} hover:${statusColors[resp.status]}`}
                        >
                          {statusLabels[resp.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {resp.signature && (
                            <div title="Incluye firma"><PenLine className="w-3.5 h-3.5" /></div>
                          )}
                          {resp.hasAttachments && (
                            <div title="Tiene adjuntos"><Paperclip className="w-3.5 h-3.5" /></div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/admin/respuestas/${resp.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronRight className="w-4 h-4" />
                            <span className="sr-only">Ver detalle</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
