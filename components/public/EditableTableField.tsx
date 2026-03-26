"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { TableColumn } from "@/lib/data";

interface EditableTableFieldProps {
  columns: TableColumn[];
  onChange?: (rows: Record<string, string | number>[]) => void;
}

function createEmptyRow(columns: TableColumn[]): Record<string, string | number> {
  const row: Record<string, string | number> = {};
  columns.forEach((col) => {
    row[col.key] = col.type === "number" ? 0 : "";
  });
  return row;
}

export function EditableTableField({ columns, onChange }: EditableTableFieldProps) {
  const [rows, setRows] = useState<Record<string, string | number>[]>([
    createEmptyRow(columns),
  ]);

  const numericCols = columns.filter((c) => c.type === "number");

  const computeTotals = (rows: Record<string, string | number>[]) => {
    const totals: Record<string, number> = {};
    numericCols.forEach((col) => {
      totals[col.key] = rows.reduce(
        (sum, row) => sum + (Number(row[col.key]) || 0),
        0
      );
    });
    return totals;
  };

  const totals = computeTotals(rows);

  const updateCell = (rowIdx: number, colKey: string, value: string) => {
    const updated = rows.map((row, i) => {
      if (i !== rowIdx) return row;
      return {
        ...row,
        [colKey]: columns.find((c) => c.key === colKey)?.type === "number"
          ? Number(value) || 0
          : value,
      };
    });
    setRows(updated);
    onChange?.(updated);
  };

  const addRow = () => {
    const updated = [...rows, createEmptyRow(columns)];
    setRows(updated);
    onChange?.(updated);
  };

  const removeRow = (idx: number) => {
    if (rows.length <= 1) return;
    const updated = rows.filter((_, i) => i !== idx);
    setRows(updated);
    onChange?.(updated);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-muted/70">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2.5 text-left text-xs font-semibold text-foreground border-b border-border whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-foreground border-b border-border w-10">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                {columns.map((col) => (
                  <td key={col.key} className="px-2 py-1.5">
                    <Input
                      type={col.type === "number" ? "number" : "text"}
                      value={row[col.key]}
                      onChange={(e) => updateCell(rowIdx, col.key, e.target.value)}
                      className="h-8 text-sm border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/50 min-w-[80px]"
                      placeholder={col.type === "number" ? "0" : "—"}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIdx)}
                    disabled={rows.length <= 1}
                    className="text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors p-1"
                    aria-label="Eliminar fila"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {/* Totals row */}
            {numericCols.length > 0 && (
              <tr className="bg-muted/60 font-semibold">
                {columns.map((col, idx) => (
                  <td key={col.key} className="px-3 py-2 text-sm">
                    {idx === 0 ? (
                      <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                        Total
                      </span>
                    ) : col.type === "number" ? (
                      <span className="text-foreground">
                        {totals[col.key].toLocaleString("es-AR")}
                      </span>
                    ) : (
                      ""
                    )}
                  </td>
                ))}
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className="gap-2"
      >
        <Plus className="w-4 h-4" />
        Agregar fila
      </Button>
    </div>
  );
}
