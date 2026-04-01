"use server"

import { supabaseAdmin } from "@/lib/supabase"

export async function submitFormResponse(data: {
  formId: string;
  formName: string;
  tramiteCode: string;
  citizenName: string;
  email: string;
  data: Record<string, unknown>;
  hasAttachments: boolean;
  destinationEmail: string;
}) {
  const responseId = `resp-${Date.now()}`;

  const newResponse = {
    id: responseId,
    form_id: data.formId,
    form_name: data.formName,
    tramite_code: data.tramiteCode,
    citizen_name: data.citizenName,
    email: data.email,
    data: data.data,
    status: "pendiente",
    has_attachments: data.hasAttachments,
    destination_email: data.destinationEmail,
  };

  const { error } = await supabaseAdmin
    .from("form_responses")
    .insert(newResponse);

  if (error) {
    console.error("Error submitting response:", error);
    return { error: "No se pudo enviar el formulario. Intente nuevamente." };
  }

  // Registrar en citizen_submissions para trazabilidad
  const { error: submissionError } = await supabaseAdmin
    .from("citizen_submissions")
    .insert({
      citizen_name: data.citizenName,
      form_id: data.formId,
      form_name: data.formName,
      tramite_code: data.tramiteCode,
      email: data.email || null,
      response_id: responseId,
    });

  if (submissionError) {
    // No bloquear el envío si falla el registro secundario, solo loguear
    console.error("Error registering citizen submission:", submissionError);
  }

  return { success: true, id: responseId };
}
