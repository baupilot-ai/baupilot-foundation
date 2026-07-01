import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/site-modules";

export type ScheduleActivity = Tables<"project_schedule">;
export type Milestone = Tables<"project_milestones">;
export type CalendarEvent = Tables<"calendar_events">;
export type ScheduleDependency = Tables<"schedule_dependencies">;
export type NotificationEvent = Tables<"notification_events">;
export type NotificationSettings = Tables<"notification_settings">;

// ---------- Status option lists ----------
export const SCHEDULE_STATUS = [
  { value: "not_started", labelKey: "planning.schedule.status.not_started", tone: "neutral" as const },
  { value: "in_progress", labelKey: "planning.schedule.status.in_progress", tone: "info" as const },
  { value: "delayed", labelKey: "planning.schedule.status.delayed", tone: "danger" as const },
  { value: "completed", labelKey: "planning.schedule.status.completed", tone: "success" as const },
  { value: "cancelled", labelKey: "planning.schedule.status.cancelled", tone: "neutral" as const },
];
export const MILESTONE_STATUS = [
  { value: "planned", labelKey: "planning.milestones.status.planned", tone: "neutral" as const },
  { value: "active", labelKey: "planning.milestones.status.active", tone: "info" as const },
  { value: "completed", labelKey: "planning.milestones.status.completed", tone: "success" as const },
  { value: "delayed", labelKey: "planning.milestones.status.delayed", tone: "danger" as const },
];
export const EVENT_TYPES = [
  { value: "task", labelKey: "planning.calendar.types.task" },
  { value: "milestone", labelKey: "planning.calendar.types.milestone" },
  { value: "delivery", labelKey: "planning.calendar.types.delivery" },
  { value: "daily_report", labelKey: "planning.calendar.types.daily_report" },
  { value: "inspection", labelKey: "planning.calendar.types.inspection" },
  { value: "meeting", labelKey: "planning.calendar.types.meeting" },
  { value: "schedule_activity", labelKey: "planning.calendar.types.schedule_activity" },
  { value: "other", labelKey: "planning.calendar.types.other" },
];
export const EVENT_STATUS = [
  { value: "planned", labelKey: "planning.calendar.status.planned", tone: "neutral" as const },
  { value: "active", labelKey: "planning.calendar.status.active", tone: "info" as const },
  { value: "completed", labelKey: "planning.calendar.status.completed", tone: "success" as const },
  { value: "delayed", labelKey: "planning.calendar.status.delayed", tone: "danger" as const },
  { value: "cancelled", labelKey: "planning.calendar.status.cancelled", tone: "neutral" as const },
];
export const DEPENDENCY_TYPES = [
  { value: "fs", labelKey: "planning.dependencies.types.fs" },
  { value: "ss", labelKey: "planning.dependencies.types.ss" },
  { value: "ff", labelKey: "planning.dependencies.types.ff" },
  { value: "sf", labelKey: "planning.dependencies.types.sf" },
];
export const NOTIFICATION_TYPES = [
  { value: "deadline", labelKey: "planning.notifications.types.deadline" },
  { value: "delay", labelKey: "planning.notifications.types.delay" },
  { value: "milestone", labelKey: "planning.notifications.types.milestone" },
  { value: "delivery", labelKey: "planning.notifications.types.delivery" },
  { value: "schedule_change", labelKey: "planning.notifications.types.schedule_change" },
  { value: "inspection", labelKey: "planning.notifications.types.inspection" },
  { value: "general", labelKey: "planning.notifications.types.general" },
];

