import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type DailyReport = Tables<"daily_reports">;
export type Task = Tables<"tasks">;
export type Defect = Tables<"defects">;
export type ProjectPhoto = Tables<"project_photos">;
export type ActivityEntry = Tables<"activity_log">;

// ---------- Daily Reports ----------
export const SITE_STATUS = [
  { value: "normal", label: "Normal", tone: "success" as const },
  { value: "delayed", label: "Delayed", tone: "warning" as const },
  { value: "stopped", label: "Stopped", tone: "danger" as const },
  { value: "limited", label: "Limited", tone: "warning" as const },
];

export const WEATHER_OPTIONS = ["Sunny", "Cloudy", "Overcast", "Rain", "Heavy rain", "Snow", "Wind", "Fog"];

export async function listDailyReports(projectId: string) {
  const { data, error } = await supabase
    .from("daily_reports")
    .select("*")
    .eq("project_id", projectId)
    .order("report_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DailyReport[];
}
export async function createDailyReport(input: TablesInsert<"daily_reports">) {
  const { data, error } = await supabase.from("daily_reports").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: input.project_id, entity_type: "daily_report", entity_id: data.id, action: "created", description: `Daily report for ${input.report_date}` });
  return data as DailyReport;
}
export async function updateDailyReport(id: string, patch: TablesUpdate<"daily_reports">) {
  const { data, error } = await supabase.from("daily_reports").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as DailyReport;
}
export async function deleteDailyReport(id: string) {
  const { error } = await supabase.from("daily_reports").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Tasks ----------
export const TASK_STATUS = [
  { value: "open", label: "Open", tone: "neutral" as const },
  { value: "in_progress", label: "In progress", tone: "info" as const },
  { value: "done", label: "Done", tone: "success" as const },
  { value: "blocked", label: "Blocked", tone: "danger" as const },
];
export const PRIORITY = [
  { value: "low", label: "Low", tone: "neutral" as const },
  { value: "medium", label: "Medium", tone: "info" as const },
  { value: "high", label: "High", tone: "warning" as const },
  { value: "critical", label: "Critical", tone: "danger" as const },
];

export async function listTasks(projectId: string) {
  const { data, error } = await supabase
    .from("tasks").select("*").eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Task[];
}
export async function createTask(input: TablesInsert<"tasks">) {
  const { data, error } = await supabase.from("tasks").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: input.project_id, entity_type: "task", entity_id: data.id, action: "created", description: input.title });
  return data as Task;
}
export async function updateTask(id: string, patch: TablesUpdate<"tasks">, opts?: { project_id?: string }) {
  const { data, error } = await supabase.from("tasks").update(patch).eq("id", id).select().single();
  if (error) throw error;
  if (patch.status && opts?.project_id) {
    await logActivity({ project_id: opts.project_id, entity_type: "task", entity_id: id, action: "status_changed", description: `Task → ${patch.status}` });
  }
  return data as Task;
}
export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Defects ----------
export const DEFECT_STATUS = [
  { value: "open", label: "Open", tone: "danger" as const },
  { value: "in_progress", label: "In progress", tone: "warning" as const },
  { value: "fixed", label: "Fixed", tone: "info" as const },
  { value: "accepted", label: "Accepted", tone: "success" as const },
  { value: "rejected", label: "Rejected", tone: "neutral" as const },
];

export async function listDefects(projectId: string) {
  const { data, error } = await supabase
    .from("defects").select("*").eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Defect[];
}
export async function createDefect(input: TablesInsert<"defects">) {
  const { data, error } = await supabase.from("defects").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: input.project_id, entity_type: "defect", entity_id: data.id, action: "created", description: input.title });
  return data as Defect;
}
export async function updateDefect(id: string, patch: TablesUpdate<"defects">, opts?: { project_id?: string }) {
  const { data, error } = await supabase.from("defects").update(patch).eq("id", id).select().single();
  if (error) throw error;
  if (patch.status && opts?.project_id) {
    await logActivity({ project_id: opts.project_id, entity_type: "defect", entity_id: id, action: "status_changed", description: `Defect → ${patch.status}` });
  }
  return data as Defect;
}
export async function deleteDefect(id: string) {
  const { error } = await supabase.from("defects").delete().eq("id", id);
  if (error) throw error;
}
export async function uploadDefectPhoto(companyId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${companyId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("defect-photos").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}
export async function getDefectPhotoUrl(path: string | null) {
  if (!path) return null;
  const { data } = await supabase.storage.from("defect-photos").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

// ---------- Photos ----------
export const PHOTO_CATEGORIES = ["General", "Progress", "Concrete", "Reinforcement", "Formwork", "Defect", "Delivery", "Safety", "Other"];

export async function listPhotos(projectId: string) {
  const { data, error } = await supabase
    .from("project_photos").select("*").eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectPhoto[];
}
export async function uploadProjectPhoto(companyId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${companyId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("project-photos").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}
export async function createPhoto(input: TablesInsert<"project_photos">) {
  const { data, error } = await supabase.from("project_photos").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: input.project_id, entity_type: "photo", entity_id: data.id, action: "uploaded", description: input.title || "Photo uploaded" });
  return data as ProjectPhoto;
}
export async function deletePhoto(id: string, path: string) {
  await supabase.storage.from("project-photos").remove([path]).catch(() => {});
  const { error } = await supabase.from("project_photos").delete().eq("id", id);
  if (error) throw error;
}
export async function getPhotoUrl(path: string) {
  const { data } = await supabase.storage.from("project-photos").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

// ---------- Activity ----------
export async function listActivity(projectId: string) {
  const { data, error } = await supabase
    .from("activity_log").select("*").eq("project_id", projectId)
    .order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []) as ActivityEntry[];
}
export async function logActivity(input: Omit<TablesInsert<"activity_log">, "company_id"> & { company_id?: string }) {
  await supabase.from("activity_log").insert(input as TablesInsert<"activity_log">);
}

// ---------- Project quick stats ----------
export async function getProjectQuickStats(projectId: string) {
  const [dr, t, d, p] = await Promise.all([
    supabase.from("daily_reports").select("id, report_date", { count: "exact" }).eq("project_id", projectId).order("report_date", { ascending: false }).limit(1),
    supabase.from("tasks").select("id, title, due_date, status", { count: "exact" }).eq("project_id", projectId).neq("status", "done").order("due_date", { ascending: true, nullsFirst: false }).limit(1),
    supabase.from("defects").select("id", { count: "exact", head: true }).eq("project_id", projectId).not("status", "in", '("accepted","rejected")'),
    supabase.from("project_photos").select("id", { count: "exact", head: true }).eq("project_id", projectId),
  ]);
  return {
    dailyReportsCount: dr.count ?? 0,
    latestReportDate: dr.data?.[0]?.report_date ?? null,
    openTasksCount: t.count ?? 0,
    nextDueTask: t.data?.[0] ?? null,
    openDefectsCount: d.count ?? 0,
    photosCount: p.count ?? 0,
  };
}
