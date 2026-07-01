import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type NotificationEvent = Tables<"notification_events">;

export type NotificationType =
  | "document_submitted"
  | "document_approved"
  | "document_rejected"
  | "defect_assigned"
  | "milestone_delayed"
  | "task_assigned"
  | "general";

async function currentCompanyId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();
  return data?.company_id ?? null;
}

export async function createNotification(input: {
  user_id: string;
  project_id?: string | null;
  event_type: NotificationType;
  title: string;
  message?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  link_url?: string | null;
}) {
  const company_id = await currentCompanyId();
  if (!company_id) return;
  const row: TablesInsert<"notification_events"> = {
    company_id,
    user_id: input.user_id,
    project_id: input.project_id ?? null,
    event_type: input.event_type,
    title: input.title,
    message: input.message ?? null,
    // @ts-expect-error - columns added by migration, types regen after apply
    entity_type: input.entity_type ?? null,
    // @ts-expect-error - see above
    entity_id: input.entity_id ?? null,
    // @ts-expect-error - see above
    link_url: input.link_url ?? null,
    status: "unread",
  };
  await supabase.from("notification_events").insert(row);
}

export async function listMyNotifications(limit = 20): Promise<NotificationEvent[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("notification_events")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as NotificationEvent[];
}

export async function countUnread(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from("notification_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "unread");
  return count ?? 0;
}

export async function markAsRead(id: string) {
  await supabase
    .from("notification_events")
    .update({ status: "read", read_at: new Date().toISOString() })
    .eq("id", id);
}

export async function markAllAsRead() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notification_events")
    .update({ status: "read", read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("status", "unread");
}

/** Notify all admins/bauleiter in the current company. */
export async function notifyApprovers(input: {
  project_id: string;
  event_type: NotificationType;
  title: string;
  message?: string;
  entity_type?: string;
  entity_id?: string;
}) {
  const company_id = await currentCompanyId();
  if (!company_id) return;
  const { data: approvers } = await supabase
    .from("profiles")
    .select("id")
    .eq("company_id", company_id)
    .in("role", ["owner", "admin", "bauleiter"]);
  if (!approvers?.length) return;
  await Promise.all(
    approvers.map((p) =>
      createNotification({
        user_id: p.id,
        project_id: input.project_id,
        event_type: input.event_type,
        title: input.title,
        message: input.message,
        entity_type: input.entity_type,
        entity_id: input.entity_id,
      })
    )
  );
}