// ---------- Schedule activities ----------
function calcDuration(start?: string | null, finish?: string | null) {
  if (!start || !finish) return null;
  const a = new Date(start).getTime();
  const b = new Date(finish).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

export async function listScheduleActivities(projectId: string) {
  const { data, error } = await supabase
    .from("project_schedule").select("*").eq("project_id", projectId)
    .order("start_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as ScheduleActivity[];
}
export async function createScheduleActivity(input: TablesInsert<"project_schedule">) {
  const payload = { ...input, duration_days: input.duration_days ?? calcDuration(input.start_date, input.finish_date) };
  const { data, error } = await supabase.from("project_schedule").insert(payload).select().single();
  if (error) throw error;
  await logActivity({ project_id: input.project_id, entity_type: "schedule_activity", entity_id: data.id, action: "created", description: input.activity_name });
  return data as ScheduleActivity;
}
export async function updateScheduleActivity(id: string, patch: TablesUpdate<"project_schedule">, projectId?: string) {
  const payload: TablesUpdate<"project_schedule"> = { ...patch };
  if (patch.start_date !== undefined || patch.finish_date !== undefined) {
    const { data: cur } = await supabase.from("project_schedule").select("start_date,finish_date").eq("id", id).single();
    const start = patch.start_date ?? cur?.start_date ?? null;
    const finish = patch.finish_date ?? cur?.finish_date ?? null;
    payload.duration_days = calcDuration(start, finish);
  }
  const { data, error } = await supabase.from("project_schedule").update(payload).eq("id", id).select().single();
  if (error) throw error;
  if (projectId) {
    await logActivity({
      project_id: projectId, entity_type: "schedule_activity", entity_id: id,
      action: patch.status === "delayed" ? "delayed" : "updated",
      description: data.activity_name,
    });
  }
  return data as ScheduleActivity;
}
export async function deleteScheduleActivity(id: string) {
  const { error } = await supabase.from("project_schedule").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Milestones ----------
export async function listMilestones(projectId: string) {
  const { data, error } = await supabase
    .from("project_milestones").select("*").eq("project_id", projectId)
    .order("planned_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as Milestone[];
}
export async function createMilestone(input: TablesInsert<"project_milestones">) {
  const { data, error } = await supabase.from("project_milestones").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: input.project_id, entity_type: "milestone", entity_id: data.id, action: "created", description: input.name });
  return data as Milestone;
}
export async function updateMilestone(id: string, patch: TablesUpdate<"project_milestones">, projectId?: string) {
  const { data, error } = await supabase.from("project_milestones").update(patch).eq("id", id).select().single();
  if (error) throw error;
  if (projectId && patch.status === "completed") {
    await logActivity({ project_id: projectId, entity_type: "milestone", entity_id: id, action: "completed", description: data.name });
  }
  return data as Milestone;
}
export async function deleteMilestone(id: string) {
  const { error } = await supabase.from("project_milestones").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Calendar events ----------
export async function listCalendarEvents(projectId: string, opts?: { from?: string; to?: string }) {
  let q = supabase.from("calendar_events").select("*").eq("project_id", projectId).order("start_datetime", { ascending: true });
  if (opts?.from) q = q.gte("start_datetime", opts.from);
  if (opts?.to) q = q.lte("start_datetime", opts.to);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as CalendarEvent[];
}
export async function createCalendarEvent(input: TablesInsert<"calendar_events">) {
  const { data, error } = await supabase.from("calendar_events").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: input.project_id, entity_type: "calendar_event", entity_id: data.id, action: "created", description: input.title });
  return data as CalendarEvent;
}
export async function updateCalendarEvent(id: string, patch: TablesUpdate<"calendar_events">, projectId?: string) {
  const { data, error } = await supabase.from("calendar_events").update(patch).eq("id", id).select().single();
  if (error) throw error;
  if (projectId) await logActivity({ project_id: projectId, entity_type: "calendar_event", entity_id: id, action: "updated", description: data.title });
  return data as CalendarEvent;
}
export async function deleteCalendarEvent(id: string, projectId?: string) {
  const { error } = await supabase.from("calendar_events").delete().eq("id", id);
  if (error) throw error;
  if (projectId) await logActivity({ project_id: projectId, entity_type: "calendar_event", entity_id: id, action: "deleted" });
}

// ---------- Dependencies ----------
export async function listDependencies(projectId: string) {
  const { data, error } = await supabase
    .from("schedule_dependencies").select("*").eq("project_id", projectId);
  if (error) throw error;
  return (data ?? []) as ScheduleDependency[];
}
export async function createDependency(input: TablesInsert<"schedule_dependencies">) {
  const { data, error } = await supabase.from("schedule_dependencies").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: input.project_id, entity_type: "dependency", entity_id: data.id, action: "created" });
  return data as ScheduleDependency;
}
export async function deleteDependency(id: string) {
  const { error } = await supabase.from("schedule_dependencies").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Notifications ----------
export async function listNotifications(opts?: { projectId?: string; unreadOnly?: boolean; type?: string }) {
  let q = supabase.from("notification_events").select("*").order("created_at", { ascending: false }).limit(200);
  if (opts?.projectId) q = q.eq("project_id", opts.projectId);
  if (opts?.unreadOnly) q = q.eq("status", "unread");
  if (opts?.type) q = q.eq("event_type", opts.type);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as NotificationEvent[];
}
export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("notification_events").update({ status: "read", read_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
export async function markAllNotificationsRead(projectId?: string) {
  let q = supabase.from("notification_events").update({ status: "read", read_at: new Date().toISOString() }).eq("status", "unread");
  if (projectId) q = q.eq("project_id", projectId);
  const { error } = await q;
  if (error) throw error;
}
export async function countUnreadNotifications() {
  const { count, error } = await supabase.from("notification_events").select("id", { count: "exact", head: true }).eq("status", "unread");
  if (error) return 0;
  return count ?? 0;
}
export async function createNotification(input: TablesInsert<"notification_events">) {
  const { error } = await supabase.from("notification_events").insert(input);
  if (error) throw error;
}

export async function getNotificationSettings(projectId?: string | null) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  let q = supabase.from("notification_settings").select("*").eq("user_id", u.user.id);
  q = projectId ? q.eq("project_id", projectId) : q.is("project_id", null);
  const { data } = await q.maybeSingle();
  return (data ?? null) as NotificationSettings | null;
}
export async function upsertNotificationSettings(input: TablesInsert<"notification_settings">) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not authenticated");
  const existing = await getNotificationSettings(input.project_id ?? null);
  if (existing) {
    const { data, error } = await supabase.from("notification_settings").update(input as TablesUpdate<"notification_settings">).eq("id", existing.id).select().single();
    if (error) throw error;
    return data as NotificationSettings;
  }
  const { data, error } = await supabase.from("notification_settings").insert(input).select().single();
  if (error) throw error;
  return data as NotificationSettings;
}

// ---------- Project progress ----------
export interface ProjectPlanningStats {
  progressPercent: number;
  totalActivities: number;
  completedActivities: number;
  delayedActivities: number;
  upcomingDeadlines: number;
  nextMilestone: Milestone | null;
  nextDeadline: ScheduleActivity | null;
  eventsToday: number;
}
export async function getProjectPlanningStats(projectId: string): Promise<ProjectPlanningStats> {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const in7 = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);
  const dayStart = today.toISOString();
  const dayEnd = new Date(today.getTime() + 86400000).toISOString();

  const [acts, ms, evs] = await Promise.all([
    supabase.from("project_schedule").select("*").eq("project_id", projectId),
    supabase.from("project_milestones").select("*").eq("project_id", projectId).neq("status", "completed").order("planned_date", { ascending: true, nullsFirst: false }).limit(1),
    supabase.from("calendar_events").select("id", { count: "exact", head: true }).eq("project_id", projectId).gte("start_datetime", dayStart).lt("start_datetime", dayEnd),
  ]);
  const activities = (acts.data ?? []) as ScheduleActivity[];
  const total = activities.length;
  const completed = activities.filter((a) => a.status === "completed").length;
  const delayed = activities.filter((a) => a.status === "delayed").length;
  const upcoming = activities.filter((a) => a.finish_date && a.finish_date >= todayStr && a.finish_date <= in7 && a.status !== "completed").length;
  const progress = total > 0 ? Math.round(activities.reduce((s, a) => s + (a.progress_percent ?? 0), 0) / total) : 0;
  const nextDeadline = activities
    .filter((a) => a.status !== "completed" && a.finish_date && a.finish_date >= todayStr)
    .sort((a, b) => (a.finish_date ?? "").localeCompare(b.finish_date ?? ""))[0] ?? null;
  return {
    progressPercent: progress,
    totalActivities: total,
    completedActivities: completed,
    delayedActivities: delayed,
    upcomingDeadlines: upcoming,
    nextMilestone: (ms.data?.[0] as Milestone) ?? null,
    nextDeadline,
    eventsToday: evs.count ?? 0,
  };
}

