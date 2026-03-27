import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { FieldType } from "@/lib/data";

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

interface SortableFieldItemProps {
  field: BuilderField;
  onRemove: (id: string) => void;
  onToggleRequired: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<BuilderField>) => void;
}

export function SortableFieldItem({
  field,
  onRemove,
  onToggleRequired,
  onUpdate,
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
  const [editSection, setEditSection] = useState(field.section);

  const handleSaveEdit = () => {
    if (onUpdate) {
      onUpdate(field.id, { label: editLabel, section: editSection });
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
          {field.options && field.options.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({field.options.join(", ")})
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none mr-2">
          <input
            type="checkbox"
            checked={field.required}
            onChange={() => onToggleRequired(field.id)}
            className="accent-primary"
          />
          Req.
        </label>

        {onUpdate && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
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
                  <Label>Etiqueta del campo</Label>
                  <Input value={editLabel} onChange={e => setEditLabel(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Sección</Label>
                  <Input value={editSection} onChange={e => setEditSection(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Si cambias este nombre a una sección que no existe, se creará automáticamente.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button onClick={handleSaveEdit}>Guardar cambios</Button>
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
