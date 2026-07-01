import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/site-modules";

// ---------- Types ----------
export type QChecklist = Tables<"quality_checklists">;
export type QChecklistItem = Tables<"quality_checklist_items">;
export type QInspection = Tables<"quality_inspections">;
export type AcceptanceRecord = Tables<"acceptance_records">;
export type PunchList = Tables<"punch_lists">;
export type PunchListItem = Tables<"punch_list_items">;
export type NcrReport = Tables<"ncr_reports">;
export type SafetyInspection = Tables<"safety_inspections">;
export type ToolboxTalk = Tables<"toolbox_talks">;
export type SafetyObservation = Tables<"safety_observations">;
export type AccidentReport = Tables<"accident_reports">;
export type CorrectiveAction = Tables<"corrective_actions">;
export type QSSignature = Tables<"quality_safety_signatures">;

type Tone = "success" | "warning" | "danger" | "info" | "neutral";
type EnumOpt<V extends string = string> = { value: V; tone: Tone };
const mk = <V extends string>(value: V, tone: Tone): EnumOpt<V> => ({ value, tone });

// ---------- Enums ----------
export const CHECKLIST_TYPES = [
  "concrete", "reinforcement", "formwork", "masonry", "waterproofing", "facade",
  "roof", "drywall", "electrical", "plumbing", "hvac", "fire_protection",
  "safety", "quality", "custom",
] as const;

export const CHECKLIST_STATUS: EnumOpt[] = [
  mk("draft", "neutral"), mk("in_progress", "info"), mk("completed", "success"),
  mk("approved", "success"), mk("rejected", "danger"), mk("archived", "neutral"),
];

export const CHECKLIST_ITEM_RESULT: EnumOpt[] = [
  mk("passed", "success"), mk("failed", "danger"),
  mk("not_applicable", "neutral"), mk("not_checked", "neutral"),
];

export const INSPECTION_TYPES = [
  "quality", "safety", "internal", "external", "client",
  "authority", "supplier", "subcontractor",
] as const;

export const INSPECTION_STATUS: EnumOpt[] = [
  mk("scheduled", "info"), mk("in_progress", "info"), mk("completed", "success"),
  mk("approved", "success"), mk("rejected", "danger"), mk("cancelled", "neutral"),
];

export const INSPECTION_RESULT: EnumOpt[] = [
  mk("passed", "success"), mk("failed", "danger"), mk("conditional", "warning"),
];

export const ACCEPTANCE_TYPES = [
  "concrete", "foundation", "floor", "facade", "roof",
  "fire_protection", "mep", "completion", "custom",
] as const;

export const ACCEPTANCE_STATUS: EnumOpt[] = [
  mk("draft", "neutral"), mk("submitted", "info"), mk("accepted", "success"),
  mk("accepted_with_defects", "warning"), mk("rejected", "danger"), mk("archived", "neutral"),
];

export const PUNCH_ITEM_STATUS: EnumOpt[] = [
  mk("open", "warning"), mk("in_progress", "info"), mk("fixed", "info"),
  mk("accepted", "success"), mk("rejected", "danger"),
];

export const PRIORITY_OPTS: EnumOpt[] = [
  mk("low", "neutral"), mk("medium", "info"), mk("high", "warning"), mk("critical", "danger"),
];

export const NCR_STATUS: EnumOpt[] = [
  mk("draft", "neutral"), mk("open", "warning"), mk("under_review", "info"),
  mk("corrective_action_required", "warning"), mk("closed", "success"), mk("rejected", "danger"),
];

export const OBSERVATION_TYPES = [
  "positive", "unsafe_condition", "unsafe_action", "improvement", "risk",
] as const;
export const OBSERVATION_STATUS: EnumOpt[] = [
  mk("open", "warning"), mk("under_review", "info"), mk("closed", "success"),
];
export const SEVERITY_OPTS: EnumOpt[] = [
  mk("low", "neutral"), mk("medium", "info"), mk("high", "warning"), mk("critical", "danger"),
];

