"use server"

import { supabaseAdmin } from "@/lib/supabase"
import type { Form } from "@/lib/data"
import { revalidatePath } from "next/cache"

export async function getForms() {
  const { data, error } = await supabaseAdmin
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching forms:", error)
    return []
  }
  
  // Transform snake_case to camelCase mapping for the UI
  return (data || []).map((form: any) => {
    let sectionDescriptions = {};
    const visibleFields = (form.fields || []).filter((f: any) => {
      if (f.id === "__SECTION_DESCRIPTIONS__") {
        try { sectionDescriptions = JSON.parse(f.label) } catch (e) {}
        return false;
      }
      return true;
    });

    return {
      ...form,
      fields: visibleFields,
      sectionDescriptions,
      requiresSignature: form.requires_signature,
      allowAttachments: form.allow_attachments,
      createdAt: form.created_at,
      updatedAt: form.updated_at,
    };
  }) as Form[]
}

export async function getForm(id: string) {
  const { data, error } = await supabaseAdmin
    .from("forms")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return null

  let sectionDescriptions = {};
  const visibleFields = (data.fields || []).filter((f: any) => {
    if (f.id === "__SECTION_DESCRIPTIONS__") {
      try { sectionDescriptions = JSON.parse(f.label) } catch (e) {}
      return false;
    }
    return true;
  });

  return {
    ...data,
    fields: visibleFields,
    sectionDescriptions,
    requiresSignature: data.requires_signature,
    allowAttachments: data.allow_attachments,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } as Form
}

export async function createForm(formData: Partial<Form>) {
  const fieldsWithDescriptions = [...(formData.fields || [])];
  if (formData.sectionDescriptions && Object.keys(formData.sectionDescriptions).length > 0) {
    fieldsWithDescriptions.push({
      id: "__SECTION_DESCRIPTIONS__",
      type: "text",
      label: JSON.stringify(formData.sectionDescriptions),
      required: false,
      section: "__HIDDEN__"
    } as any);
  }

  const newForm = {
    id: `form-${Date.now()}`,
    name: formData.name,
    code: formData.code || `FRM-${Date.now().toString().slice(-6)}`,
    description: formData.description,
    area: formData.area,
    email: formData.email,
    requires_signature: formData.requiresSignature || false,
    allow_attachments: formData.allowAttachments || false,
    status: formData.status || "draft",
    fields: fieldsWithDescriptions,
  }

  const { error } = await supabaseAdmin
    .from("forms")
    .insert(newForm)

  if (error) {
    console.error("Error creating form:", error)
    return { error: "No se pudo crear el formulario" }
  }

  revalidatePath("/admin/formularios")
  return { success: true, id: newForm.id }
}

export async function updateForm(id: string, formData: Partial<Form>) {
  const updates: any = { updated_at: new Date().toISOString() }
  
  if (formData.name !== undefined) updates.name = formData.name
  if (formData.code !== undefined) updates.code = formData.code || `FRM-${Date.now().toString().slice(-6)}`
  if (formData.description !== undefined) updates.description = formData.description
  if (formData.area !== undefined) updates.area = formData.area
  if (formData.email !== undefined) updates.email = formData.email
  if (formData.requiresSignature !== undefined) updates.requires_signature = formData.requiresSignature
  if (formData.allowAttachments !== undefined) updates.allow_attachments = formData.allowAttachments
  if (formData.status !== undefined) updates.status = formData.status
  if (formData.fields !== undefined || formData.sectionDescriptions !== undefined) {
    const fieldsWithDescriptions = [...(formData.fields || [])];
    if (formData.sectionDescriptions && Object.keys(formData.sectionDescriptions).length > 0) {
      fieldsWithDescriptions.push({
        id: "__SECTION_DESCRIPTIONS__",
        type: "text",
        label: JSON.stringify(formData.sectionDescriptions),
        required: false,
        section: "__HIDDEN__"
      } as any);
    }
    updates.fields = fieldsWithDescriptions;
  }

  const { error } = await supabaseAdmin
    .from("forms")
    .update(updates)
    .eq("id", id)

  if (error) {
    console.error("Error updating form:", error)
    return { error: "No se pudo actualizar el formulario" }
  }

  revalidatePath("/admin/formularios")
  revalidatePath(`/admin/formularios/${id}/editar`)
  revalidatePath(`/formulario/${id}`)
  return { success: true }
}

export async function toggleFormStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === "published" ? "draft" : "published"
  
  const { error } = await supabaseAdmin
    .from("forms")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error toggling form status:", error)
    return { error: "No se pudo cambiar el estado" }
  }

  revalidatePath("/admin/formularios")
  return { success: true, status: newStatus }
}

export async function deleteForm(id: string) {
  const { error } = await supabaseAdmin
    .from("forms")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting form:", error)
    return { error: "No se pudo eliminar el formulario" }
  }

  revalidatePath("/admin/formularios")
  return { success: true }
}
