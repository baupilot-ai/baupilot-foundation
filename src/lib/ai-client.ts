import { supabase } from "@/integrations/supabase/client";

export interface AIConversation {
  id: string;
  title: string;
  model: string;
  feature: string;
  project_id: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}
export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  created_at: string;
}

export async function listConversations() {
  const { data, error } = await supabase
    .from("ai_conversations" as any)
    .select("*")
    .is("archived_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AIConversation[];
}

export async function listMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("ai_messages" as any)
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as AIMessage[];
}

export async function deleteConversation(id: string) {
  const { error } = await supabase.from("ai_conversations" as any).delete().eq("id", id);
  if (error) throw error;
}

export async function renameConversation(id: string, title: string) {
  const { error } = await supabase.from("ai_conversations" as any).update({ title }).eq("id", id);
  if (error) throw error;
}
