"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Lock } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("Credenciales inválidas. Verifique su correo y contraseña.");
      setLoading(false);
      return;
    }

    router.replace("/admin/dashboard");
    router.refresh();
  }

  return (
    <div
      className="admin-theme min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #0d3e88 0%, #0a2f6b 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-xl px-4 py-3 shadow-lg">
            <Image
              src="/logo-dim.png"
              alt="Ciudad San Miguel de Tucumán — Dirección de Ingresos Municipales"
              width={560}
              height={92}
              priority
              className="h-11 w-auto"
            />
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div
              className="rounded-lg p-2 shrink-0"
              style={{
                background: "linear-gradient(135deg, #1668e0 0%, #0c3c86 100%)",
              }}
            >
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-none">
                Acceso administrativo
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Ingrese con sus credenciales
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@dimsmt.gob.ar"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/60 mt-6">
          Dirección de Ingresos Municipales — San Miguel de Tucumán
        </p>
      </div>
    </div>
  );
}
