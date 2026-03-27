import * as z from "zod";

const formFieldSchema = z.object({
  label: z.string().describe("Nombre o etiqueta del campo tal como aparece en el formulario"),
  type: z
    .enum([
      "text",
      "textarea",
      "number",
      "date",
      "select",
      "checkbox",
      "radio",
      "email",
      "file",
      "signature",
      "table",
    ])
    .describe(
      "Tipo de campo inferido: text para texto corto, textarea para texto largo o campos de observaciones, number para montos/cantidades, date para fechas, select para listas con opciones predefinidas, checkbox para casillas de verificación, radio para una sola opción de varias, email para correo, file para adjuntos documentales, signature para firmas, table para grillas o DDJJ tabulares"
    ),
  section: z
    .string()
    .optional()
    .describe(
      "Nombre de la sección o bloque del formulario al que pertenece el campo. Agrupa campos relacionados bajo un mismo título de sección."
    ),
  required: z
    .boolean()
    .optional()
    .describe("Si el campo parece obligatorio según el formulario original"),
  options: z
    .array(z.string())
    .optional()
    .nullable()
    .describe(
      "Solo para campos tipo select o radio: lista de opciones disponibles. Para otros tipos, usar null."
    ),
});

const formAnalysisSchema = z.object({
  formName: z
    .string()
    .describe("Nombre completo del formulario extraído del encabezado o título"),
  formCode: z
    .string()
    .optional()
    .nullable()
    .describe("Código o número del formulario si aparece (ej: FOT-21, F.O.T.21, etc.)"),
  description: z
    .string()
    .optional()
    .nullable()
    .describe("Descripción breve del propósito del formulario"),
  fields: z.array(formFieldSchema).describe("Lista ordenada de todos los campos detectados"),
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return Response.json({ error: "No se recibió ningún archivo PDF." }, { status: 400 });
    }

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return Response.json({ error: "El archivo debe ser un PDF o una imagen (JPG, PNG)." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: "El archivo no puede superar los 10 MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mediaType = file.type;

    // Fetch manual a OpenRouter
    const prompt = `Eres un asistente experto en digitalización de formularios municipales argentinos para la Dirección de Ingresos Municipales (DIM) de la Municipalidad de San Miguel de Tucumán.

Analizá este documento o imagen y extraé todos los campos del formulario con precisión. Para cada campo:
- Identificá su etiqueta exacta o aproximada
- Inferí el tipo de campo más apropiado para digitalizarlo
- Agrupá los campos bajo su sección correspondiente (bloques, recuadros o encabezados dentro del formulario)
- Determiná si parece obligatorio (marcado con asterisco, subrayado, o por contexto)
- Si es un campo select o radio, listá las opciones visibles

Priorizá la fidelidad al formulario original. Si hay tablas con filas repetibles (como declaraciones juradas), usá el tipo "table". Si hay un espacio de firma, usá "signature". Para observaciones o motivos expansos, usá "textarea".

IMPORTANTE: Debes dar la respuesta SOLAMENTE en formato JSON puro y válido, sin NINGUNA palabra antes ni después, y el JSON DEBE cumplir ESTRICTAMENTE con esta estructura:
{
  "formName": "Nombre completo del formulario extraído del encabezado o título",
  "formCode": "Código o número del formulario si aparece (opcional)",
  "description": "Descripción breve del propósito del formulario (opcional)",
  "fields": [
    {
      "label": "Nombre o etiqueta del campo",
      "type": "text | textarea | number | date | select | checkbox | radio | email | file | signature | table",
      "section": "Nombre de la sección o bloque al que pertenece (opcional)",
      "required": false,
      "options": ["Opcion 1", "Opcion 2"]
    }
  ]
}
No incluyas etiquetas de \`\`\`json ni nada de texto adicional.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // Opcional, pero recomendado por OpenRouter
        "X-Title": "Formularios DIM", // Opcional
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: mediaType === "application/pdf" ? "document" : "image_url",
                source: mediaType === "application/pdf" ? {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64
                } : undefined,
                image_url: mediaType !== "application/pdf" ? {
                  url: `data:${mediaType};base64,${base64}`
                } : undefined
              }
            ],
          },
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[analizar-pdf] API Error:", errorData);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    let rawContent = jsonResponse.choices?.[0]?.message?.content || "";

    // Limpiar bloques markdown si todavía los incluye
    if (rawContent.startsWith("```json")) {
      rawContent = rawContent.replace(/^```json\n?/, "").replace(/\n?```$/,"").trim();
    } else if (rawContent.startsWith("```")) {
      rawContent = rawContent.replace(/^```\n?/, "").replace(/\n?```$/,"").trim();
    }

    // Parseo y validación Zod
    const parsedObject = JSON.parse(rawContent);
    const validatedData = formAnalysisSchema.parse(parsedObject);

    return Response.json({ result: validatedData });
  } catch (error: any) {
    console.error("[analizar-pdf] Error general:", error);
    const detail = error.text || error.message;
    return Response.json({ error: error.message || "Error inesperado al procesar el archivo.", detail }, { status: 500 });
  }
}