export async function getPlanningDashboardStats() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const in7 = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);
  const [acts, ms, unread] = await Promise.all([
    supabase.from("project_schedule").select("status,progress_percent,finish_date"),
    supabase.from("project_milestones").select("id", { count: "exact", head: true }).eq("status", "planned").gte("planned_date", todayStr).lte("planned_date", in7),
    supabase.from("notification_events").select("id", { count: "exact", head: true }).eq("status", "unread"),
  ]);
  const arr = (acts.data ?? []) as Pick<ScheduleActivity, "status" | "progress_percent" | "finish_date">[];
  const active = arr.filter((a) => a.status === "in_progress");
  const overall = active.length > 0 ? Math.round(active.reduce((s, a) => s + (a.progress_percent ?? 0), 0) / active.length) : 0;
  const delayed = arr.filter((a) => a.status === "delayed").length;
  const dueThisWeek = arr.filter((a) => a.finish_date && a.finish_date >= todayStr && a.finish_date <= in7 && a.status !== "completed").length;
  return {
    overallProgress: overall,
    upcomingMilestones: ms.count ?? 0,
    delayedActivities: delayed,
    dueThisWeek,
    unreadNotifications: unread.count ?? 0,
  };
}

// ============= Package 9: Schedule Management extensions =============

export type ProgressUpdate = Tables<"progress_updates">;
export type DelayEvent = Tables<"delay_events">;

export const TASK_PRIORITY = [
  { value: "low", labelKey: "schedule.priority.low", tone: "neutral" as const },
  { value: "normal", labelKey: "schedule.priority.normal", tone: "info" as const },
  { value: "high", labelKey: "schedule.priority.high", tone: "warning" as const },
  { value: "critical", labelKey: "schedule.priority.critical", tone: "danger" as const },
];

