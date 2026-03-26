"use client";

import { useState } from "react";
import { Search, FileText, Shield, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormCard } from "@/components/public/FormCard";
import type { Form } from "@/lib/data";

export function HomeClient({ publishedForms }: { publishedForms: Form[] }) {
  const [query, setQuery] = useState("");

  const filtered = publishedForms.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.area.toLowerCase().includes(query.toLowerCase()) ||
      f.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <section
        className="py-14 px-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.05 245) 0%, oklch(0.32 0.1 245) 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs px-3 py-1.5 rounded-full border border-white/20">
            <Shield className="w-3.5 h-3.5" />
            Trámites municipales oficiales
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-balance leading-tight">
            Formularios Digitales
            <br />
            <span className="text-white/80">Municipalidad de San Martín</span>
          </h1>
          <p className="text-white/75 text-base max-w-xl mx-auto leading-relaxed">
            Complete sus trámites municipales de forma online, sin necesidad de
            descargar ni imprimir documentos.
          </p>

          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar formulario por nombre, código o área..."
              className="pl-9 bg-white border-white/20 text-foreground placeholder:text-muted-foreground h-11 shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Info bar */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-6 justify-center md:justify-start">
          {[
            { icon: FileText, label: "Sin descargas necesarias" },
            { icon: Shield, label: "Envío seguro y oficial" },
            { icon: Clock, label: "Respuesta en 72 hs hábiles" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Forms listing */}
      <main className="flex-1 px-4 py-10" id="formularios">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Formularios disponibles
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filtered.length}{" "}
                {filtered.length === 1
                  ? "formulario encontrado"
                  : "formularios encontrados"}
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-base font-medium text-foreground mb-1">
                No se encontraron formularios
              </h3>
              <p className="text-sm text-muted-foreground">
                Intente con otro término de búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((form) => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
