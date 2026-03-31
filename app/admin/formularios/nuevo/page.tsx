"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  Save,
  Send,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
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
import type { FieldType } from "@/lib/data";
import { createForm } from "@/app/actions/forms";
import { SortableFieldList } from "@/components/admin/SortableFieldList";
import { InfoImageEditor } from "@/components/admin/InfoImageEditor";

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
  info_image: "Imagen informativa (solo lectura)",
  info_text: "Texto informativo (solo lectura)",
};

interface BuilderField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  section: string;
  options?: string[];
  imageUrl?: string;
}

type AnalysisStatus = "idle" | "loading" | "success" | "error";

export default function NuevoFormularioPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useState(false);

  // Form metadata
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("Dirección de Ingresos Municipales (DIM)");
  const [email, setEmail] = useState("dim@sanmigueldetucuman.gob.ar");
  const [requiresSignature, setRequiresSignature] = useState(false);
  const [allowAttachments, setAllowAttachments] = useState(false);

  // PDF & AI state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<number>(0);

  // Fields
  const [fields, setFields] = useState<BuilderField[]>([]);
  const [sectionDescriptions, setSectionDescriptions] = useState<Record<string, string>>({});
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldSection, setNewFieldSection] = useState("General");
  // "__new__" activa el input de texto libre para nombre de nueva seccón
  const [newFieldSectionMode, setNewFieldSectionMode] = useState<"existing" | "new">("existing");
  const [newFieldSectionCustom, setNewFieldSectionCustom] = useState("");
  const [newFieldImageUrl, setNewFieldImageUrl] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"info" | "campos">("info");

  // Secciones únicas derivadas de los campos actuales
  const existingSections = [...new Set(fields.map((f) => f.section))].filter(Boolean);

  // -------------------------------------------------------
  // PDF AI Analysis
  // -------------------------------------------------------
  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    setAnalysisStatus("idle");
    setAnalysisError(null);
  };

  const removePdf = () => {
    setPdfFile(null);
    setAnalysisStatus("idle");
    setAnalysisError(null);
    setAiSuggestions(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const analyzePdf = async () => {
    if (!pdfFile) return;

    setAnalysisStatus("loading");
    setAnalysisError(null);

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile); // keep parameter name 'pdf' for API compatibility

      const res = await fetch("/api/admin/analizar-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Error al analizar el PDF.");
      }

      const { result } = data;

      // Populate form metadata if fields are empty
      if (!name && result.formName) setName(result.formName);
      if (!code && result.formCode) setCode(result.formCode);
      if (!description && result.description) setDescription(result.description);

      // Map AI fields to BuilderField format
      const newFields: BuilderField[] = (result.fields ?? []).map(
        (f: {
          label: string;
          type: FieldType;
          section: string;
          required: boolean;
          options: string[] | null;
        }) => ({
          id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: f.type,
          label: f.label,
          required: f.required,
          section: f.section,
          options: f.options ?? undefined,
        })
      );

      // Append new fields to existing ones
      setFields((prev) => [...prev, ...newFields]);
      setAiSuggestions(newFields.length);
      setAnalysisStatus("success");

      // Switch to fields tab so the user sees the result
      setActiveTab("campos");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      setAnalysisError(message);
      setAnalysisStatus("error");
    }
  };

  // -------------------------------------------------------
  // Manual field management
  // -------------------------------------------------------
  const addField = () => {
    // Si es imagen informativa o texto, permitimos etiqueta vacía (usamos default)
    if (!newFieldLabel.trim() && newFieldType !== "info_image" && newFieldType !== "info_text") return;
    
    const finalLabel = newFieldLabel.trim() || (newFieldType === "info_image" ? "Imagen informativa" : newFieldType === "info_text" ? "Texto informativo" : "");
    const section =
      newFieldSectionMode === "new"
        ? newFieldSectionCustom.trim() || "General"
        : newFieldSection;
    const newField: BuilderField = {
      id: `field-${Date.now()}`,
      type: newFieldType,
      label: finalLabel,
      required: false,
      section,
      imageUrl: newFieldImageUrl,
    };
    setFields((prev) => {
      // Insertar justo después del último campo de la misma sección
      let lastIdx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].section === section) { lastIdx = i; break; }
      }
      if (lastIdx === -1) {
        // Sección nueva: agregar al final
        return [...prev, newField];
      }
      const copy = [...prev];
      copy.splice(lastIdx + 1, 0, newField);
      return copy;
    });
    setNewFieldLabel("");
    setNewFieldImageUrl(undefined);
    // Si se creó una nueva sección, la sección activa pasa a ser esa
    if (newFieldSectionMode === "new" && newFieldSectionCustom.trim()) {
      setNewFieldSection(newFieldSectionCustom.trim());
      setNewFieldSectionMode("existing");
      setNewFieldSectionCustom("");
    }
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
    if (!name.trim()) {
      alert("El nombre del formulario es obligatorio.");
      return;
    }

    startTransition(true);

    const formData = {
      name,
      code,
      description,
      area,
      email,
      requiresSignature,
      allowAttachments,
      status: publish ? "published" as const : "draft" as const,
      fields: fields.map(f => ({
        ...f,
        options: f.options ? f.options.map(opt => ({ label: opt, value: opt.toLowerCase().replace(/\s+/g, '_') })) : undefined
      })),
      sectionDescriptions,
    };

    createForm(formData).then((res) => {
      if (res.error) {
        alert(res.error);
        startTransition(false);
      } else {
        setTimeout(() => router.push("/admin/formularios"), 800);
      }
    });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/formularios">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nuevo formulario</h1>
          <p className="text-sm text-muted-foreground">
            Cargue un PDF para que la IA genere los campos, o construya el formulario manualmente
          </p>
        </div>
      </div>

      {/* PDF AI Upload — always visible at top */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <CardTitle className="text-base text-primary">
              Generar con IA (PDF o Imagen)
            </CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">
              Recomendado
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Subí un PDF o capturas de imagen (JPG/PNG) del formulario. La IA detectará 
            los campos y los agregará al listado. Podés subir varias partes para un mismo formulario.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {!pdfFile ? (
            <div
              className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:bg-primary/5 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file?.type === "application/pdf" || file?.type.startsWith("image/")) {
                  setPdfFile(file);
                  setAnalysisStatus("idle");
                  setAnalysisError(null);
                }
              }}
            >
              <Upload className="w-8 h-8 text-primary/60 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">
                Arrastrá el archivo aquí o hacé clic para seleccionarlo
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG o PNG hasta 10 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf,image/*"
                className="hidden"
                onChange={handlePdfSelect}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* File info row */}
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {pdfFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removePdf}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Quitar archivo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status feedback */}
              {analysisStatus === "success" && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    La IA detectó <strong>{aiSuggestions} campos</strong>. Revisalos en
                    la pestaña &quot;Campos del formulario&quot; antes de publicar.
                  </span>
                </div>
              )}
              {analysisStatus === "error" && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* Action button */}
              {analysisStatus !== "success" && (
                <Button
                  onClick={analyzePdf}
                  disabled={analysisStatus === "loading"}
                  className="gap-2 w-full sm:w-auto"
                >
                  {analysisStatus === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analizando archivo con IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analizar y agregar campos
                    </>
                  )}
                </Button>
              )}
              {analysisStatus === "success" && (
                <Button
                  variant="outline"
                  onClick={removePdf}
                  className="gap-2"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  Subir otra parte (Agregar más)
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
            {tab === "info" ? "Información general" : (
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

      {/* INFO TAB */}
      {activeTab === "info" && (
        <div className="space-y-5">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Datos del formulario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nombre del formulario <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: F.O.T. 21 - Tasa por Ocupación..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-sm font-medium">
                    Código / Número
                  </Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej: FOT-21"
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción del trámite y su finalidad..."
                  rows={3}
                  className="resize-none"
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
                    placeholder="Ej: Dirección de Ingresos Municipales"
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
                    placeholder="dim@sanmigueldetucuman.gob.ar"
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
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Permite adjuntar archivos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    El ciudadano puede adjuntar documentos de respaldo
                  </p>
                </div>
                <Switch
                  checked={allowAttachments}
                  onCheckedChange={setAllowAttachments}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CAMPOS TAB */}
      {activeTab === "campos" && (
        <div className="space-y-5">
          {/* Add field manually */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agregar campo manualmente</CardTitle>
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
                      {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {FIELD_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{newFieldType === "info_text" ? "Texto informativo" : "Etiqueta del campo"}</Label>
                  {newFieldType === "info_text" ? (
                    <Textarea
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder="Escriba el texto informativo aquí..."
                      className="resize-y"
                    />
                  ) : (
                    <Input
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder="Nombre del campo"
                      onKeyDown={(e) => e.key === "Enter" && addField()}
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sección</Label>
                  <Select
                    value={newFieldSectionMode === "new" ? "__new__" : newFieldSection}
                    onValueChange={(val) => {
                      if (val === "__new__") {
                        setNewFieldSectionMode("new");
                        setNewFieldSectionCustom("");
                      } else {
                        setNewFieldSectionMode("existing");
                        setNewFieldSection(val);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sección" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Si no hay secciones, mostrar "General" por defecto */}
                      {(existingSections.length > 0 ? existingSections : ["General"]).map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                      <SelectItem value="__new__">➕ Nueva sección…</SelectItem>
                    </SelectContent>
                  </Select>
                  {newFieldSectionMode === "new" && (
                    <Input
                      className="mt-2"
                      value={newFieldSectionCustom}
                      onChange={(e) => setNewFieldSectionCustom(e.target.value)}
                      placeholder="Nombre de la nueva sección"
                      autoFocus
                    />
                  )}
                </div>
              </div>

              {newFieldType === "info_image" && (
                <div className="mt-4 border-t pt-4">
                  <Label className="text-sm font-medium mb-2 block animate-in fade-in slide-in-from-top-1">
                    Pegar imagen informativa / instructivo
                  </Label>
                  <InfoImageEditor value={newFieldImageUrl} onChange={setNewFieldImageUrl} />
                </div>
              )}

              <Button
                type="button"
                className="mt-4 gap-2 w-full sm:w-auto"
                onClick={addField}
                disabled={(newFieldType === "info_image" && !newFieldImageUrl) || (newFieldType === "info_text" && !newFieldLabel.trim())}
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
                <CardTitle className="text-base">Campos del formulario</CardTitle>
                <div className="flex items-center gap-2">
                  {analysisStatus === "success" && (
                    <Badge className="text-xs gap-1 bg-primary/10 text-primary border-primary/20">
                      <Sparkles className="w-3 h-3" />
                      Generado por IA
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {fields.length} campo{fields.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SortableFieldList
                fields={fields}
                setFields={setFields}
                removeField={removeField}
                toggleRequired={toggleRequired}
                onUpdateField={updateField}
                sectionDescriptions={sectionDescriptions}
                onUpdateSectionDescription={(name, desc) => 
                  setSectionDescriptions(prev => ({...prev, [name]: desc}))
                }
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action bar */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
              Guardar como borrador
            </Button>
            <Button onClick={() => handleSave(true)} className="gap-2">
              <Send className="w-4 h-4" />
              Publicar formulario
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
