"use client";

import React, { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Sparkles, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { SortableFieldItem } from "./SortableFieldItem";
import { Button } from "@/components/ui/button";
import type { FieldType, TableColumn } from "@/lib/data";

interface BuilderField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  section: string;
  options?: string[];
  imageUrl?: string;
  columns?: TableColumn[];
}

interface SortableFieldListProps {
  fields: BuilderField[];
  setFields: React.Dispatch<React.SetStateAction<BuilderField[]>>;
  removeField: (id: string) => void;
  toggleRequired: (id: string) => void;
  onUpdateField?: (id: string, updates: Partial<BuilderField>) => void;
  sectionDescriptions?: Record<string, string>;
  onUpdateSectionDescription?: (sectionName: string, description: string) => void;
  onRemoveSection?: (sectionName: string) => void;
}

function SectionHeader({ 
  name, 
  description, 
  onUpdateDescription 
}: { 
  name: string; 
  description: string; 
  onUpdateDescription?: (name: string, desc: string) => void; 
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState(description);

  // Sync value if props change externally
  React.useEffect(() => {
    setValue(description);
  }, [description]);

  const handleBlur = () => {
    setIsEditing(false);
    if (onUpdateDescription && value !== description) {
      onUpdateDescription(name, value);
    }
  };

  return (
    <div className="mb-3 space-y-1.5 px-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {name}
      </p>
      {onUpdateDescription ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={handleBlur}
          placeholder="Escribí una introducción o explicación opcional para esta sección..."
          className={`w-full text-sm bg-transparent resize-none overflow-hidden transition-colors ${
            isEditing 
              ? "border border-border rounded-md p-2 min-h-[60px] bg-background focus:outline-none focus:ring-1 focus:ring-primary" 
              : "border border-transparent p-0 italic text-muted-foreground hover:bg-muted/30 hover:cursor-text rounded-sm"
          } ${!isEditing && !value ? "h-[24px]" : ""}`}
          rows={isEditing || value ? Math.max(2, value.split('\\n').length) : 1}
        />
      ) : (
        value && <p className="text-sm italic text-muted-foreground whitespace-pre-wrap">{value}</p>
      )}
    </div>
  );
}

export function SortableFieldList({
  fields,
  setFields,
  removeField,
  toggleRequired,
  onUpdateField,
  sectionDescriptions = {},
  onUpdateSectionDescription,
  onRemoveSection,
}: SortableFieldListProps) {
  // Requires dragging to travel at least 5px to avoid accidental trigger on clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        // Solo reordena posición; el campo conserva su sección original.
        // Para cambiar de sección usar el botón Editar de cada campo.
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const moveSection = (sectionName: string, direction: "up" | "down") => {
    setFields((prev) => {
      const sectionIndices = prev.reduce<number[]>((acc, f, idx) => {
        if (f.section === sectionName) acc.push(idx);
        return acc;
      }, []);

      if (sectionIndices.length === 0) return prev;

      const firstIdx = sectionIndices[0];
      const lastIdx = sectionIndices[sectionIndices.length - 1];

      const newItems = [...prev];
      const sectionFields = newItems.splice(firstIdx, sectionIndices.length);

      if (direction === "up") {
        // Find the boundary of the previous section
        if (firstIdx === 0) return prev;
        let prevSectionStart = 0;
        for (let i = firstIdx - 1; i >= 0; i--) {
          if (i === 0 || prev[i - 1].section !== prev[i].section) {
            prevSectionStart = i;
            break;
          }
        }
        newItems.splice(prevSectionStart, 0, ...sectionFields);
      } else {
        // Find the boundary of the next section
        if (lastIdx === prev.length - 1) return prev;
        let nextSectionEnd = prev.length - 1;
        for (let i = lastIdx + 1; i < prev.length; i++) {
          if (i === prev.length - 1 || prev[i + 1].section !== prev[i].section) {
            nextSectionEnd = i;
            break;
          }
        }
        // Adjustment because we already spliced the sectionFields out of newItems
        const relativeInsertPos = nextSectionEnd - sectionIndices.length + 1;
        newItems.splice(relativeInsertPos, 0, ...sectionFields);
      }

      return newItems;
    });
  };

  // Lista de secciones únicas (en orden de aparición) para el selector de edición
  const uniqueSections = useMemo(
    () => [...new Set(fields.map((f) => f.section))],
    [fields]
  );

  // Chunk array linearly by section changes.
  // This allows correct visual rendering while maintaining standard sorting behavior on the 1D flat array mapping.
  const fieldsBySection = useMemo(() => {
    const sections: { name: string; items: BuilderField[] }[] = [];
    if (fields.length === 0) return sections;

    let currentSectionName = fields[0].section;
    let currentItems: BuilderField[] = [];

    for (const field of fields) {
      if (field.section !== currentSectionName) {
        sections.push({ name: currentSectionName, items: currentItems });
        currentSectionName = field.section;
        currentItems = [];
      }
      currentItems.push(field);
    }

    if (currentItems.length > 0) {
      sections.push({ name: currentSectionName, items: currentItems });
    }

    return sections;
  }, [fields]);

  if (fields.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-border rounded-lg space-y-2">
        <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto" />
        <p className="text-sm font-medium text-muted-foreground">
          Sin campos aún
        </p>
        <p className="text-xs text-muted-foreground">
          Agrega campos manualmente o subí un PDF y analizalo.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6">
          {fieldsBySection.map((section, idx) => (
            <div key={`${section.name}-${idx}`} className="group/section relative">
              <div className="absolute top-0 right-1 flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveSection(section.name, "up")}
                  disabled={idx === 0}
                  title="Subir sección"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveSection(section.name, "down")}
                  disabled={idx === fieldsBySection.length - 1}
                  title="Bajar sección"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                {onRemoveSection && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 ml-1"
                    onClick={() => {
                      if (window.confirm(`¿Estás seguro de eliminar la sección "${section.name}" y todos sus campos?`)) {
                        onRemoveSection(section.name);
                      }
                    }}
                    title="Eliminar sección"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <SectionHeader 
                name={section.name}
                description={sectionDescriptions[section.name] || ""}
                onUpdateDescription={onUpdateSectionDescription}
              />
              <div className="space-y-2">
                {section.items.map((field) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    onRemove={removeField}
                    onToggleRequired={toggleRequired}
                    onUpdate={onUpdateField}
                    availableSections={uniqueSections}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
