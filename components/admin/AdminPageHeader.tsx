import Image from "next/image";
import type { LucideIcon } from "lucide-react";

export function AdminPageHeader({
  title,
  icon: Icon,
  action,
}: {
  title: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div>
      {/* Logo institucional */}
      <div className="pb-5 border-b border-border">
        <Image
          src="/logo-dim.png"
          alt="Ciudad San Miguel de Tucumán — Dirección de Ingresos Municipales"
          width={560}
          height={92}
          priority
          className="h-12 md:h-14 w-auto"
        />
      </div>

      {/* Título de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5">
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl p-2.5 shrink-0 shadow-sm"
            style={{ background: "linear-gradient(135deg, #1668e0 0%, #0c3c86 100%)" }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-none">
              {title}
            </h1>
            <div
              className="h-1 w-14 rounded-full mt-2"
              style={{
                background:
                  "linear-gradient(90deg, #1668e0 0%, #38b6f1 55%, #ffd400 100%)",
              }}
            />
          </div>
        </div>
        {action && <div className="w-full sm:w-auto">{action}</div>}
      </div>
    </div>
  );
}
