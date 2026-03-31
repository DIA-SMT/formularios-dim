export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "radio"
  | "email"
  | "file"
  | "signature"
  | "table"
  | "info_image"
  | "info_text"; // Texto introductorio / descriptivo

export interface SelectOption {
  label: string;
  value: string;
}

export interface TableColumn {
  key: string;
  label: string;
  type: "text" | "number";
  isTotal?: boolean;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  columns?: TableColumn[];
  description?: string;
  section?: string;
  /** Data-URL de la imagen embebida (solo para type === "info_image") */
  imageUrl?: string;
}

export interface Form {
  id: string;
  name: string;
  code: string;
  description: string;
  area: string;
  email: string;
  requiresSignature: boolean;
  allowAttachments: boolean;
  status: "published" | "draft";
  createdAt: string;
  updatedAt: string;
  fields: FormField[];
  sectionDescriptions?: Record<string, string>;
}

export interface TableRow {
  [key: string]: string | number;
}

export interface FormResponse {
  id: string;
  formId: string;
  formName: string;
  tramiteCode: string;
  submittedAt: string;
  status: "pendiente" | "procesado" | "rechazado";
  email: string;
  citizenName: string;
  data: Record<string, unknown>;
  signature?: string;
  hasAttachments: boolean;
  destinationEmail: string;
}

export const MOCK_FORMS: Form[] = [
  {
    id: "form-001",
    name: "F.O.T. 21 - Tasa por Ocupación de la Vía Pública",
    code: "FOT-21",
    description:
      "Declaración jurada para el pago de la tasa por ocupación de la vía pública por parte de empresas de transporte público de pasajeros.",
    area: "Dirección de Ingresos Municipales (DIM)",
    email: "dim@sanmigueldetucuman.gob.ar",
    requiresSignature: true,
    allowAttachments: true,
    status: "published",
    createdAt: "2024-01-15",
    updatedAt: "2024-03-10",
    fields: [
      {
        id: "periodo",
        type: "text",
        label: "Período",
        placeholder: "Ej: Enero 2024",
        required: true,
        section: "Datos del Período",
      },
      {
        id: "anio",
        type: "number",
        label: "Año",
        placeholder: "2024",
        required: true,
        section: "Datos del Período",
      },
      {
        id: "tipo_presentacion",
        type: "radio",
        label: "Tipo de Presentación",
        required: true,
        options: [
          { label: "Original", value: "original" },
          { label: "Rectificativa", value: "rectificativa" },
        ],
        section: "Datos del Período",
      },
      {
        id: "apellido_nombre",
        type: "text",
        label: "Apellido y Nombre o Razón Social",
        placeholder: "Ingrese apellido y nombre o razón social",
        required: true,
        section: "Datos del Contribuyente",
      },
      {
        id: "lineas_omnibus",
        type: "text",
        label: "Línea/s de Ómnibus",
        placeholder: "Ej: Línea 1, Línea 5",
        required: true,
        section: "Datos del Contribuyente",
      },
      {
        id: "domicilio_comercial",
        type: "text",
        label: "Domicilio Comercial",
        placeholder: "Calle, número, piso, departamento",
        required: true,
        section: "Datos del Contribuyente",
      },
      {
        id: "cuit",
        type: "text",
        label: "CUIT",
        placeholder: "XX-XXXXXXXX-X",
        required: true,
        section: "Datos del Contribuyente",
      },
      {
        id: "tabla_ddjj",
        type: "table",
        label: "Detalle de la Declaración Jurada",
        required: true,
        section: "Detalle de la Declaración",
        columns: [
          { key: "linea", label: "Línea de Ómnibus", type: "text" },
          {
            key: "unidades",
            label: "Unidades Afectadas en el Período",
            type: "number",
          },
          {
            key: "precio_boleto",
            label: "Precio de Venta al Público del Boleto Urbano ($)",
            type: "number",
          },
          {
            key: "cantidad_boletos",
            label: "Cantidad de Boletos s/ Ord. 4099/09",
            type: "number",
          },
          { key: "tributo", label: "Tributo Determinado ($)", type: "number" },
          { key: "observaciones", label: "Observaciones", type: "text" },
        ],
        description:
          "Agregue una fila por cada línea de ómnibus. El total se calcula automáticamente.",
      },
      {
        id: "nombre_firmante",
        type: "text",
        label: "Nombre del Firmante",
        placeholder: "Nombre completo del firmante",
        required: true,
        section: "Firma y Declaración",
      },
      {
        id: "caracter",
        type: "select",
        label: "Carácter",
        required: true,
        options: [
          { label: "Titular", value: "titular" },
          { label: "Apoderado", value: "apoderado" },
          { label: "Contador", value: "contador" },
          { label: "Representante Legal", value: "representante_legal" },
        ],
        section: "Firma y Declaración",
      },
      {
        id: "fecha",
        type: "date",
        label: "Fecha",
        required: true,
        section: "Firma y Declaración",
      },
      {
        id: "firma",
        type: "signature",
        label: "Firma y Aclaración",
        required: true,
        section: "Firma y Declaración",
        description:
          "El/la suscripto/a declara bajo juramento que los datos consignados en la presente son correctos y completos.",
      },
      {
        id: "adjunto",
        type: "file",
        label: "Documentación Adjunta (opcional)",
        section: "Documentación",
        description: "Suba cualquier documentación respaldatoria (PDF, imágenes).",
      },
    ],
  },
  {
    id: "form-002",
    name: "Habilitación Comercial - Solicitud de Alta",
    code: "HAB-01",
    description:
      "Solicitud de habilitación comercial para nuevos locales o comercios. Presentar junto a la documentación requerida.",
    area: "Dirección de Ingresos Municipales (DIM)",
    email: "dim@sanmigueldetucuman.gob.ar",
    requiresSignature: true,
    allowAttachments: true,
    status: "published",
    createdAt: "2024-02-01",
    updatedAt: "2024-03-12",
    fields: [
      {
        id: "razon_social",
        type: "text",
        label: "Razón Social / Nombre Comercial",
        placeholder: "Nombre del negocio o empresa",
        required: true,
        section: "Datos del Solicitante",
      },
      {
        id: "cuit_comercio",
        type: "text",
        label: "CUIT",
        placeholder: "XX-XXXXXXXX-X",
        required: true,
        section: "Datos del Solicitante",
      },
      {
        id: "email_contacto",
        type: "email",
        label: "Email de Contacto",
        placeholder: "ejemplo@correo.com",
        required: true,
        section: "Datos del Solicitante",
      },
      {
        id: "domicilio_local",
        type: "text",
        label: "Domicilio del Local",
        placeholder: "Calle, número, piso",
        required: true,
        section: "Datos del Local",
      },
      {
        id: "rubro",
        type: "select",
        label: "Rubro",
        required: true,
        options: [
          { label: "Comercio al por menor", value: "comercio_menor" },
          { label: "Gastronomía", value: "gastronomia" },
          { label: "Servicios profesionales", value: "servicios_profesionales" },
          { label: "Industria", value: "industria" },
          { label: "Otro", value: "otro" },
        ],
        section: "Datos del Local",
      },
      {
        id: "superficie",
        type: "number",
        label: "Superficie del Local (m²)",
        placeholder: "0",
        required: true,
        section: "Datos del Local",
      },
      {
        id: "observaciones",
        type: "textarea",
        label: "Observaciones",
        placeholder: "Agregue cualquier información adicional relevante",
        section: "Observaciones",
      },
      {
        id: "fecha_solicitud",
        type: "date",
        label: "Fecha de Solicitud",
        required: true,
        section: "Firma y Declaración",
      },
      {
        id: "firma_hab",
        type: "signature",
        label: "Firma del Solicitante",
        required: true,
        section: "Firma y Declaración",
      },
      {
        id: "documentacion",
        type: "file",
        label: "Documentación Requerida",
        required: true,
        section: "Documentación",
        description: "DNI, contrato de alquiler o escritura, plano del local.",
      },
    ],
  },
  {
    id: "form-003",
    name: "Reclamo de Servicios Públicos",
    code: "RSP-05",
    description:
      "Formulario para presentar reclamos relacionados con servicios públicos municipales: alumbrado, recolección de residuos, estado de calles.",
    area: "Dirección de Ingresos Municipales (DIM)",
    email: "dim@sanmigueldetucuman.gob.ar",
    requiresSignature: false,
    allowAttachments: true,
    status: "draft",
    createdAt: "2024-03-01",
    updatedAt: "2024-03-20",
    fields: [],
  },
];

