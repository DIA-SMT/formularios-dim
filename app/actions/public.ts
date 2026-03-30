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
  const newResponse = {
    id: `resp-${Date.now()}`,
    form_id: data.formId,
    form_name: data.formName,
    tramite_code: data.tramiteCode,
    citizen_name: data.citizenName,
    email: data.email,
    data: data.data,
    status: "pendiente",
    has_attachments: data.hasAttachments,
    destination_email: data.destinationEmail,
    // Add signature field if applicable in future
  };

  const { error } = await supabaseAdmin
    .from("form_responses")
    .insert(newResponse);

  if (error) {
    console.error("Error submitting response:", error);
    return { error: "No se pudo enviar el formulario. Intente nuevamente." };
  }

  return { success: true, id: newResponse.id };
}
