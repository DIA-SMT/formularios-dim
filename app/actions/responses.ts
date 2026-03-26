"use server"

import { supabaseAdmin } from "@/lib/supabase"
import type { FormResponse } from "@/lib/data"
import { revalidatePath } from "next/cache"

export async function getResponses() {
  const { data, error } = await supabaseAdmin
    .from("form_responses")
    .select("*")
    .order("submitted_at", { ascending: false })

  if (error) {
    console.error("Error fetching responses:", error)
    return []
  }
  
  // Transform snake_case to camelCase mapping for the UI
  return (data || []).map((resp: any) => ({
    ...resp,
    formId: resp.form_id,
    formName: resp.form_name,
    tramiteCode: resp.tramite_code,
    submittedAt: resp.submitted_at,
    citizenName: resp.citizen_name,
    hasAttachments: resp.has_attachments,
    destinationEmail: resp.destination_email,
  })) as FormResponse[]
}

export async function getResponse(id: string) {
  const { data, error } = await supabaseAdmin
    .from("form_responses")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return null

  return {
    ...data,
    formId: data.form_id,
    formName: data.form_name,
    tramiteCode: data.tramite_code,
    submittedAt: data.submitted_at,
    citizenName: data.citizen_name,
    hasAttachments: data.has_attachments,
    destinationEmail: data.destination_email,
  } as FormResponse
}

export async function updateResponseStatus(id: string, status: "pendiente" | "procesado" | "rechazado") {
  const { error } = await supabaseAdmin
    .from("form_responses")
    .update({ status })
    .eq("id", id)

  if (error) {
    console.error("Error updating response status:", error)
    return { error: "No se pudo actualizar el estado de la respuesta" }
  }

  revalidatePath("/admin/respuestas")
  revalidatePath(`/admin/respuestas/${id}`)
  return { success: true }
}

export async function deleteResponse(id: string) {
  const { error } = await supabaseAdmin
    .from("form_responses")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting response:", error)
    return { error: "No se pudo eliminar la respuesta" }
  }

  revalidatePath("/admin/respuestas")
  return { success: true }
}
