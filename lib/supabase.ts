import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fallback for build time if env vars are missing
const isBuildTime = !supabaseUrl || !supabaseAnonKey;
const dummyUrl = "https://placeholder-project.supabase.co";
const dummyKey = "placeholder-key";

// Cliente público (para operaciones de lectura desde el cliente)
export const supabase = createClient(
  supabaseUrl || dummyUrl, 
  supabaseAnonKey || dummyKey
);

// Cliente con privilegios de servicio (solo para Server Actions / API routes)
export const supabaseAdmin = createClient(
  supabaseUrl || dummyUrl, 
  supabaseServiceKey || dummyKey
);
