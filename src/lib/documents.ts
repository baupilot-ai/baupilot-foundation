import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/site-modules";

export type ProjectDocument = Tables<"project_documents">;
export type DocumentFolder = Tables<"document_folders">;
export type DocumentVersion = Tables<"document_versions">;
export type PlanSet = Tables<"plan_sets">;
export type ProjectPlan = Tables<"project_plans">;
export type PlanRevision = Tables<"plan_revisions">;

export const DOCUMENT_CATEGORIES = [
  { value: "contract", label: "Contract" },
  { value: "invoice", label: "Invoice" },
  { value: "delivery_note", label: "Delivery note" },
  { value: "safety", label: "Safety" },
  { value: "quality", label: "Quality" },
  { value: "photo_doc", label: "Photo documentation" },
  { value: "correspondence", label: "Correspondence" },
  { value: "report", label: "Report" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
];
export function categoryLabel(v: string) {
  return DOCUMENT_CATEGORIES.find((c) => c.value === v)?.label ?? v;
}

export const DOCUMENT_STATUS = [
  { value: "draft", label: "Draft", tone: "neutral" as const },
  { value: "active", label: "Active", tone: "info" as const },
  { value: "superseded", label: "Superseded", tone: "warning" as const },
  { value: "archived", label: "Archived", tone: "neutral" as const },
];
export function docStatusMeta(v: string) {
  return DOCUMENT_STATUS.find((s) => s.value === v) ?? { value: v, label: v, tone: "neutral" as const };
}

export const PLAN_DISCIPLINES = [
  "Architecture", "Structural", "MEP", "Electrical", "HVAC",
  "Plumbing", "Fire protection", "Civil", "Landscape", "Other",
];

export const PLAN_STATUS = [
  { value: "draft", label: "Draft", tone: "neutral" as const },
  { value: "for_review", label: "For review", tone: "warning" as const },
  { value: "approved", label: "Approved", tone: "success" as const },
  { value: "superseded", label: "Superseded", tone: "neutral" as const },
  { value: "archived", label: "Archived", tone: "neutral" as const },
];
export function planStatusMeta(v: string) {
  return PLAN_STATUS.find((s) => s.value === v) ?? { value: v, label: v, tone: "neutral" as const };
}

// ---------- helpers ----------
async function currentCompanyId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase.from("profiles").select("company_id").eq("id", user.id).maybeSingle();
  if (error) throw error;
  if (!data?.company_id) throw new Error("No company on profile");
  return data.company_id;
}

function extOf(name: string) {
  const ix = name.lastIndexOf(".");
  return ix >= 0 ? name.slice(ix + 1).toLowerCase() : "bin";
}

export async function getSignedUrl(bucket: "project-documents" | "project-plans", path: string, expires = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expires);
  if (error) throw error;
  return data.signedUrl;
}

