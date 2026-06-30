import { supabase } from "@/integrations/supabase/client";

export type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "archived";

export interface ProjectRow {
  id: string;
  user_id: string;
  project_number: string;
  name: string;
  client: string | null;
  site_address: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  project_type: string | null;
  building_category: string | null;
  construction_phase: string | null;
  contract_value: number | null;
  planned_start: string | null;
  planned_finish: string | null;
  current_status: string;
  site_manager: string | null;
  foreman: string | null;
  project_manager: string | null;
  safety_manager: string | null;
  client_contact: string | null;
  architect: string | null;
  structural_engineer: string | null;
  mep_engineer: string | null;
  description: string | null;
  notes: string | null;
  cover_image_url: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectInput = Omit<
  ProjectRow,
  "id" | "user_id" | "archived_at" | "created_at" | "updated_at"
>;

export const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Infrastructure",
  "Institutional",
  "Renovation",
  "Mixed-use",
];

export const BUILDING_CATEGORIES = [
  "Single-family home",
  "Multi-family",
  "Office",
  "Retail",
  "Hotel",
  "Warehouse",
  "Factory",
  "Hospital",
  "School",
  "Bridge",
  "Road",
  "Other",
];

export const CONSTRUCTION_PHASES = [
  "Pre-construction",
  "Site preparation",
  "Foundation",
  "Structure",
  "Envelope",
  "MEP rough-in",
  "Interior finishes",
  "Exterior finishes",
  "Commissioning",
  "Handover",
];

export const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
];

export async function listProjects(opts: { archived?: boolean } = {}) {
  const query = supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (opts.archived) {
    query.not("archived_at", "is", null);
  } else {
    query.is("archived_at", null);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ProjectRow[];
}

export async function getProject(id: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as ProjectRow | null;
}

export async function createProject(input: ProjectInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as ProjectRow;
}

export async function updateProject(id: string, input: Partial<ProjectInput>) {
  const { data, error } = await supabase
    .from("projects")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ProjectRow;
}

export async function archiveProject(id: string, archive: boolean) {
  const { error } = await supabase
    .from("projects")
    .update({ archived_at: archive ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadCoverImage(file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("project-covers")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function getCoverSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("project-covers")
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}