export const DELAY_STATUS = [
  { value: "open", labelKey: "schedule.delays.status.open", tone: "danger" as const },
  { value: "mitigating", labelKey: "schedule.delays.status.mitigating", tone: "warning" as const },
  { value: "resolved", labelKey: "schedule.delays.status.resolved", tone: "success" as const },
];

// Progress updates
export async function listProgressUpdates(taskId: string) {
  const { data, error } = await supabase
    .from("progress_updates").select("*").eq("task_id", taskId)
    .order("update_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProgressUpdate[];
}
export async function addProgressUpdate(input: TablesInsert<"progress_updates">) {
  const { data, error } = await supabase.from("progress_updates").insert(input).select().single();
  if (error) throw error;
  // Also update the task itself
  await supabase.from("project_schedule").update({
    progress_percent: input.progress_percent,
    status: input.progress_percent >= 100 ? "completed" : input.progress_percent > 0 ? "in_progress" : "not_started",
  }).eq("id", input.task_id);
  await logActivity({ project_id: input.project_id, entity_type: "schedule_activity", entity_id: input.task_id, action: "progress_updated", description: `${input.progress_percent}%` });
  return data as ProgressUpdate;
}

// Delay events
export async function listDelayEvents(projectId: string) {
  const { data, error } = await supabase
    .from("delay_events").select("*").eq("project_id", projectId)
    .is("deleted_at", null)
    .order("detected_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DelayEvent[];
}
export async function createDelayEvent(input: TablesInsert<"delay_events">) {
  const { data, error } = await supabase.from("delay_events").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: input.project_id, entity_type: "delay_event", entity_id: data.id, action: "created", description: input.reason ?? undefined });
  return data as DelayEvent;
}
export async function updateDelayEvent(id: string, patch: TablesUpdate<"delay_events">) {
  const { data, error } = await supabase.from("delay_events").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as DelayEvent;
}
export async function deleteDelayEvent(id: string) {
  const { error } = await supabase.from("delay_events").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// Critical path heuristic: mark tasks with no float or already delayed
export function computeCriticalPath(activities: ScheduleActivity[]): ScheduleActivity[] {
  return activities.map((a) => ({
    ...a,
    is_critical: a.is_critical || (a.float_days != null && a.float_days <= 0) || a.status === "delayed",
  }));
}

// Auto-detect overdue tasks (client-side helper)
export function detectOverdueTasks(activities: ScheduleActivity[]): ScheduleActivity[] {
  const today = new Date().toISOString().slice(0, 10);
  return activities.filter(
    (a) => a.finish_date && a.finish_date < today && a.status !== "completed" && a.status !== "cancelled",
  );
}

// Enhanced project schedule stats for the module summary
export interface ScheduleModuleStats {
  overallProgress: number;
  totalTasks: number;
  criticalTasks: number;
  delayedTasks: number;
  dueToday: number;
  dueThisWeek: number;
  openMilestones: number;
  earliestFinish: string | null;
  avgFloatDays: number | null;
}
export async function getScheduleModuleStats(projectId: string): Promise<ScheduleModuleStats> {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const in7 = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);

  const [acts, ms] = await Promise.all([
    supabase.from("project_schedule").select("*").eq("project_id", projectId),
    supabase.from("project_milestones").select("id", { count: "exact", head: true }).eq("project_id", projectId).neq("status", "completed"),
  ]);
  const activities = (acts.data ?? []) as ScheduleActivity[];
  const total = activities.length;
  const overall = total > 0 ? Math.round(activities.reduce((s, a) => s + (a.progress_percent ?? 0), 0) / total) : 0;
  const critical = activities.filter((a) => a.is_critical || (a.float_days != null && a.float_days <= 0)).length;
  const delayed = activities.filter((a) => a.status === "delayed" || (a.finish_date && a.finish_date < todayStr && a.status !== "completed" && a.status !== "cancelled")).length;
  const dueToday = activities.filter((a) => a.finish_date === todayStr && a.status !== "completed").length;
  const dueThisWeek = activities.filter((a) => a.finish_date && a.finish_date >= todayStr && a.finish_date <= in7 && a.status !== "completed").length;
  const finishes = activities.filter((a) => a.finish_date && a.status !== "completed" && a.status !== "cancelled").map((a) => a.finish_date!).sort();
  const floats = activities.map((a) => a.float_days).filter((f): f is number => f != null);
  return {
    overallProgress: overall,
    totalTasks: total,
    criticalTasks: critical,
    delayedTasks: delayed,
    dueToday,
    dueThisWeek,
    openMilestones: ms.count ?? 0,
    earliestFinish: finishes[0] ?? null,
    avgFloatDays: floats.length > 0 ? Math.round(floats.reduce((s, f) => s + f, 0) / floats.length) : null,
  };
}

