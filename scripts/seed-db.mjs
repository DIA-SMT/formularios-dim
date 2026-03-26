// scripts/seed-db.mjs
// Run with: node scripts/seed-db.mjs

const SUPABASE_URL = "https://gkufrhsyfrpysykewqfc.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdWZyaHN5ZnJweXN5a2V3cWZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDUyNTk2OSwiZXhwIjoyMDkwMTAxOTY5fQ.in3QaKn2Rg5q-9h8WHHAR4xh01MVU6x_jnhfqK3Tgzc";

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function runSQL(sql, label = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers,
    body: JSON.stringify({ sql }),
  });
  // If exec_sql doesn't exist, fall back to pg endpoint
  if (res.status === 404) {
    return { error: "exec_sql_not_found" };
  }
  const text = await res.text();
  if (!res.ok) {
    console.error(`❌ Error en "${label}":`, text);
    return { error: text };
  }
  console.log(`✅ ${label}`);
  return { data: text };
}

// ─── CREATE TABLES SQL ────────────────────────────────────────────────────────
const CREATE_TABLES_SQL = `
-- Tabla de formularios
CREATE TABLE IF NOT EXISTS public.forms (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  code          TEXT NOT NULL UNIQUE,
  description   TEXT,
  area          TEXT,
  email         TEXT,
  requires_signature   BOOLEAN DEFAULT false,
  allow_attachments    BOOLEAN DEFAULT false,
  status        TEXT CHECK (status IN ('published','draft')) DEFAULT 'draft',
  fields        JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de respuestas de formularios
CREATE TABLE IF NOT EXISTS public.form_responses (
  id                TEXT PRIMARY KEY,
  form_id           TEXT NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  form_name         TEXT NOT NULL,
  tramite_code      TEXT NOT NULL UNIQUE,
  submitted_at      TIMESTAMPTZ DEFAULT NOW(),
  status            TEXT CHECK (status IN ('pendiente','procesado','rechazado')) DEFAULT 'pendiente',
  email             TEXT,
  citizen_name      TEXT,
  data              JSONB DEFAULT '{}',
  signature         TEXT,
  has_attachments   BOOLEAN DEFAULT false,
  destination_email TEXT
);

-- Habilitar RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

-- Políticas: todos pueden leer formularios publicados
DROP POLICY IF EXISTS "Anyone can read published forms" ON public.forms;
CREATE POLICY "Anyone can read published forms"
  ON public.forms FOR SELECT
  USING (status = 'published');

-- Políticas: service role puede hacer todo
DROP POLICY IF EXISTS "Service role full access forms" ON public.forms;
CREATE POLICY "Service role full access forms"
  ON public.forms FOR ALL
  USING (true);

DROP POLICY IF EXISTS "Service role full access responses" ON public.form_responses;
CREATE POLICY "Service role full access responses"
  ON public.form_responses FOR ALL
  USING (true);
`;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_FORMS = [
  {
    id: "form-001",
    name: "F.O.T. 21 - Tasa por Ocupación de la Vía Pública",
    code: "FOT-21",
    description:
      "Declaración jurada para el pago de la tasa por ocupación de la vía pública por parte de empresas de transporte público de pasajeros.",
    area: "Dirección de Ingresos Municipales (DIM)",
    email: "dim@sanmigueldetucuman.gob.ar",
    requires_signature: true,
    allow_attachments: true,
    status: "published",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-03-10T00:00:00Z",
    fields: [
      { id: "periodo", type: "text", label: "Período", placeholder: "Ej: Enero 2024", required: true, section: "Datos del Período" },
      { id: "anio", type: "number", label: "Año", placeholder: "2024", required: true, section: "Datos del Período" },
      { id: "tipo_presentacion", type: "radio", label: "Tipo de Presentación", required: true, options: [{ label: "Original", value: "original" }, { label: "Rectificativa", value: "rectificativa" }], section: "Datos del Período" },
      { id: "apellido_nombre", type: "text", label: "Apellido y Nombre o Razón Social", placeholder: "Ingrese apellido y nombre o razón social", required: true, section: "Datos del Contribuyente" },
      { id: "lineas_omnibus", type: "text", label: "Línea/s de Ómnibus", placeholder: "Ej: Línea 1, Línea 5", required: true, section: "Datos del Contribuyente" },
      { id: "domicilio_comercial", type: "text", label: "Domicilio Comercial", placeholder: "Calle, número, piso, departamento", required: true, section: "Datos del Contribuyente" },
      { id: "cuit", type: "text", label: "CUIT", placeholder: "XX-XXXXXXXX-X", required: true, section: "Datos del Contribuyente" },
      { id: "tabla_ddjj", type: "table", label: "Detalle de la Declaración Jurada", required: true, section: "Detalle de la Declaración", columns: [{ key: "linea", label: "Línea de Ómnibus", type: "text" }, { key: "unidades", label: "Unidades Afectadas en el Período", type: "number" }, { key: "precio_boleto", label: "Precio de Venta al Público del Boleto Urbano ($)", type: "number" }, { key: "cantidad_boletos", label: "Cantidad de Boletos s/ Ord. 4099/09", type: "number" }, { key: "tributo", label: "Tributo Determinado ($)", type: "number" }, { key: "observaciones", label: "Observaciones", type: "text" }], description: "Agregue una fila por cada línea de ómnibus. El total se calcula automáticamente." },
      { id: "nombre_firmante", type: "text", label: "Nombre del Firmante", placeholder: "Nombre completo del firmante", required: true, section: "Firma y Declaración" },
      { id: "caracter", type: "select", label: "Carácter", required: true, options: [{ label: "Titular", value: "titular" }, { label: "Apoderado", value: "apoderado" }, { label: "Contador", value: "contador" }, { label: "Representante Legal", value: "representante_legal" }], section: "Firma y Declaración" },
      { id: "fecha", type: "date", label: "Fecha", required: true, section: "Firma y Declaración" },
      { id: "firma", type: "signature", label: "Firma y Aclaración", required: true, section: "Firma y Declaración", description: "El/la suscripto/a declara bajo juramento que los datos consignados en la presente son correctos y completos." },
      { id: "adjunto", type: "file", label: "Documentación Adjunta (opcional)", section: "Documentación", description: "Suba cualquier documentación respaldatoria (PDF, imágenes)." },
    ],
  },
  {
    id: "form-002",
    name: "Habilitación Comercial - Solicitud de Alta",
    code: "HAB-01",
    description: "Solicitud de habilitación comercial para nuevos locales o comercios. Presentar junto a la documentación requerida.",
    area: "Dirección de Ingresos Municipales (DIM)",
    email: "dim@sanmigueldetucuman.gob.ar",
    requires_signature: true,
    allow_attachments: true,
    status: "published",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-03-12T00:00:00Z",
    fields: [
      { id: "razon_social", type: "text", label: "Razón Social / Nombre Comercial", placeholder: "Nombre del negocio o empresa", required: true, section: "Datos del Solicitante" },
      { id: "cuit_comercio", type: "text", label: "CUIT", placeholder: "XX-XXXXXXXX-X", required: true, section: "Datos del Solicitante" },
      { id: "email_contacto", type: "email", label: "Email de Contacto", placeholder: "ejemplo@correo.com", required: true, section: "Datos del Solicitante" },
      { id: "domicilio_local", type: "text", label: "Domicilio del Local", placeholder: "Calle, número, piso", required: true, section: "Datos del Local" },
      { id: "rubro", type: "select", label: "Rubro", required: true, options: [{ label: "Comercio al por menor", value: "comercio_menor" }, { label: "Gastronomía", value: "gastronomia" }, { label: "Servicios profesionales", value: "servicios_profesionales" }, { label: "Industria", value: "industria" }, { label: "Otro", value: "otro" }], section: "Datos del Local" },
      { id: "superficie", type: "number", label: "Superficie del Local (m²)", placeholder: "0", required: true, section: "Datos del Local" },
      { id: "observaciones", type: "textarea", label: "Observaciones", placeholder: "Agregue cualquier información adicional relevante", section: "Observaciones" },
      { id: "fecha_solicitud", type: "date", label: "Fecha de Solicitud", required: true, section: "Firma y Declaración" },
      { id: "firma_hab", type: "signature", label: "Firma del Solicitante", required: true, section: "Firma y Declaración" },
      { id: "documentacion", type: "file", label: "Documentación Requerida", required: true, section: "Documentación", description: "DNI, contrato de alquiler o escritura, plano del local." },
    ],
  },
  {
    id: "form-003",
    name: "Reclamo de Servicios Públicos",
    code: "RSP-05",
    description: "Formulario para presentar reclamos relacionados con servicios públicos municipales: alumbrado, recolección de residuos, estado de calles.",
    area: "Dirección de Ingresos Municipales (DIM)",
    email: "dim@sanmigueldetucuman.gob.ar",
    requires_signature: false,
    allow_attachments: true,
    status: "draft",
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-20T00:00:00Z",
    fields: [],
  },
];

