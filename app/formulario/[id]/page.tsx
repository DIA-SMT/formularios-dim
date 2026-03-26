"use client";

import { useState, use, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicFieldRenderer } from "@/components/public/DynamicFieldRenderer";
import { PublicHeader } from "@/components/public/PublicHeader";
import { SubmissionSuccess } from "@/components/public/SubmissionSuccess";
import type { FormField, Form } from "@/lib/data";
import { getForm } from "@/app/actions/forms";
import { submitFormResponse } from "@/app/actions/public";

interface PageProps {
  params: Promise<{ id: string }>;
}

function groupBySections(fields: FormField[]) {
  const sections: Record<string, FormField[]> = {};
  fields.forEach((f) => {
    const section = f.section ?? "General";
    if (!sections[section]) sections[section] = [];
    sections[section].push(f);
  });
  return sections;
}

export default function FormularioPage({ params }: PageProps) {
  const { id } = use(params);
  
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tramiteCode] = useState(
    () =>
      "TRM-2024-" +
      String(Math.floor(10000 + Math.random() * 90000)).padStart(5, "0")
  );

  useEffect(() => {
    getForm(id).then((data) => {
      setForm(data);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (!form) return notFound();

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <SubmissionSuccess
          tramiteCode={tramiteCode}
          formName={form.name}
          destinationEmail={form.email}
        />
      </div>
    );
  }

  const handleChange = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    form.fields.forEach((field) => {
      if (!field.required) return;
      const val = formData[field.id];
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0)
      ) {
        newErrors[field.id] = "Este campo es obligatorio";
      }
    });
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // scroll to first error
      const firstErr = Object.keys(errs)[0];
      document.getElementById(firstErr)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    
    setIsSubmitting(true);
    
    // Extract citizen details from formData if possible (heuristic)
    const citizenName = String(
      formData.apellido_nombre || formData.razon_social || formData.nombre || "Ciudadano"
    );
    const email = String(
      formData.email_contacto || formData.email || "no-reply@example.com"
    );

    const result = await submitFormResponse({
      formId: form.id,
      formName: form.name,
      tramiteCode,
      citizenName,
      email,
      data: formData,
      hasAttachments: false, // Would be updated later based on file inputs
      destinationEmail: form.email,
    });

    setIsSubmitting(false);

    if (result.error) {
      alert(result.error);
    } else {
      setSubmitted(true);
    }
  };

  const sections = form ? groupBySections(form.fields) : {};

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al listado
          </Link>
        </div>
      </div>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Form header card */}
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {form.code}
                    </Badge>
                    <Badge
                      className="text-xs bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      Disponible
                    </Badge>
                  </div>
                  <h1 className="text-xl font-bold text-foreground text-balance">
                    {form.name}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    {form.description}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-xs text-muted-foreground">
                    <span>Área: <strong className="text-foreground">{form.area}</strong></span>
                    <span>Destino: <strong className="text-foreground">{form.email}</strong></span>
                    {form.requiresSignature && (
                      <span className="text-amber-700">Requiere firma</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info notice */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Complete todos los campos marcados con{" "}
              <span className="text-destructive font-bold">*</span>. Al finalizar, presione
              &quot;Enviar formulario&quot;. Podrá descargar una copia del comprobante.
            </p>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              {Object.entries(sections).map(([sectionName, fields]) => (
                <Card key={sectionName} className="border-border">
                  <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-base font-semibold text-foreground">
                      {sectionName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="space-y-5">
                      {fields.map((field) => (
                        <DynamicFieldRenderer
                          key={field.id}
                          field={field}
                          value={formData[field.id]}
                          onChange={(val) => handleChange(field.id, val)}
                          error={errors[field.id]}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* DDJJ disclaimer */}
              <div className="bg-muted/50 border border-border rounded-lg px-4 py-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Declaración Jurada:</strong> El/la suscripto/a declara bajo
                  juramento que todos los datos consignados en el presente formulario son
                  correctos, completos y de mi entera responsabilidad. Acepto que la
                  información falsa puede dar lugar a sanciones administrativas y/o
                  penales conforme la normativa vigente.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" disabled={isSubmitting} className="gap-2 sm:flex-1">
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Enviando..." : "Enviar formulario"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.print()}
                  disabled={isSubmitting}
                >
                  <Download className="w-4 h-4" />
                  Descargar borrador
                </Button>
              </div>

              {Object.keys(errors).length > 0 && (
                <p className="text-sm text-destructive text-center">
                  Por favor, complete todos los campos obligatorios antes de enviar.
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
