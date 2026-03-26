"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  Pencil,
  Eye,
  Trash2,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Form } from "@/lib/data";
import { deleteForm, toggleFormStatus } from "@/app/actions/forms";

export function FormsTable({ initialForms }: { initialForms: Form[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [isPending, startTransition] = useTransition();

  const filtered = initialForms.filter((f) => {
    const matchesQuery =
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.code.toLowerCase().includes(query.toLowerCase()) ||
      f.area.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este formulario? Esta acción no se puede deshacer y eliminará también todas sus respuestas.")) {
      startTransition(async () => {
        await deleteForm(id);
      });
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    startTransition(async () => {
      await toggleFormStatus(id, currentStatus);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar formulario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="capitalize"
            >
              {s === "all" ? "Todos" : s === "published" ? "Publicados" : "Borradores"}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-border relative">
        {isPending && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">
                No se encontraron formularios
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Intente con otro filtro o cree un nuevo formulario.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Formulario
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                      Área
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                      Actualizado
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="px-4 py-3 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((form) => (
                    <tr
                      key={form.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">
                            {form.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            {form.code}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground hidden md:table-cell">
                        {form.area}
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground hidden lg:table-cell">
                        {new Date(form.updatedAt).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          className={
                            form.status === "published"
                              ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs"
                          }
                        >
                          {form.status === "published" ? "Publicado" : "Borrador"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/formulario/${form.id}`}
                                target="_blank"
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Vista previa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/formularios/${form.id}/editar`}
                                className="gap-2"
                              >
                                <Pencil className="w-4 h-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(form.id, form.status)}
                              className="gap-2 cursor-pointer"
                            >
                              <FileText className="w-4 h-4" />
                              {form.status === "published"
                                ? "Pasar a borrador"
                                : "Publicar"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(form.id)}
                              className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
