import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

async function getFormsContext(): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("forms")
    .select("id, name, code, description, area, fields, status")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return "No hay formularios disponibles en la base de datos.";
  }

  const lines: string[] = ["FORMULARIOS DISPONIBLES EN EL SISTEMA:\n"];

  for (const form of data) {
    const status = form.status === "published" ? "✅ Publicado" : "📝 Borrador";
    lines.push(`---`);
    lines.push(`Nombre: ${form.name}`);
    lines.push(`Código: ${form.code}`);
    lines.push(`Estado: ${status}`);
    lines.push(`Descripción: ${form.description || "Sin descripción"}`);
    lines.push(`Área: ${form.area || "Sin área"}`);

    // List visible fields and sections
    const fields = (form.fields || []).filter(
      (f: any) => f.id !== "__SECTION_DESCRIPTIONS__"
    );
    if (fields.length > 0) {
      const sections = [...new Set(fields.map((f: any) => f.section).filter(Boolean))];
      if (sections.length > 0) {
        lines.push(`Secciones: ${sections.join(", ")}`);
      }
      const fieldNames = fields
        .filter((f: any) => f.label && f.type !== "signature" && f.type !== "file")
        .map((f: any) => `${f.label}${f.required ? " (obligatorio)" : ""}`)
        .slice(0, 12);
      if (fieldNames.length > 0) {
        lines.push(`Campos principales: ${fieldNames.join(" | ")}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Mensajes inválidos" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Clave de API no configurada" },
        { status: 500 }
      );
    }

    const formsContext = await getFormsContext();

    const systemPrompt = `Eres el Asistente Virtual de la Dirección de Ingresos Municipales (DIM) de la Municipalidad de San Miguel de Tucumán, Argentina.

Tu objetivo es ayudar a ciudadanos y contribuyentes a entender qué formularios existen, para qué sirve cada uno, qué datos necesitan completar y cómo iniciar un trámite.

INSTRUCCIONES:
- Responde siempre en español, de manera amigable y profesional.
- Si te preguntan por un formulario específico, explica para qué sirve y qué información se necesita completar.
- Si te preguntan cómo iniciar un trámite, explica que pueden usar el formulario digital en línea.
- Si te preguntan algo que no está relacionado con los formularios o la Municipalidad, explica amablemente que solo puedes ayudar con temas de trámites municipales.
- Nunca inventes información sobre formularios que no estén en la lista.
- Sé conciso: respuestas de 2-4 párrafos como máximo salvo que se pida más detalle.
- No uses lenguaje técnico innecesario; el ciudadano puede no ser experto.

INFORMACIÓN ACTUALIZADA DE FORMULARIOS:
${formsContext}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://formularios.sanmigueldetucuman.gob.ar",
        "X-Title": "Asistente DIM - Municipalidad de San Miguel de Tucumán",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 800,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);
      return NextResponse.json(
        { error: "Error al comunicarse con el servicio de IA" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const assistantMessage =
      data.choices?.[0]?.message?.content ?? "Lo siento, no pude procesar tu consulta.";

    return NextResponse.json({ message: assistantMessage });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
