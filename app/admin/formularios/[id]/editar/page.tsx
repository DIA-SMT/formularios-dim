import { notFound } from "next/navigation";
import { getForm } from "@/app/actions/forms";
import { EditFormClient } from "./EditFormClient";

export default async function EditarFormularioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = await getForm(id);

  if (!form) {
    notFound();
  }

  return <EditFormClient form={form} />;
}
