import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AIChatClient from "./AIChatClient";
import "../home/home.css";
import "./ai.css";

export default async function AIPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const firstName = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "";

  return <AIChatClient firstName={firstName} />;
}