const MOCK_RESPONSES = [
  {
    id: "resp-001",
    form_id: "form-001",
    form_name: "F.O.T. 21 - Tasa por Ocupación de la Vía Pública",
    tramite_code: "TRM-2024-00124",
    submitted_at: "2024-03-18T10:32:00Z",
    status: "pendiente",
    email: "contabilidad@lineauno.com.ar",
    citizen_name: "Transportes Línea Uno S.A.",
    has_attachments: true,
    destination_email: "dim@sanmigueldetucuman.gob.ar",
    signature: "data:image/png;base64,mock_signature_data",
    data: {
      periodo: "Marzo 2024", anio: 2024, tipo_presentacion: "original",
      apellido_nombre: "Transportes Línea Uno S.A.", lineas_omnibus: "Línea 1, Línea 3",
      domicilio_comercial: "Av. San Martín 1450", cuit: "30-71234567-8",
      nombre_firmante: "Carlos Alberto Medina", caracter: "titular", fecha: "2024-03-18",
    },
  },
  {
    id: "resp-002",
    form_id: "form-002",
    form_name: "Habilitación Comercial - Solicitud de Alta",
    tramite_code: "TRM-2024-00125",
    submitted_at: "2024-03-19T14:15:00Z",
    status: "procesado",
    email: "garcia.maria@gmail.com",
    citizen_name: "García, María Elena",
    has_attachments: true,
    destination_email: "dim@sanmigueldetucuman.gob.ar",
    signature: "data:image/png;base64,mock_signature_data",
    data: {
      razon_social: "El Rincón de María - Panadería", cuit_comercio: "27-28456789-3",
      email_contacto: "garcia.maria@gmail.com", domicilio_local: "Calle Las Flores 234",
      rubro: "gastronomia", superficie: 85, fecha_solicitud: "2024-03-19",
    },
  },
  {
    id: "resp-003",
    form_id: "form-001",
    form_name: "F.O.T. 21 - Tasa por Ocupación de la Vía Pública",
    tramite_code: "TRM-2024-00118",
    submitted_at: "2024-03-15T09:00:00Z",
    status: "rechazado",
    email: "admin@linea5.com.ar",
    citizen_name: "Empresa de Colectivos Línea 5 S.R.L.",
    has_attachments: false,
    destination_email: "dim@sanmigueldetucuman.gob.ar",
    signature: null,
    data: {
      periodo: "Febrero 2024", anio: 2024, tipo_presentacion: "rectificativa",
      apellido_nombre: "Empresa de Colectivos Línea 5 S.R.L.", lineas_omnibus: "Línea 5",
      domicilio_comercial: "Ruta 8 km 12", cuit: "30-65432198-7",
      nombre_firmante: "Roberto Sánchez", caracter: "apoderado", fecha: "2024-03-15",
    },
  },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Iniciando migración a Supabase...\n");

  // 1. Crear tablas via SQL (usando el endpoint pg/query si está disponible)
  console.log("📋 Creando tablas...");
  const sqlRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: CREATE_TABLES_SQL }),
  });
  
  if (sqlRes.status === 404 || sqlRes.status === 400) {
    // Intentar con el endpoint correcto de Supabase
    const sqlRes2 = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ query: CREATE_TABLES_SQL }),
    });
    if (!sqlRes2.ok) {
      const err = await sqlRes2.text();
      console.error("❌ No se pudo crear tablas via SQL RPC:", err);
      console.log("\n💡 Usá el SQL Editor de Supabase para crear las tablas manualmente.");
      console.log("   El SQL se encuentra al final de este script.\n");
    }
  }

  // 2. Insert forms via REST API
  console.log("\n📝 Insertando formularios...");
  const formsRes = await fetch(`${SUPABASE_URL}/rest/v1/forms`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(MOCK_FORMS),
  });
  if (formsRes.ok) {
    const data = await formsRes.json();
    console.log(`✅ ${data.length} formularios insertados correctamente.`);
  } else {
    const err = await formsRes.text();
    console.error("❌ Error insertando formularios:", err);
  }

  // 3. Insert responses via REST API
  console.log("\n📬 Insertando respuestas...");
  const respRes = await fetch(`${SUPABASE_URL}/rest/v1/form_responses`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(MOCK_RESPONSES),
  });
  if (respRes.ok) {
    const data = await respRes.json();
    console.log(`✅ ${data.length} respuestas insertadas correctamente.`);
  } else {
    const err = await respRes.text();
    console.error("❌ Error insertando respuestas:", err);
  }

  console.log("\n🎉 Migración completada.");
}

main().catch(console.error);
