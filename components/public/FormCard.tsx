import Link from "next/link";
import { FileText, ChevronRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Form } from "@/lib/data";

interface FormCardProps {
  form: Form;
}

export function FormCard({ form }: FormCardProps) {
  return (
    <div className="flex flex-col h-full border border-border rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-white overflow-hidden">
      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="bg-primary rounded-xl p-3 shrink-0 text-white shadow-sm">
            <FileText className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base leading-tight">
              {form.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{form.code}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-5">
          {form.description}
        </p>

        {/* Action area */}
        <div className="mt-auto">
          {/* Spacer to keep card height after removing middle metadata */}
          <div className="h-5 mb-4" aria-hidden="true" />

          <div className="h-px w-full bg-border/60 mb-4" />

          {/* Button */}
          <Link href={`/formulario/${form.id}`} className="block w-full">
            <Button className="w-full gap-2 font-medium text-sm h-10 rounded-lg shadow-sm hover:shadow" size="sm">
              Completar formulario
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50/80 px-5 py-3 border-t border-border flex items-center gap-2">
        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
        <span className="text-xs text-muted-foreground truncate font-medium">
          {form.area}
        </span>
      </div>
    </div>
  );
}
