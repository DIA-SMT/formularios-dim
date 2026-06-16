"use client";

import { useState } from "react";
import { Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormCard } from "@/components/public/FormCard";
import type { Form } from "@/lib/data";

export function HomeClient({ publishedForms }: { publishedForms: Form[] }) {
  const filtered = publishedForms;

  return (
    <>
      <section
        className="relative pt-28 pb-14 px-4 overflow-hidden"
      >
        {/* Background Image & Gradient Overlays */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/puente.jpg')" }}
        />
        <div className="absolute inset-0 z-0 bg-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-primary via-primary/80 to-transparent opacity-90" />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-balance leading-tight">
            Formularios Digitales
            <br />
            <span className="text-white/90">Municipalidad de San Miguel de Tucumán</span>
          </h1>
          <p className="text-white text-base font-medium max-w-xl mx-auto leading-relaxed">
            Complete sus trámites municipales de forma online, sin necesidad de
            descargar ni imprimir documentos.
          </p>
        </div>
      </section>

      {/* Forms listing */}
      <main className="flex-1 px-4 py-6" id="formularios">
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