// ---------- Folders ----------
export async function listFolders(projectId: string) {
  const { data, error } = await supabase
    .from("document_folders").select("*").eq("project_id", projectId).order("name");
  if (error) throw error;
  return (data ?? []) as DocumentFolder[];
}
export async function createFolder(projectId: string, name: string, parent_folder_id: string | null = null) {
  const { data, error } = await supabase.from("document_folders")
    .insert({ project_id: projectId, name, parent_folder_id } as TablesInsert<"document_folders">)
    .select().single();
  if (error) throw error;
  return data as DocumentFolder;
}
export async function renameFolder(id: string, name: string) {
  const { error } = await supabase.from("document_folders").update({ name }).eq("id", id);
  if (error) throw error;
}
export async function deleteFolder(id: string) {
  const { count } = await supabase.from("project_documents").select("id", { count: "exact", head: true }).eq("folder_id", id);
  if ((count ?? 0) > 0) throw new Error("Folder is not empty");
  const { error } = await supabase.from("document_folders").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Documents ----------
export async function listDocuments(projectId: string) {
  const { data, error } = await supabase
    .from("project_documents").select("*").eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectDocument[];
}

export async function uploadDocument(opts: {
  projectId: string;
  file: File;
  title: string;
  description?: string;
  category: string;
  folder_id?: string | null;
  status?: string;
}) {
  const companyId = await currentCompanyId();
  const path = `${companyId}/${opts.projectId}/documents/${crypto.randomUUID()}.${extOf(opts.file.name)}`;
  const up = await supabase.storage.from("project-documents").upload(path, opts.file, { contentType: opts.file.type || undefined });
  if (up.error) throw up.error;
  const ins = {
    company_id: companyId,
    project_id: opts.projectId,
    folder_id: opts.folder_id ?? null,
    title: opts.title,
    description: opts.description ?? null,
    file_url: path,
    file_name: opts.file.name,
    file_type: opts.file.type || extOf(opts.file.name),
    file_size: opts.file.size,
    category: opts.category,
    status: opts.status ?? "active",
    version: 1,
  };
  const { data, error } = await supabase.from("project_documents").insert(ins).select().single();
  if (error) throw error;
  await logActivity({ project_id: opts.projectId, entity_type: "document", entity_id: data.id, action: "uploaded", description: opts.title });
  return data as ProjectDocument;
}

export async function updateDocument(id: string, patch: TablesUpdate<"project_documents">) {
  const { data, error } = await supabase.from("project_documents").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as ProjectDocument;
}

export async function deleteDocument(doc: ProjectDocument) {
  // remove versions files
  const { data: vers } = await supabase.from("document_versions").select("file_url").eq("document_id", doc.id);
  const paths = [doc.file_url, ...(vers ?? []).map((v) => v.file_url)].filter(Boolean) as string[];
  if (paths.length) await supabase.storage.from("project-documents").remove(paths).catch(() => {});
  const { error } = await supabase.from("project_documents").delete().eq("id", doc.id);
  if (error) throw error;
  await logActivity({ project_id: doc.project_id, entity_type: "document", entity_id: doc.id, action: "deleted", description: doc.title });
}

export async function listDocumentVersions(documentId: string) {
  const { data, error } = await supabase.from("document_versions")
    .select("*").eq("document_id", documentId).order("version", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentVersion[];
}

export async function uploadNewDocumentVersion(doc: ProjectDocument, file: File) {
  const companyId = await currentCompanyId();
  const path = `${companyId}/${doc.project_id}/documents/${crypto.randomUUID()}.${extOf(file.name)}`;
  const up = await supabase.storage.from("project-documents").upload(path, file, { contentType: file.type || undefined });
  if (up.error) throw up.error;
  // archive prior file into versions
  await supabase.from("document_versions").insert({
    document_id: doc.id,
    project_id: doc.project_id,
    file_url: doc.file_url,
    file_name: doc.file_name,
    file_size: doc.file_size,
    version: doc.version,
  } as TablesInsert<"document_versions">);
  // set new current
  const newVersion = (doc.version ?? 1) + 1;
  const { data, error } = await supabase.from("project_documents").update({
    file_url: path, file_name: file.name, file_type: file.type || extOf(file.name), file_size: file.size, version: newVersion,
  }).eq("id", doc.id).select().single();
  if (error) throw error;
  await logActivity({ project_id: doc.project_id, entity_type: "document", entity_id: doc.id, action: "new_version", description: `${doc.title} v${newVersion}` });
  return data as ProjectDocument;
}

// ---------- Plan sets ----------
export async function listPlanSets(projectId: string) {
  const { data, error } = await supabase.from("plan_sets").select("*").eq("project_id", projectId).order("name");
  if (error) throw error;
  return (data ?? []) as PlanSet[];
}
export async function createPlanSet(input: { project_id: string; name: string; description?: string; discipline?: string; status?: string }) {
  const { data, error } = await supabase.from("plan_sets").insert(input as TablesInsert<"plan_sets">).select().single();
  if (error) throw error;
  return data as PlanSet;
}

// ---------- Plans ----------
export async function listPlans(projectId: string) {
  const { data, error } = await supabase
    .from("project_plans").select("*").eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectPlan[];
}

export async function uploadPlan(opts: {
  projectId: string;
  file: File;
  plan_number: string;
  title: string;
  discipline?: string;
  revision?: string;
  status?: string;
  plan_set_id?: string | null;
}) {
  const companyId = await currentCompanyId();
  const path = `${companyId}/${opts.projectId}/plans/${crypto.randomUUID()}.${extOf(opts.file.name)}`;
  const up = await supabase.storage.from("project-plans").upload(path, opts.file, { contentType: opts.file.type || undefined });
  if (up.error) throw up.error;
  const ins = {
    company_id: companyId,
    project_id: opts.projectId,
    plan_set_id: opts.plan_set_id ?? null,
    plan_number: opts.plan_number,
    title: opts.title,
    discipline: opts.discipline ?? null,
    revision: opts.revision ?? "A",
    status: opts.status ?? "draft",
    file_url: path,
    file_name: opts.file.name,
    file_type: opts.file.type || extOf(opts.file.name),
    file_size: opts.file.size,
  };
  const { data, error } = await supabase.from("project_plans").insert(ins).select().single();
  if (error) throw error;
  await logActivity({ project_id: opts.projectId, entity_type: "plan", entity_id: data.id, action: "uploaded", description: `${opts.plan_number} ${opts.title}` });
  return data as ProjectPlan;
}

export async function updatePlan(id: string, patch: TablesUpdate<"project_plans">, opts?: { project_id?: string }) {
  const { data, error } = await supabase.from("project_plans").update(patch).eq("id", id).select().single();
  if (error) throw error;
  if (patch.status && opts?.project_id) {
    await logActivity({ project_id: opts.project_id, entity_type: "plan", entity_id: id, action: "status_changed", description: `Plan → ${patch.status}` });
  }
  return data as ProjectPlan;
}

export async function deletePlan(plan: ProjectPlan) {
  const { data: revs } = await supabase.from("plan_revisions").select("file_url").eq("plan_id", plan.id);
  const paths = [plan.file_url, ...(revs ?? []).map((r) => r.file_url)].filter(Boolean) as string[];
  if (paths.length) await supabase.storage.from("project-plans").remove(paths).catch(() => {});
  const { error } = await supabase.from("project_plans").delete().eq("id", plan.id);
  if (error) throw error;
  await logActivity({ project_id: plan.project_id, entity_type: "plan", entity_id: plan.id, action: "deleted", description: plan.plan_number });
}

export async function listPlanRevisions(planId: string) {
  const { data, error } = await supabase.from("plan_revisions")
    .select("*").eq("plan_id", planId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PlanRevision[];
}

export async function uploadNewPlanRevision(plan: ProjectPlan, file: File, revision: string) {
  const companyId = await currentCompanyId();
  const path = `${companyId}/${plan.project_id}/plans/${crypto.randomUUID()}.${extOf(file.name)}`;
  const up = await supabase.storage.from("project-plans").upload(path, file, { contentType: file.type || undefined });
  if (up.error) throw up.error;
  await supabase.from("plan_revisions").insert({
    plan_id: plan.id,
    project_id: plan.project_id,
    revision: plan.revision,
    file_url: plan.file_url,
    file_name: plan.file_name,
    file_size: plan.file_size,
  } as TablesInsert<"plan_revisions">);
  const { data, error } = await supabase.from("project_plans").update({
    file_url: path, file_name: file.name, file_type: file.type || extOf(file.name), file_size: file.size, revision,
  }).eq("id", plan.id).select().single();
  if (error) throw error;
  await logActivity({ project_id: plan.project_id, entity_type: "plan", entity_id: plan.id, action: "new_revision", description: `${plan.plan_number} → ${revision}` });
  return data as ProjectPlan;
}

// ---------- Stats ----------
export async function getDocumentsPlansStats(projectId: string) {
  const [docs, latestDoc, plans, latestPlan] = await Promise.all([
    supabase.from("project_documents").select("id", { count: "exact", head: true }).eq("project_id", projectId),
    supabase.from("project_documents").select("title, created_at").eq("project_id", projectId).order("created_at", { ascending: false }).limit(1),
    supabase.from("project_plans").select("id", { count: "exact", head: true }).eq("project_id", projectId),
    supabase.from("project_plans").select("plan_number, revision, created_at").eq("project_id", projectId).order("created_at", { ascending: false }).limit(1),
  ]);
  return {
    documentsCount: docs.count ?? 0,
    latestDocument: latestDoc.data?.[0] ?? null,
    plansCount: plans.count ?? 0,
    latestPlan: latestPlan.data?.[0] ?? null,
  };
}

export async function getDashboardDocStats() {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const [week, awaiting, superseded] = await Promise.all([
    supabase.from("project_documents").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("project_plans").select("id", { count: "exact", head: true }).eq("status", "for_review"),
    supabase.from("project_plans").select("id", { count: "exact", head: true }).eq("status", "superseded"),
  ]);
  return {
    docsThisWeek: week.count ?? 0,
    plansAwaitingReview: awaiting.count ?? 0,
    supersededPlans: superseded.count ?? 0,
  };
}

export function humanFileSize(bytes?: number | null) {
  if (bytes == null) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes; let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}
