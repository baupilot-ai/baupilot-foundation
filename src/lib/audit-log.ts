import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed"
  | "uploaded"
  | "archived"
  | "restored";

export interface AuditEvent {
  id: string;
  company_id: string;
  project_id: string | null;
  actor_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: AuditAction;
  summary: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_fields: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditFilters {
  projectId?: string;
  entityType?: string;
  action?: AuditAction | "all";
  search?: string;
  limit?: number;
}

export async function listAuditEvents(filters: AuditFilters = {}) {
  let query = (supabase as any)
    .from("audit_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 150);

  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.entityType && filters.entityType !== "all") query = query.eq("entity_type", filters.entityType);
  if (filters.action && filters.action !== "all") query = query.eq("action", filters.action);
  if (filters.search?.trim()) query = query.ilike("summary", `%${filters.search.trim()}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AuditEvent[];
}

export async function createAuditEvent(input: {
  project_id?: string | null;
  entity_type: string;
  entity_id?: string | null;
  action: AuditAction;
  summary?: string | null;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
  changed_fields?: string[];
  metadata?: Record<string, unknown>;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await (supabase as any).from("audit_events").insert({
    ...input,
    actor_id: user.id,
    changed_fields: input.changed_fields ?? [],
    metadata: input.metadata ?? { source: "client" },
  });
  if (error) throw error;
}

export function formatAuditEntity(entityType: string) {
  return entityType.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function formatAuditAction(action: string) {
  return action.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
