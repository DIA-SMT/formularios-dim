import Link from "next/link";
import { FileText, ArrowRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Form } from "@/lib/data";

interface FormCardProps {
  form: Form;
}

export function FormCard({ form }: FormCardProps) {
  return (
    <Card className="flex flex-col h-full border-border hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg p-2 shrink-0" style={{ background: "var(--primary)", opacity: 0.9 }}>
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
                {form.name}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{form.code}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {form.description}
        </p>
        <div className="flex items-center gap-1.5 mt-4">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">{form.area}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-border">
        <Link href={`/formulario/${form.id}`} className="w-full">
          <Button className="w-full gap-2" size="sm">
            Completar formulario
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
