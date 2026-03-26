"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Send, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Form } from "@/lib/data";
import { updateForm } from "@/app/actions/forms";

export function EditFormClient({ form }: { form: Form }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(form.name);
  const [description, setDescription] = useState(form.description);
  const [area, setArea] = useState(form.area);
  const [email, setEmail] = useState(form.email);
  const [requiresSignature, setRequiresSignature] = useState(form.requiresSignature);
  const [allowAttachments, setAllowAttachments] = useState(form.allowAttachments);

  const handleSave = (publish: boolean) => {
    startTransition(async () => {
      const dataToSave = {
        name,
        description,
        area,
        email,
        requiresSignature,
        allowAttachments,
        status: publish ? "published" as const : form.status,
      };

      const result = await updateForm(form.id, dataToSave);
      
      if (result.success) {
        // Give time for UI feedback
        setTimeout(() => {
          router.push("/admin/formularios");
        }, 800);
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/formularios">
          <Button variant="ghost" size="sm" className="gap-1.5" disabled={isPending}>
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground truncate">
              Editar formulario
            </h1>
            <Badge variant="secondary" className="font-mono text-xs shrink-0">
              {form.code}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {form.name}
          </p>
        </div>
        <Link href={`/formulario/${form.id}`} target="_blank">
          <Button variant="outline" size="sm" className="gap-2 shrink-0" disabled={isPending}>
            <Eye className="w-4 h-4" />
            Vista previa
          </Button>
        </Link>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Información general</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre del formulario
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isPending}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="area" className="text-sm font-medium">
                Área o Dependencia
              </Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Mail institucional destino
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Opciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Requiere firma manuscrita
              </p>
              <p className="text-xs text-muted-foreground">
                El ciudadano deberá firmar digitalmente
              </p>
            </div>
            <Switch
              checked={requiresSignature}
              onCheckedChange={setRequiresSignature}
              disabled={isPending}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Permite adjuntar archivos
              </p>
              <p className="text-xs text-muted-foreground">
                El ciudadano puede adjuntar documentos
              </p>
            </div>
            <Switch
              checked={allowAttachments}
              onCheckedChange={setAllowAttachments}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Field summary */}
      <Card className="border-border bg-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Campos del formulario</CardTitle>
            <Badge variant="secondary">{form.fields.length} campos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {form.fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm text-foreground">{field.label}</p>
                  <p className="text-xs text-muted-foreground">{field.section}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {field.type}
                  </Badge>
                  {field.required && (
                    <span className="text-xs text-destructive font-medium">*</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Para agregar o reordenar campos, use el constructor completo al crear
            un nuevo formulario.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {isPending ? (
          <Button disabled className="gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando...
          </Button>
        ) : (
          <>
            <Button onClick={() => handleSave(false)} variant="outline" className="gap-2">
              <Save className="w-4 h-4" />
              Guardar cambios
            </Button>
            {form.status !== "published" && (
              <Button onClick={() => handleSave(true)} className="gap-2">
                <Send className="w-4 h-4" />
                Guardar y publicar
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