export const ACCIDENT_SEVERITY: EnumOpt[] = [
  mk("minor", "info"), mk("moderate", "warning"), mk("serious", "danger"), mk("critical", "danger"),
];
export const ACCIDENT_STATUS: EnumOpt[] = [
  mk("draft", "neutral"), mk("reported", "info"),
  mk("under_investigation", "warning"), mk("closed", "success"),
];

export const CORRECTIVE_STATUS: EnumOpt[] = [
  mk("open", "warning"), mk("in_progress", "info"), mk("completed", "success"),
  mk("verified", "success"), mk("overdue", "danger"),
];

export const TOOLBOX_TOPICS = [
  "ppe", "fall_protection", "crane_safety", "electrical_safety",
  "excavation_safety", "fire_safety", "manual_handling", "site_rules", "custom",
] as const;

// Utility
export function toneOf(list: EnumOpt[], value: string | null | undefined): Tone {
  return list.find((x) => x.value === value)?.tone ?? "neutral";
}

// ---------- Generic CRUD factory ----------
type QsTable =
  | "quality_checklists" | "quality_checklist_items" | "quality_inspections"
  | "acceptance_records" | "punch_lists" | "punch_list_items" | "ncr_reports"
  | "safety_inspections" | "toolbox_talks" | "safety_observations"
  | "accident_reports" | "corrective_actions" | "quality_safety_signatures";

