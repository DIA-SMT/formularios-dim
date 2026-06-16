"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function PublicHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header
      className={cn(
        "w-full print:hidden",
        overlay && "absolute inset-x-0 top-0 z-30"
      )}
      style={
        overlay
          ? { color: "var(--header-foreground)" }
          : { background: "var(--header-bg)", color: "var(--header-foreground)" }
      }
    >
      {/* Main header */}
      <div className="px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm">
              <Image
                src="/logo-dim.png"
                alt="Ciudad San Miguel de Tucumán — Dirección de Ingresos Municipales"
                width={560}
                height={92}
                priority
                className="h-8 sm:h-10 w-auto"
              />
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center">
            <Link
              href="https://www.dimsmt.gob.ar/home/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary bg-white rounded-lg px-3 py-1.5 shadow-sm hover:bg-white/90 transition-colors"
            >
              Página DIM
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
