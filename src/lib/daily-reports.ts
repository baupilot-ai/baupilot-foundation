import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/site-modules";

export type DailyReport = Tables<"daily_reports">;
export type DRWorkforce = Tables<"daily_report_workforce">;
export type DREquipment = Tables<"daily_report_equipment">;
export type DRMaterial = Tables<"daily_report_materials">;
export type DRWork = Tables<"daily_report_work_performed">;
export type DRDelay = Tables<"daily_report_delays">;
export type DRVisitor = Tables<"daily_report_visitors">;
export type DRPhoto = Tables<"daily_report_photos">;
export type DRSignature = Tables<"daily_report_signatures">;
export type DRAttachment = Tables<"daily_report_attachments">;
export type DRLink = Tables<"daily_report_links">;

export const REPORT_STATUS = [
  { value: "draft", label: "dailyReports.reportStatus.draft", tone: "neutral" as const },
  { value: "submitted", label: "dailyReports.reportStatus.submitted", tone: "info" as const },
  { value: "reviewed", label: "dailyReports.reportStatus.reviewed", tone: "info" as const },
  { value: "approved", label: "dailyReports.reportStatus.approved", tone: "success" as const },
  { value: "rejected", label: "dailyReports.reportStatus.rejected", tone: "danger" as const },
];

export const DELAY_TYPES = [
  "weather", "missing_material", "equipment_failure", "design_change",
  "client", "authority", "subcontractor", "other",
];

export const PHOTO_CATEGORIES_PRO = [
  "progress", "quality", "safety", "defect", "delivery", "equipment", "material", "general",
];

export const SIGNATURE_ROLES = ["foreman", "project_manager", "client"];

// ---------- Reports ----------
export async function listReports(projectId: string, filters?: { status?: string; from?: string; to?: string; search?: string }) {
  let q = supabase.from("daily_reports").select("*").eq("project_id", projectId).order("report_date", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.from) q = q.gte("report_date", filters.from);
  if (filters?.to) q = q.lte("report_date", filters.to);
  if (filters?.search) q = q.or(`work_performed.ilike.%${filters.search}%,notes.ilike.%${filters.search}%,safety_notes.ilike.%${filters.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DailyReport[];
}

export async function getReport(id: string) {
  const { data, error } = await supabase.from("daily_reports").select("*").eq("id", id).single();
  if (error) throw error;
  return data as DailyReport;
}

export async function createReport(input: TablesInsert<"daily_reports">) {
  const { data, error } = await supabase.from("daily_reports").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: input.project_id, entity_type: "daily_report", entity_id: data.id, action: "created", description: `Daily report ${input.report_date}` });
  return data as DailyReport;
}

export async function updateReport(id: string, patch: TablesUpdate<"daily_reports">) {
  const { data, error } = await supabase.from("daily_reports").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as DailyReport;
}

export async function deleteReport(id: string) {
  const { error } = await supabase.from("daily_reports").delete().eq("id", id);
  if (error) throw error;
}

export async function submitReport(id: string, projectId: string) {
  const { data: user } = await supabase.auth.getUser();
  const patch: TablesUpdate<"daily_reports"> = { status: "submitted", submitted_by: user.user?.id, submitted_at: new Date().toISOString() };
  const r = await updateReport(id, patch);
  await logActivity({ project_id: projectId, entity_type: "daily_report", entity_id: id, action: "submitted", description: "Report submitted" });
  return r;
}

export async function approveReport(id: string, projectId: string) {
  const { data: user } = await supabase.auth.getUser();
  const r = await updateReport(id, { status: "approved", approved_by: user.user?.id, approved_at: new Date().toISOString() });
  await logActivity({ project_id: projectId, entity_type: "daily_report", entity_id: id, action: "approved", description: "Report approved" });
  return r;
}

export async function rejectReport(id: string, projectId: string, reason: string) {
  const { data: user } = await supabase.auth.getUser();
  const r = await updateReport(id, { status: "rejected", rejected_by: user.user?.id, rejected_at: new Date().toISOString(), rejection_reason: reason });
  await logActivity({ project_id: projectId, entity_type: "daily_report", entity_id: id, action: "rejected", description: reason });
  return r;
}

// ---------- Generic child helpers ----------
type ChildTable =
  | "daily_report_workforce" | "daily_report_equipment" | "daily_report_materials"
  | "daily_report_work_performed" | "daily_report_delays" | "daily_report_visitors"
  | "daily_report_photos" | "daily_report_signatures" | "daily_report_attachments"
  | "daily_report_links";

export async function listChildren<T = unknown>(table: ChildTable, reportId: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select("*").eq("daily_report_id", reportId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as T[];
}
export async function insertChild<T = unknown>(table: ChildTable, row: Record<string, unknown>): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from(table) as any).insert(row).select().single();
  if (error) throw error;
  return data as T;
}
export async function updateChild<T = unknown>(table: ChildTable, id: string, patch: Record<string, unknown>): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from(table) as any).update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as T;
}
export async function deleteChild(table: ChildTable, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

// ---------- Attachments storage ----------
export async function uploadReportFile(companyId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${companyId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("daily-report-files").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}
export async function getReportFileUrl(path: string) {
  const { data } = await supabase.storage.from("daily-report-files").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
export async function removeReportFile(path: string) {
  await supabase.storage.from("daily-report-files").remove([path]).catch(() => {});
}

// ---------- Stats ----------
export async function getReportStats(projectId: string) {
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const [latest, week, month, pending] = await Promise.all([
    supabase.from("daily_reports").select("*").eq("project_id", projectId).order("report_date", { ascending: false }).limit(1),
    supabase.from("daily_reports").select("id", { count: "exact", head: true }).eq("project_id", projectId).gte("report_date", iso(weekAgo)),
    supabase.from("daily_reports").select("id", { count: "exact", head: true }).eq("project_id", projectId).gte("report_date", iso(monthAgo)),
    supabase.from("daily_reports").select("id", { count: "exact", head: true }).eq("project_id", projectId).in("status", ["submitted", "reviewed"]),
  ]);

  const latestReport = (latest.data?.[0] ?? null) as DailyReport | null;
  let workersToday = 0;
  if (latestReport) {
    const { data: wf } = await supabase.from("daily_report_workforce").select("own_workers, subcontractor_workers").eq("daily_report_id", latestReport.id);
    workersToday = (wf ?? []).reduce((s, r) => s + (r.own_workers ?? 0) + (r.subcontractor_workers ?? 0), 0);
  }
  return {
    latestReport,
    thisWeek: week.count ?? 0,
    thisMonth: month.count ?? 0,
    pendingApproval: pending.count ?? 0,
    workersToday,
  };
}
