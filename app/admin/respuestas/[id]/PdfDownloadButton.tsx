"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PdfDownloadButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 shrink-0 print:hidden"
      onClick={handlePrint}
    >
      <Download className="w-4 h-4" />
      Descargar PDF
    </Button>
  );
}
