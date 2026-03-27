"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Save,
  Send,
  Eye,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Form, FieldType } from "@/lib/data";
import { updateForm } from "@/app/actions/forms";
import { SortableFieldList } from "@/components/admin/SortableFieldList";

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Texto corto",
  textarea: "Texto largo",
  number: "Número",
  date: "Fecha",
  select: "Lista desplegable",
  checkbox: "Casilla de verificación",
  radio: "Opción múltiple",
  email: "Correo electrónico",
  file: "Archivo adjunto",
  signature: "Firma manuscrita",
  table: "Tabla editable (DDJJ)",
};

interface BuilderField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  section: string;
  options?: string[];
}

export function EditFormClient({ form }: { form: Form }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(form.name);
  const [description, setDescription] = useState(form.description || "");
  const [area, setArea] = useState(form.area || "");
  const [email, setEmail] = useState(form.email || "");
  const [requiresSignature, setRequiresSignature] = useState(form.requiresSignature);
  const [allowAttachments, setAllowAttachments] = useState(form.allowAttachments);
  
  // Fields state
  const [fields, setFields] = useState<BuilderField[]>(() => {
    return (form.fields || []).map((f: any) => ({
      ...f,
      options: f.options ? f.options.map((opt: any) => typeof opt === 'string' ? opt : opt.label) : undefined
    }));
  });
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldSection, setNewFieldSection] = useState("General");
  const [activeTab, setActiveTab] = useState<"info" | "campos">("info");

  const addField = () => {
    if (!newFieldLabel.trim()) return;
    setFields((prev) => [
      ...prev,
      {
        id: `field-${Date.now()}`,
        type: newFieldType,
        label: newFieldLabel.trim(),
        required: false,
        section: newFieldSection || "General",
      },
    ]);
    setNewFieldLabel("");
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleRequired = (id: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  };

  const updateField = (id: string, updates: Partial<BuilderField>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleSave = (publish: boolean) => {
    startTransition(async () => {
      const dataToSave = {
        name,
        description,
        area,
        email,
        requiresSignature,
        allowAttachments,
        fields: fields.map((f) => ({
          ...f,
          options: f.options
            ? f.options.map((opt) => ({
                label: opt,
                value: opt.toLowerCase().replace(/\s+/g, "_"),
              }))
            : undefined,
        })),
        status: publish ? ("published" as const) : form.status,
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
    <div className="space-y-6 pb-24 md:pb-0 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/formularios">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            disabled={isPending}
          >
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            disabled={isPending}
          >
            <Eye className="w-4 h-4" />
            Vista previa
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit border border-border">
        {(["info", "campos"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "info" ? (
              "Información general"
            ) : (
              <span className="flex items-center gap-1.5">
                Campos del formulario
                {fields.length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {fields.length}
                  </Badge>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "info" && (
        <div className="space-y-5">
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
        </div>
      )}

      {activeTab === "campos" && (
        <div className="space-y-5">
          {/* Add field manually */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Agregar campo manualmente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo de campo</Label>
                  <Select
                    value={newFieldType}
                    onValueChange={(v) => setNewFieldType(v as FieldType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map(
                        (type) => (
                          <SelectItem key={type} value={type}>
                            {FIELD_TYPE_LABELS[type]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Etiqueta del campo</Label>
                  <Input
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="Nombre del campo"
                    onKeyDown={(e) => e.key === "Enter" && addField()}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sección</Label>
                  <Input
                    value={newFieldSection}
                    onChange={(e) => setNewFieldSection(e.target.value)}
                    placeholder="Ej: Datos del contribuyente"
                  />
                </div>
              </div>
              <Button
                type="button"
                className="mt-3 gap-2"
                size="sm"
                onClick={addField}
              >
                <Plus className="w-4 h-4" />
                Agregar campo
              </Button>
            </CardContent>
          </Card>

          {/* Fields list grouped by section */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Campos del formulario
                </CardTitle>
                <Badge variant="secondary">
                  {fields.length} campo{fields.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SortableFieldList
                fields={fields}
                setFields={setFields}
                removeField={removeField}
                toggleRequired={toggleRequired}
                onUpdateField={updateField}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-3">
        {isPending ? (
          <Button disabled className="gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando...
          </Button>
        ) : (
          <>
            <Button
              onClick={() => handleSave(false)}
              variant="outline"
              className="gap-2"
            >
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
