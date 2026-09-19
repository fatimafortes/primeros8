"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteMyData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("p8_responses").delete().eq("worker_id", user.id);
  await supabase.from("p8_enrollments").delete().eq("worker_id", user.id);

  redirect("/worker");
}
