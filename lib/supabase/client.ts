import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso en componentes del lado del cliente ("use client").
 * Mantiene la sesión sincronizada con las cookies del navegador.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
