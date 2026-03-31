"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignaturePad } from "./SignaturePad";
import { EditableTableField } from "./EditableTableField";
import { ClipboardPaste, X, ImageIcon } from "lucide-react";
import type { FormField } from "@/lib/data";
interface DynamicFieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

export function DynamicFieldRenderer({
  field,
  value,
  onChange,
  error,
}: DynamicFieldRendererProps) {
  const inputClass = `${error ? "border-destructive focus-visible:ring-destructive/30" : ""}`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderInput = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        );

      case "date":
        return (
          <Input
            id={field.id}
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className={`resize-none ${inputClass}`}
          />
        );

      case "select":
        return (
          <Select
            value={(value as string) ?? ""}
            onValueChange={(val) => onChange(val)}
          >
            <SelectTrigger id={field.id} className={inputClass}>
              <SelectValue placeholder="Seleccione una opción" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt: { value: string; label: string }) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            {field.options?.map((opt: { value: string; label: string }) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={(value as string) === opt.value}
                  onChange={() => onChange(opt.value)}
                  className="accent-primary"
                />
                <span className="text-sm text-foreground">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id={field.id}
              checked={(value as boolean) ?? false}
              onCheckedChange={(checked) => onChange(checked)}
            />
            <Label htmlFor={field.id} className="text-sm cursor-pointer">
              {field.label}
            </Label>
          </div>
        );

      case "file":
        return (
          <div className="border border-dashed border-border rounded-lg p-4 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
            <input
              id={field.id}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                onChange(file ? file.name : null);
              }}
            />
            <label htmlFor={field.id} className="cursor-pointer">
              {value ? (
                <p className="text-sm text-foreground font-medium">{value as string}</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Haga clic para seleccionar un archivo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPG, PNG — máx. 5 MB
                  </p>
                </>
              )}
            </label>
          </div>
        );

      case "signature":
        return (
          <SignaturePad
            onChange={(dataUrl) => onChange(dataUrl)}
            value={value as string | null}
          />
        );

      case "table":
        return (
          <EditableTableField
            columns={field.columns ?? []}
            onChange={(rows) => onChange(rows)}
          />
        );

      case "info_image":
        // Solo lectura: imagen embebida por el admin
        return field.imageUrl ? (
          <img
            src={field.imageUrl}
            alt={field.label || "Imagen informativa"}
            className="w-full rounded-md border border-border object-contain max-h-[500px]"
          />
        ) : null;

      default:
        return null;
    }
  };

  // info_image o info_text no necesitan input — se renderizan completo directamente
  if (field.type === "info_image" || field.type === "info_text") {
    return (
      <div className="space-y-2 py-2">
        {field.label && (
          <p className={`text-sm text-foreground whitespace-pre-wrap ${field.type === "info_text" ? "leading-relaxed" : "font-semibold"}`}>
            {field.label}
          </p>
        )}
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
        {renderInput()}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="space-y-1">
        {renderInput()}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.id} className="text-sm font-medium text-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      {renderInput()}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
