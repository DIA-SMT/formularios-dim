"use client";

import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="w-full"
      style={{ background: "var(--header-bg)", color: "var(--header-foreground)" }}
    >
      {/* Top bar */}
      <div className="border-b border-white/10 px-4 py-1.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-xs text-white/70">
            Municipalidad de San Miguel de Tucumán — Provincia de Tucumán
          </p>
          <Link
            href="/admin"
            className="text-xs text-white/70 hover:text-white transition-colors"
          >
            Acceso Administrativo
          </Link>
        </div>
      </div>

      {/* Main header */}
      <div className="px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white/15 rounded-lg p-2">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-lg leading-tight">
                Dir. de Ingresos Municipales
              </p>
              <p className="text-white/70 text-xs">Municipalidad de San Miguel de Tucumán</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-white/80 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link href="/#formularios" className="text-sm text-white/80 hover:text-white transition-colors">
              Formularios
            </Link>
            <Link
              href="https://municipalidad.gob.ar"
              target="_blank"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Sitio Municipal
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              className="text-sm text-white/80 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/#formularios"
              className="text-sm text-white/80 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Formularios
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
