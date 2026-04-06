import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Edit2, ImageIcon, Columns3 } from "lucide-react";
import { InfoImageEditor } from "./InfoImageEditor";
import { TableColumnEditor } from "./TableColumnEditor";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { FieldType, TableColumn } from "@/lib/data";

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
  placeholder?: string;
  options?: string[];
  imageUrl?: string;
  columns?: TableColumn[];
}

interface SortableFieldItemProps {
  field: BuilderField;
  onRemove: (id: string) => void;
  onToggleRequired: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<BuilderField>) => void;
  /** Lista de secciones existentes para el selector */
  availableSections?: string[];
}

export function SortableFieldItem({
  field,
  onRemove,
  onToggleRequired,
  onUpdate,
  availableSections = [],
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(field.label);
  const [editType, setEditType] = useState<FieldType>(field.type);
  const [editPlaceholder, setEditPlaceholder] = useState(field.placeholder || "");
  const [editSection, setEditSection] = useState(field.section);
  // "__new__" es el valor especial para crear sección nueva
  const [sectionMode, setSectionMode] = useState<"existing" | "new">("existing");
  const [newSectionName, setNewSectionName] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | undefined>(field.imageUrl);
  const [editColumns, setEditColumns] = useState<TableColumn[]>(field.columns ?? []);

  const handleOpenEdit = (open: boolean) => {
    setIsEditing(open);
    if (open) {
      setEditLabel(field.label);
      setEditType(field.type);
      setEditPlaceholder(field.placeholder || "");
      setEditSection(field.section);
      setSectionMode("existing");
      setNewSectionName("");
      setEditImageUrl(field.imageUrl);
      setEditColumns(field.columns ?? []);
    }
  };

  const handleTypeChange = (newType: FieldType) => {
    setEditType(newType);
    // Resetear datos dependientes del tipo anterior
    if (newType !== "info_image") setEditImageUrl(undefined);
    if (newType !== "table") setEditColumns([]);
  };

  const handleSaveEdit = () => {
    const finalSection =
      sectionMode === "new" ? newSectionName.trim() || editSection : editSection;
    if (onUpdate) {
      onUpdate(field.id, {
        label: editLabel,
        type: editType,
        placeholder: ["text", "textarea", "number", "email"].includes(editType)
          ? editPlaceholder.trim() || undefined
          : undefined,
        section: finalSection,
        imageUrl: editType === "info_image" ? editImageUrl : undefined,
        columns: editType === "table" ? editColumns : undefined,
      });
    }
    setIsEditing(false);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isDragging
          ? "border-primary bg-primary/5 shadow-md relative z-10"
          : "border-border bg-muted/20 hover:bg-muted/40"
      } transition-colors`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"
        title="Arrastrar para reordenar"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">{field.label}</p>
          <Badge variant="outline" className="text-xs font-mono">
            {FIELD_TYPE_LABELS[field.type]}
          </Badge>
          {field.type === "info_image" && field.imageUrl && (
            <ImageIcon className="w-3 h-3 text-primary shrink-0" />
          )}
          {field.type === "table" && field.columns && field.columns.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Columns3 className="w-3 h-3" />
              {field.columns.length} col.: {field.columns.map((c) => c.label).join(", ")}
            </span>
          )}
          {field.type === "table" && (!field.columns || field.columns.length === 0) && (
            <span className="text-xs text-amber-600 font-medium">⚠ Sin columnas</span>
          )}
          {field.options && field.options.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({field.options.join(", ")})
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {field.type !== "info_image" && field.type !== "info_text" && (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none mr-2">
            <input
              type="checkbox"
              checked={field.required}
              onChange={() => onToggleRequired(field.id)}
              className="accent-primary"
            />
            Req.
          </label>
        )}

        {onUpdate && (
          <Dialog open={isEditing} onOpenChange={handleOpenEdit}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
                title="Editar campo"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar campo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label>Tipo de campo</Label>
                  <Select value={editType} onValueChange={(v) => handleTypeChange(v as FieldType)}>
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
                  <Label>Etiqueta del campo</Label>
                  <Input value={editLabel} onChange={e => setEditLabel(e.target.value)} />
                </div>
                {["text", "textarea", "number", "email"].includes(editType) && (
                  <div className="space-y-1.5">
                    <Label>Texto de ayuda (Placeholder)</Label>
                    <Input value={editPlaceholder} onChange={e => setEditPlaceholder(e.target.value)} placeholder="Ej: Ingrese su respuesta aquí..." />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Sección</Label>
                  <Select
                    value={sectionMode === "new" ? "__new__" : editSection}
                    onValueChange={(val) => {
                      if (val === "__new__") {
                        setSectionMode("new");
                      } else {
                        setSectionMode("existing");
                        setEditSection(val);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sección" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Secciones ya existentes (únicas) */}
                      {[...new Set([...availableSections, field.section])].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                      <SelectItem value="__new__">➕ Nueva sección…</SelectItem>
                    </SelectContent>
                  </Select>
                  {sectionMode === "new" && (
                    <Input
                      className="mt-2"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="Nombre de la nueva sección"
                      autoFocus
                    />
                  )}
                </div>

                {editType === "info_image" && (
                  <div className="space-y-2">
                    <Label>Imagen informativa</Label>
                    <InfoImageEditor value={editImageUrl} onChange={setEditImageUrl} />
                    <p className="text-[10px] text-muted-foreground italic">
                      Pegá una captura (Ctrl+V) o seleccioná un archivo. Esta imagen aparecerá sola o con el texto en el formulario público.
                    </p>
                  </div>
                )}

                {editType === "table" && (
                  <div className="space-y-2">
                    <Label>Estructura de la tabla</Label>
                    <p className="text-xs text-muted-foreground">
                      Editá las columnas. Podés importar desde Excel o agregar manualmente.
                    </p>
                    <TableColumnEditor
                      columns={editColumns}
                      onChange={setEditColumns}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={sectionMode === "new" && !newSectionName.trim()}
                >
                  Guardar cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <button
          type="button"
          onClick={() => onRemove(field.id)}
          className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
          aria-label="Eliminar campo"
          title="Eliminar campo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