async function listBy<T>(
  table: QsTable, projectId: string, orderCol = "created_at", asc = false,
): Promise<T[]> {
  const { data, error } = await supabase.from(table).select("*")
    .eq("project_id", projectId).order(orderCol, { ascending: asc });
  if (error) throw error;
  return (data ?? []) as T[];
}
async function insertRow<T>(table: QsTable, input: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.from(table).insert(input as never).select().single();
  if (error) throw error;
  return data as T;
}
async function updateRow<T>(table: QsTable, id: string, patch: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.from(table).update(patch as never).eq("id", id).select().single();
  if (error) throw error;
  return data as T;
}
async function deleteRow(table: QsTable, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

// ---------- Checklists ----------
export const listChecklists = (pid: string) => listBy<QChecklist>("quality_checklists", pid);
export async function createChecklist(input: TablesInsert<"quality_checklists">) {
  const row = await insertRow<QChecklist>("quality_checklists", input);
  await logActivity({ project_id: row.project_id, entity_type: "checklist", entity_id: row.id, action: "created", description: `Checklist: ${row.title}` });
  return row;
}
export async function updateChecklist(id: string, patch: TablesUpdate<"quality_checklists">) {
  const row = await updateRow<QChecklist>("quality_checklists", id, patch);
  if (patch.status === "completed" || patch.status === "approved") {
    await logActivity({ project_id: row.project_id, entity_type: "checklist", entity_id: row.id, action: "completed", description: `Checklist: ${row.title}` });
  }
  return row;
}
export const deleteChecklist = (id: string) => deleteRow("quality_checklists", id);
export async function duplicateChecklist(id: string) {
  const src = await supabase.from("quality_checklists").select("*").eq("id", id).single();
  if (src.error) throw src.error;
  const { id: _i, created_at: _c, updated_at: _u, ...rest } = src.data;
  const dup = await createChecklist({ ...rest, title: `${rest.title} (copy)`, status: "draft" });
  const items = await supabase.from("quality_checklist_items").select("*").eq("checklist_id", id);
  if (items.data?.length) {
    const rows = items.data.map(({ id: _x, created_at: _cx, updated_at: _ux, checklist_id: _ck, ...r }) => ({
      ...r, checklist_id: dup.id, result: "not_checked",
    }));
    await supabase.from("quality_checklist_items").insert(rows as never);
  }
  return dup;
}

// Checklist items
export async function listChecklistItems(checklistId: string) {
  const { data, error } = await supabase.from("quality_checklist_items").select("*")
    .eq("checklist_id", checklistId).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as QChecklistItem[];
}
export const createChecklistItem = (input: TablesInsert<"quality_checklist_items">) =>
  insertRow<QChecklistItem>("quality_checklist_items", input);
export async function updateChecklistItem(id: string, patch: TablesUpdate<"quality_checklist_items">) {
  const row = await updateRow<QChecklistItem>("quality_checklist_items", id, patch);
  if (patch.result === "failed") {
    await logActivity({ project_id: row.project_id, entity_type: "checklist_item", entity_id: row.id, action: "failed", description: row.title });
  }
  return row;
}
export const deleteChecklistItem = (id: string) => deleteRow("quality_checklist_items", id);

// ---------- Inspections ----------
export const listInspections = (pid: string) => listBy<QInspection>("quality_inspections", pid, "inspection_date");
export async function createInspection(input: TablesInsert<"quality_inspections">) {
  const row = await insertRow<QInspection>("quality_inspections", input);
  await logActivity({ project_id: row.project_id, entity_type: "inspection", entity_id: row.id, action: "created", description: row.title });
  return row;
}
export async function updateInspection(id: string, patch: TablesUpdate<"quality_inspections">) {
  const row = await updateRow<QInspection>("quality_inspections", id, patch);
  if (patch.status === "completed" || patch.status === "approved") {
    await logActivity({ project_id: row.project_id, entity_type: "inspection", entity_id: row.id, action: "completed", description: row.title });
  }
  return row;
}
export const deleteInspection = (id: string) => deleteRow("quality_inspections", id);

// ---------- Acceptances ----------
export const listAcceptances = (pid: string) => listBy<AcceptanceRecord>("acceptance_records", pid, "acceptance_date");
export async function createAcceptance(input: TablesInsert<"acceptance_records">) {
  const row = await insertRow<AcceptanceRecord>("acceptance_records", input);
  await logActivity({ project_id: row.project_id, entity_type: "acceptance", entity_id: row.id, action: "created", description: row.title });
  return row;
}
export async function updateAcceptance(id: string, patch: TablesUpdate<"acceptance_records">) {
  const row = await updateRow<AcceptanceRecord>("acceptance_records", id, patch);
  if (patch.status === "accepted") {
    await logActivity({ project_id: row.project_id, entity_type: "acceptance", entity_id: row.id, action: "accepted", description: row.title });
  }
  return row;
}
export const deleteAcceptance = (id: string) => deleteRow("acceptance_records", id);

// ---------- Punch Lists ----------
export const listPunchLists = (pid: string) => listBy<PunchList>("punch_lists", pid);
export const createPunchList = (input: TablesInsert<"punch_lists">) => insertRow<PunchList>("punch_lists", input);
export const updatePunchList = (id: string, patch: TablesUpdate<"punch_lists">) => updateRow<PunchList>("punch_lists", id, patch);
export const deletePunchList = (id: string) => deleteRow("punch_lists", id);

export async function listPunchItems(punchListId?: string, projectId?: string) {
  let q = supabase.from("punch_list_items").select("*");
  if (punchListId) q = q.eq("punch_list_id", punchListId);
  if (projectId) q = q.eq("project_id", projectId);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PunchListItem[];
}
export async function createPunchItem(input: TablesInsert<"punch_list_items">) {
  const row = await insertRow<PunchListItem>("punch_list_items", input);
  await logActivity({ project_id: row.project_id, entity_type: "punch_item", entity_id: row.id, action: "created", description: row.title });
  return row;
}
export async function updatePunchItem(id: string, patch: TablesUpdate<"punch_list_items">) {
  const row = await updateRow<PunchListItem>("punch_list_items", id, patch);
  if (patch.status === "accepted") {
    await logActivity({ project_id: row.project_id, entity_type: "punch_item", entity_id: row.id, action: "accepted", description: row.title });
  }
  return row;
}
export const deletePunchItem = (id: string) => deleteRow("punch_list_items", id);

// ---------- NCRs ----------
export const listNcrs = (pid: string) => listBy<NcrReport>("ncr_reports", pid);
export async function createNcr(input: TablesInsert<"ncr_reports">) {
  const row = await insertRow<NcrReport>("ncr_reports", input);
  await logActivity({ project_id: row.project_id, entity_type: "ncr", entity_id: row.id, action: "created", description: row.title });
  return row;
}
export async function updateNcr(id: string, patch: TablesUpdate<"ncr_reports">) {
  const row = await updateRow<NcrReport>("ncr_reports", id, patch);
  if (patch.status === "closed") {
    await logActivity({ project_id: row.project_id, entity_type: "ncr", entity_id: row.id, action: "closed", description: row.title });
  }
  return row;
}
export const deleteNcr = (id: string) => deleteRow("ncr_reports", id);

// ---------- Safety Inspections ----------
export const listSafetyInspections = (pid: string) => listBy<SafetyInspection>("safety_inspections", pid, "inspection_date");
export const createSafetyInspection = (input: TablesInsert<"safety_inspections">) => insertRow<SafetyInspection>("safety_inspections", input);
export const updateSafetyInspection = (id: string, patch: TablesUpdate<"safety_inspections">) => updateRow<SafetyInspection>("safety_inspections", id, patch);
export const deleteSafetyInspection = (id: string) => deleteRow("safety_inspections", id);

// ---------- Toolbox Talks ----------
export const listToolboxTalks = (pid: string) => listBy<ToolboxTalk>("toolbox_talks", pid, "date");
export const createToolboxTalk = (input: TablesInsert<"toolbox_talks">) => insertRow<ToolboxTalk>("toolbox_talks", input);
export const updateToolboxTalk = (id: string, patch: TablesUpdate<"toolbox_talks">) => updateRow<ToolboxTalk>("toolbox_talks", id, patch);
export const deleteToolboxTalk = (id: string) => deleteRow("toolbox_talks", id);

// ---------- Safety Observations ----------
export const listObservations = (pid: string) => listBy<SafetyObservation>("safety_observations", pid);
export async function createObservation(input: TablesInsert<"safety_observations">) {
  const row = await insertRow<SafetyObservation>("safety_observations", input);
  await logActivity({ project_id: row.project_id, entity_type: "safety_observation", entity_id: row.id, action: "created", description: row.title });
  return row;
}
export const updateObservation = (id: string, patch: TablesUpdate<"safety_observations">) => updateRow<SafetyObservation>("safety_observations", id, patch);
export const deleteObservation = (id: string) => deleteRow("safety_observations", id);

// ---------- Accident Reports ----------
export const listAccidents = (pid: string) => listBy<AccidentReport>("accident_reports", pid, "accident_date");
export async function createAccident(input: TablesInsert<"accident_reports">) {
  const row = await insertRow<AccidentReport>("accident_reports", input);
  await logActivity({ project_id: row.project_id, entity_type: "accident", entity_id: row.id, action: "created", description: row.location ?? "Accident report" });
  return row;
}
export const updateAccident = (id: string, patch: TablesUpdate<"accident_reports">) => updateRow<AccidentReport>("accident_reports", id, patch);
export const deleteAccident = (id: string) => deleteRow("accident_reports", id);

// ---------- Corrective Actions ----------
export const listCorrectiveActions = (pid: string) => listBy<CorrectiveAction>("corrective_actions", pid);
export const createCorrectiveAction = (input: TablesInsert<"corrective_actions">) => insertRow<CorrectiveAction>("corrective_actions", input);
export async function updateCorrectiveAction(id: string, patch: TablesUpdate<"corrective_actions">) {
  const row = await updateRow<CorrectiveAction>("corrective_actions", id, patch);
  if (patch.status === "completed" || patch.status === "verified") {
    await logActivity({ project_id: row.project_id, entity_type: "corrective_action", entity_id: row.id, action: "completed", description: row.title });
  }
  return row;
}
export const deleteCorrectiveAction = (id: string) => deleteRow("corrective_actions", id);

// ---------- Stats ----------
export async function getQualityStats(projectId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const [openCk, failedItems, upcomingInsp, completedInsp, openNcr, openPunch, pendingAcc, totalItems, passedItems] = await Promise.all([
    supabase.from("quality_checklists").select("id", { count: "exact", head: true }).eq("project_id", projectId).in("status", ["draft", "in_progress"]),
    supabase.from("quality_checklist_items").select("id", { count: "exact", head: true }).eq("project_id", projectId).eq("result", "failed"),
    supabase.from("quality_inspections").select("id", { count: "exact", head: true }).eq("project_id", projectId).gte("inspection_date", today).in("status", ["scheduled", "in_progress"]),
    supabase.from("quality_inspections").select("id", { count: "exact", head: true }).eq("project_id", projectId).in("status", ["completed", "approved"]),
    supabase.from("ncr_reports").select("id", { count: "exact", head: true }).eq("project_id", projectId).not("status", "in", '("closed","rejected")'),
    supabase.from("punch_list_items").select("id", { count: "exact", head: true }).eq("project_id", projectId).not("status", "in", '("accepted","rejected")'),
    supabase.from("acceptance_records").select("id", { count: "exact", head: true }).eq("project_id", projectId).in("status", ["draft", "submitted"]),
    supabase.from("quality_checklist_items").select("id", { count: "exact", head: true }).eq("project_id", projectId).in("result", ["passed", "failed"]),
    supabase.from("quality_checklist_items").select("id", { count: "exact", head: true }).eq("project_id", projectId).eq("result", "passed"),
  ]);
  const total = totalItems.count ?? 0;
  const score = total > 0 ? Math.round(((passedItems.count ?? 0) / total) * 100) : null;
  return {
    openChecklists: openCk.count ?? 0,
    failedItems: failedItems.count ?? 0,
    upcomingInspections: upcomingInsp.count ?? 0,
    completedInspections: completedInsp.count ?? 0,
    openNcrs: openNcr.count ?? 0,
    openPunchItems: openPunch.count ?? 0,
    pendingAcceptances: pendingAcc.count ?? 0,
    qualityScore: score,
  };
}

export async function getSafetyStats(projectId: string) {
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const today = now.toISOString().slice(0, 10);
  const [openObs, accidents, nearMiss, upcomingTt, openCa, totalObs, closedObs] = await Promise.all([
    supabase.from("safety_observations").select("id", { count: "exact", head: true }).eq("project_id", projectId).eq("status", "open"),
    supabase.from("accident_reports").select("id", { count: "exact", head: true }).eq("project_id", projectId).gte("created_at", startMonth),
    supabase.from("safety_observations").select("id", { count: "exact", head: true }).eq("project_id", projectId).eq("observation_type", "risk"),
    supabase.from("toolbox_talks").select("id", { count: "exact", head: true }).eq("project_id", projectId).gte("date", today),
    supabase.from("corrective_actions").select("id", { count: "exact", head: true }).eq("project_id", projectId).not("status", "in", '("completed","verified")'),
    supabase.from("safety_observations").select("id", { count: "exact", head: true }).eq("project_id", projectId),
    supabase.from("safety_observations").select("id", { count: "exact", head: true }).eq("project_id", projectId).eq("status", "closed"),
  ]);
  const total = totalObs.count ?? 0;
  const score = total > 0 ? Math.round(((closedObs.count ?? 0) / total) * 100) : null;
  return {
    openObservations: openObs.count ?? 0,
    accidentsThisMonth: accidents.count ?? 0,
    nearMisses: nearMiss.count ?? 0,
    upcomingToolbox: upcomingTt.count ?? 0,
    openCorrectiveActions: openCa.count ?? 0,
    safetyScore: score,
  };
}
