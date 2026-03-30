"use client";

import { useRef, useState, useCallback } from "react";
import { ClipboardPaste, ImageIcon, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InfoImageEditorProps {
  /** Data-URL actual de la imagen (undefined si no hay) */
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function InfoImageEditor({ value, onChange }: InfoImageEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    },
    [onChange]
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const imgItem = items.find((it) => it.type.startsWith("image/"));
      if (imgItem) {
        e.preventDefault();
        const blob = imgItem.getAsFile();
        if (blob) await handleFile(blob);
      }
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) await handleFile(file);
    },
    [handleFile]
  );

  if (value) {
    return (
      <div className="relative rounded-lg border border-border overflow-hidden bg-muted/10">
        <img
          src={value}
          alt="Imagen informativa"
          className="w-full max-h-72 object-contain"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {/* Reemplazar */}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-7 w-7 opacity-80 hover:opacity-100"
            title="Reemplazar imagen"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5" />
          </Button>
          {/* Quitar */}
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="h-7 w-7 opacity-80 hover:opacity-100"
            title="Quitar imagen"
            onClick={() => onChange(undefined)}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        dragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/20"
      }`}
      tabIndex={0}
      onPaste={handlePaste}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <div className="flex flex-col items-center gap-3 select-none">
        <div className="flex items-center gap-3 text-muted-foreground">
          <ImageIcon className="w-6 h-6" />
          <span className="text-lg font-light">+</span>
          <ClipboardPaste className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Pegá una captura{" "}
            <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded font-mono">
              Ctrl+V
            </kbd>
            {" "}o hacé clic para subir
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, GIF, WebP — la imagen queda embebida en el formulario
          </p>
        </div>
      </div>
    </div>
  );
}