export const MOCK_RESPONSES: FormResponse[] = [
  {
    id: "resp-001",
    formId: "form-001",
    formName: "F.O.T. 21 - Tasa por Ocupación de la Vía Pública",
    tramiteCode: "TRM-2024-00124",
    submittedAt: "2024-03-18T10:32:00Z",
    status: "pendiente",
    email: "contabilidad@lineauno.com.ar",
    citizenName: "Transportes Línea Uno S.A.",
    hasAttachments: true,
    destinationEmail: "dim@sanmigueldetucuman.gob.ar",
    data: {
      periodo: "Marzo 2024",
      anio: 2024,
      tipo_presentacion: "original",
      apellido_nombre: "Transportes Línea Uno S.A.",
      lineas_omnibus: "Línea 1, Línea 3",
      domicilio_comercial: "Av. San Martín 1450",
      cuit: "30-71234567-8",
      nombre_firmante: "Carlos Alberto Medina",
      caracter: "titular",
      fecha: "2024-03-18",
    },
    signature: "data:image/png;base64,mock_signature_data",
  },
  {
    id: "resp-002",
    formId: "form-002",
    formName: "Habilitación Comercial - Solicitud de Alta",
    tramiteCode: "TRM-2024-00125",
    submittedAt: "2024-03-19T14:15:00Z",
    status: "procesado",
    email: "garcia.maria@gmail.com",
    citizenName: "García, María Elena",
    hasAttachments: true,
    destinationEmail: "dim@sanmigueldetucuman.gob.ar",
    data: {
      razon_social: "El Rincón de María - Panadería",
      cuit_comercio: "27-28456789-3",
      email_contacto: "garcia.maria@gmail.com",
      domicilio_local: "Calle Las Flores 234",
      rubro: "gastronomia",
      superficie: 85,
      fecha_solicitud: "2024-03-19",
    },
    signature: "data:image/png;base64,mock_signature_data",
  },
  {
    id: "resp-003",
    formId: "form-001",
    formName: "F.O.T. 21 - Tasa por Ocupación de la Vía Pública",
    tramiteCode: "TRM-2024-00118",
    submittedAt: "2024-03-15T09:00:00Z",
    status: "rechazado",
    email: "admin@linea5.com.ar",
    citizenName: "Empresa de Colectivos Línea 5 S.R.L.",
    hasAttachments: false,
    destinationEmail: "dim@sanmigueldetucuman.gob.ar",
    data: {
      periodo: "Febrero 2024",
      anio: 2024,
      tipo_presentacion: "rectificativa",
      apellido_nombre: "Empresa de Colectivos Línea 5 S.R.L.",
      lineas_omnibus: "Línea 5",
      domicilio_comercial: "Ruta 8 km 12",
      cuit: "30-65432198-7",
      nombre_firmante: "Roberto Sánchez",
      caracter: "apoderado",
      fecha: "2024-03-15",
    },
    signature: undefined,
  },
];
