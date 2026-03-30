"use client";

import { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  ClipboardPaste,
  GripVertical,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TableColumn } from "@/lib/data";

interface TableColumnEditorProps {
  columns: TableColumn[];
  onChange: (columns: TableColumn[]) => void;
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    || `col_${Date.now()}`;
}

function makeUnique(key: string, existing: string[]): string {
  if (!existing.includes(key)) return key;
  let i = 2;
  while (existing.includes(`${key}_${i}`)) i++;
  return `${key}_${i}`;
}

export function TableColumnEditor({ columns, onChange }: TableColumnEditorProps) {
  const [pasteText, setPasteText] = useState("");
  const [showImport, setShowImport] = useState(columns.length === 0);
  const pasteRef = useRef<HTMLTextAreaElement>(null);

  const parseAndImport = (raw: string) => {
    // Supports tab-separated (Excel copy) or semicolon-separated (CSV)
    const separator = raw.includes("\t") ? "\t" : ";";
    // Take only the first line if multiple lines were pasted
    const firstLine = raw.split(/\r?\n/)[0];
    const labels = firstLine
      .split(separator)
      .map((l) => l.trim())
      .filter(Boolean);

    if (labels.length === 0) return;

    const existingKeys: string[] = columns.map((c) => c.key);
    const newCols: TableColumn[] = labels.map((label) => {
      const base = slugify(label);
      const key = makeUnique(base, existingKeys);
      existingKeys.push(key);
      return { key, label, type: "text" };
    });

    onChange([...columns, ...newCols]);
    setPasteText("");
    setShowImport(false);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text");
    parseAndImport(raw);
  };

  const handleImportClick = () => {
    parseAndImport(pasteText);
  };

  const addColumn = () => {
    const existingKeys = columns.map((c) => c.key);
    const key = makeUnique(`col_${columns.length + 1}`, existingKeys);
    onChange([...columns, { key, label: "", type: "text" }]);
  };

  const updateColumn = (
    idx: number,
    patch: Partial<Omit<TableColumn, "key">>
  ) => {
    const updated = columns.map((col, i) => (i === idx ? { ...col, ...patch } : col));
    onChange(updated);
  };

  const removeColumn = (idx: number) => {
    onChange(columns.filter((_, i) => i !== idx));
  };

  const moveColumn = (from: number, to: number) => {
    const arr = [...columns];
    const [removed] = arr.splice(from, 1);
    arr.splice(to, 0, removed);
    onChange(arr);
  };

  return (
    <div className="space-y-4">
      {/* Import from Excel */}
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Importar columnas desde Excel</span>
          </div>
          <button
            type="button"
            onClick={() => setShowImport((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            {showImport ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {showImport && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Copiá la <strong>fila de encabezados</strong> de tu planilla de Excel
              (Ctrl+C) y pegá aquí (Ctrl+V). Las columnas se crean automáticamente.
            </p>
            <textarea
              ref={pasteRef}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              onPaste={handlePaste}
              placeholder={
                "Pegá aquí (Ctrl+V) los encabezados copiados de Excel…\n\nEjemplo: Línea\tUnidades\tPrecio\tTotal"
              }
              rows={3}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleImportClick}
              disabled={!pasteText.trim()}
              className="gap-2"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              Importar encabezados
            </Button>
          </div>
        )}
      </div>

      {/* Column list */}
      {columns.length > 0 ? (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Columnas definidas ({columns.length})
          </Label>
          <div className="space-y-1.5">
            {columns.map((col, idx) => (
              <div
                key={col.key}
                className="flex items-center gap-2 group rounded-md border border-border bg-background px-2 py-1.5 hover:bg-muted/30 transition-colors"
              >
                {/* Drag handle (visual only) */}
                <div className="flex flex-col gap-0.5 cursor-grab">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveColumn(idx, idx - 1)}
                    className="text-muted-foreground/50 hover:text-muted-foreground disabled:pointer-events-none leading-none text-xs"
                    title="Mover arriba"
                  >
                    ▴
                  </button>
                  <button
                    type="button"
                    disabled={idx === columns.length - 1}
                    onClick={() => moveColumn(idx, idx + 1)}
                    className="text-muted-foreground/50 hover:text-muted-foreground disabled:pointer-events-none leading-none text-xs"
                    title="Mover abajo"
                  >
                    ▾
                  </button>
                </div>

                <span className="text-xs text-muted-foreground w-5 shrink-0 text-center">
                  {idx + 1}
                </span>

                <Input
                  value={col.label}
                  onChange={(e) => updateColumn(idx, { label: e.target.value })}
                  placeholder="Nombre de columna"
                  className="h-7 text-sm flex-1 min-w-0"
                />

                <Select
                  value={col.type}
                  onValueChange={(v) =>
                    updateColumn(idx, { type: v as "text" | "number" })
                  }
                >
                  <SelectTrigger className="h-7 w-28 text-xs shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                  </SelectContent>
                </Select>

                <button
                  type="button"
                  onClick={() => removeColumn(idx)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 opacity-0 group-hover:opacity-100 shrink-0"
                  title="Eliminar columna"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
          <Table2 className="w-8 h-8 opacity-30" />
          <p className="text-sm">Sin columnas definidas</p>
          <p className="text-xs opacity-70">
            Importá desde Excel o agregá columnas manualmente
          </p>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addColumn}
        className="gap-2"
      >
        <Plus className="w-3.5 h-3.5" />
        Agregar columna manualmente
      </Button>
    </div>
  );
}
