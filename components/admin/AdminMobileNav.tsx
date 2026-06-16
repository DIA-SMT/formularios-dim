"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Inbox, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/formularios", label: "Formularios", icon: FileText },
  { href: "/admin/respuestas", label: "Respuestas", icon: Inbox },
  { href: "/admin/configuracion", label: "Config", icon: Settings },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar */}
      <header
        className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10"
        style={{ background: "linear-gradient(180deg, #1668e0 0%, #0c3c86 100%)" }}
      >
        <div className="bg-white rounded-lg p-1 shadow-sm">
          <Image
            src="/logoMuni-sm.png"
            alt="Logo Municipalidad de San Miguel de Tucumán"
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
            priority
          />
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-none">DIM — Ingresos Municipales</p>
          <p className="text-white/50 text-xs">San Miguel de Tucumán</p>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 px-2 py-1 z-50"
        style={{ background: "#0c3c86" }}
      >
        <div className="flex justify-around">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors",
                  active ? "text-white" : "text-white/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
