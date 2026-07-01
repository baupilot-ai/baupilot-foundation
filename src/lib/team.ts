import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/site-modules";

// ------- Types -------
export interface Employee {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  role: string;
  trade: string | null;
  employment_type: string | null;
  status: string;
  notes: string | null;
  avatar_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subcontractor {
  id: string;
  company_id: string;
  company_name: string;
  trade: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  insurance_status: string;
  qualification_status: string;
  rating: number | null;
  status: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExternalContact {
  id: string;
  company_id: string;
  project_id: string | null;
  contact_type: string;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role_description: string | null;
  address: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type PersonType = "employee" | "subcontractor" | "external_contact";

export interface ProjectTeamMember {
  id: string;
  company_id: string;
  project_id: string;
  person_type: PersonType;
  employee_id: string | null;
  subcontractor_id: string | null;
  external_contact_id: string | null;
  project_role: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ------- Constants -------
// Note: `label` fields hold i18n keys. Consumers should render them via t().
export const EMPLOYEE_ROLES = [
  { value: "owner", label: "team.roles.owner" },
  { value: "project_manager", label: "team.roles.project_manager" },
  { value: "site_manager", label: "team.roles.site_manager" },
  { value: "foreman", label: "team.roles.foreman" },
  { value: "worker", label: "team.roles.worker" },
  { value: "safety_manager", label: "team.roles.safety_manager" },
  { value: "quality_manager", label: "team.roles.quality_manager" },
  { value: "accountant", label: "team.roles.accountant" },
  { value: "admin", label: "team.roles.admin" },
];

export const TRADES = [
  { value: "general", label: "team.trades.general" },
  { value: "concrete", label: "team.trades.concrete" },
  { value: "formwork", label: "team.trades.formwork" },
  { value: "reinforcement", label: "team.trades.reinforcement" },
  { value: "masonry", label: "team.trades.masonry" },
  { value: "roofing", label: "team.trades.roofing" },
  { value: "electrical", label: "team.trades.electrical" },
  { value: "plumbing", label: "team.trades.plumbing" },
  { value: "hvac", label: "team.trades.hvac" },
  { value: "drywall", label: "team.trades.drywall" },
  { value: "painting", label: "team.trades.painting" },
  { value: "flooring", label: "team.trades.flooring" },
  { value: "other", label: "team.trades.other" },
];

export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "team.employmentTypes.full_time" },
  { value: "part_time", label: "team.employmentTypes.part_time" },
  { value: "temporary", label: "team.employmentTypes.temporary" },
  { value: "external", label: "team.employmentTypes.external" },
  { value: "apprentice", label: "team.employmentTypes.apprentice" },
];

export const EMPLOYEE_STATUS = [
  { value: "active", label: "team.employeeStatus.active", tone: "success" as const },
  { value: "inactive", label: "team.employeeStatus.inactive", tone: "neutral" as const },
  { value: "on_leave", label: "team.employeeStatus.on_leave", tone: "warning" as const },
  { value: "archived", label: "team.employeeStatus.archived", tone: "neutral" as const },
];

export const INSURANCE_STATUS = [
  { value: "unknown", label: "team.insuranceStatus.unknown", tone: "neutral" as const },
  { value: "valid", label: "team.insuranceStatus.valid", tone: "success" as const },
  { value: "expired", label: "team.insuranceStatus.expired", tone: "danger" as const },
  { value: "missing", label: "team.insuranceStatus.missing", tone: "warning" as const },
];

export const QUALIFICATION_STATUS = [
  { value: "not_checked", label: "team.qualificationStatus.not_checked", tone: "neutral" as const },
  { value: "approved", label: "team.qualificationStatus.approved", tone: "success" as const },
  { value: "missing_documents", label: "team.qualificationStatus.missing_documents", tone: "warning" as const },
  { value: "blocked", label: "team.qualificationStatus.blocked", tone: "danger" as const },
];

export const SUBCONTRACTOR_STATUS = [
  { value: "active", label: "team.subcontractorStatus.active", tone: "success" as const },
  { value: "inactive", label: "team.subcontractorStatus.inactive", tone: "neutral" as const },
  { value: "blocked", label: "team.subcontractorStatus.blocked", tone: "danger" as const },
  { value: "archived", label: "team.subcontractorStatus.archived", tone: "neutral" as const },
];

export const CONTACT_TYPES = [
  { value: "client", label: "team.contactTypes.client" },
  { value: "architect", label: "team.contactTypes.architect" },
  { value: "structural_engineer", label: "team.contactTypes.structural_engineer" },
  { value: "mep_engineer", label: "team.contactTypes.mep_engineer" },
  { value: "authority", label: "team.contactTypes.authority" },
  { value: "surveyor", label: "team.contactTypes.surveyor" },
  { value: "consultant", label: "team.contactTypes.consultant" },
  { value: "supplier", label: "team.contactTypes.supplier" },
  { value: "other", label: "team.contactTypes.other" },
];

export const PROJECT_ROLES = [
  { value: "project_manager", label: "team.roles.project_manager" },
  { value: "site_manager", label: "team.roles.site_manager" },
  { value: "foreman", label: "team.roles.foreman" },
  { value: "worker", label: "team.roles.worker" },
  { value: "safety_manager", label: "team.roles.safety_manager" },
  { value: "quality_manager", label: "team.roles.quality_manager" },
  { value: "subcontractor", label: "team.roles.subcontractor" },
  { value: "client_contact", label: "team.roles.client_contact" },
  { value: "architect", label: "team.roles.architect" },
  { value: "engineer", label: "team.roles.engineer" },
  { value: "consultant", label: "team.roles.consultant" },
];

export function labelOf(arr: { value: string; label: string }[], v: string | null | undefined) {
  if (!v) return "—";
  return arr.find((a) => a.value === v)?.label ?? v;
}

export function fullName(p: { first_name?: string | null; last_name?: string | null }) {
  return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
}


// ------- Employees -------
export async function listEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Employee[];
}
export async function getEmployee(id: string) {
  const { data, error } = await supabase.from("employees").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Employee | null;
}
export async function createEmployee(input: Partial<Employee>) {
  const { data, error } = await supabase.from("employees").insert(input as never).select().single();
  if (error) throw error;
  const row = data as Employee;
  await logActivity({
    entity_type: "employee",
    entity_id: row.id,
    action: "created",
    description: `Employee ${fullName(row)} added`,
  });
  return row;
}
export async function updateEmployee(id: string, patch: Partial<Employee>) {
  const { data, error } = await supabase.from("employees").update(patch as never).eq("id", id).select().single();
  if (error) throw error;
  const row = data as Employee;
  await logActivity({
    entity_type: "employee",
    entity_id: row.id,
    action: "updated",
    description: `Employee ${fullName(row)} updated`,
  });
  return row;
}
export async function archiveEmployee(id: string, archived: boolean) {
  return updateEmployee(id, { status: archived ? "archived" : "active" });
}
export async function deleteEmployee(id: string) {
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw error;
}

// ------- Subcontractors -------
export async function listSubcontractors(): Promise<Subcontractor[]> {
  const { data, error } = await supabase
    .from("subcontractors")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Subcontractor[];
}
export async function getSubcontractor(id: string) {
  const { data, error } = await supabase.from("subcontractors").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Subcontractor | null;
}
export async function createSubcontractor(input: Partial<Subcontractor>) {
  const { data, error } = await supabase.from("subcontractors").insert(input as never).select().single();
  if (error) throw error;
  const row = data as Subcontractor;
  await logActivity({
    entity_type: "subcontractor",
    entity_id: row.id,
    action: "created",
    description: `Subcontractor ${row.company_name} added`,
  });
  return row;
}
export async function updateSubcontractor(id: string, patch: Partial<Subcontractor>) {
  const { data, error } = await supabase.from("subcontractors").update(patch as never).eq("id", id).select().single();
  if (error) throw error;
  const row = data as Subcontractor;
  await logActivity({
    entity_type: "subcontractor",
    entity_id: row.id,
    action: "updated",
    description: `Subcontractor ${row.company_name} updated`,
  });
  return row;
}
export async function deleteSubcontractor(id: string) {
  const { error } = await supabase.from("subcontractors").delete().eq("id", id);
  if (error) throw error;
}

// ------- External Contacts (project-scoped) -------
export async function listProjectContacts(projectId: string): Promise<ExternalContact[]> {
  const { data, error } = await supabase
    .from("external_contacts")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ExternalContact[];
}
export async function createContact(input: Partial<ExternalContact>) {
  const { data, error } = await supabase.from("external_contacts").insert(input as never).select().single();
  if (error) throw error;
  const row = data as ExternalContact;
  await logActivity({
    project_id: row.project_id ?? undefined,
    entity_type: "contact",
    entity_id: row.id,
    action: "created",
    description: `Contact ${fullName(row) || row.company_name || row.email || "added"}`,
  });
  return row;
}
export async function updateContact(id: string, patch: Partial<ExternalContact>) {
  const { data, error } = await supabase.from("external_contacts").update(patch as never).eq("id", id).select().single();
  if (error) throw error;
  return data as ExternalContact;
}
export async function deleteContact(id: string) {
  const { error } = await supabase.from("external_contacts").delete().eq("id", id);
  if (error) throw error;
}

// ------- Project Team Members -------
export async function listProjectTeam(projectId: string): Promise<ProjectTeamMember[]> {
  const { data, error } = await supabase
    .from("project_team_members")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectTeamMember[];
}
export async function addProjectTeamMember(input: Partial<ProjectTeamMember>) {
  const { data, error } = await supabase.from("project_team_members").insert(input as never).select().single();
  if (error) throw error;
  const row = data as ProjectTeamMember;
  await logActivity({
    project_id: row.project_id,
    entity_type: "team_member",
    entity_id: row.id,
    action: "assigned",
    description: `Team member assigned (${row.project_role ?? row.person_type})`,
  });
  // If employee, also create an assignment record for easy querying
  if (row.person_type === "employee" && row.employee_id) {
    await supabase.from("employee_assignments").insert({
      employee_id: row.employee_id,
      project_id: row.project_id,
      assignment_role: row.project_role,
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
    } as never);
  }
  return row;
}
export async function updateProjectTeamMember(id: string, patch: Partial<ProjectTeamMember>) {
  const { data, error } = await supabase
    .from("project_team_members").update(patch as never).eq("id", id).select().single();
  if (error) throw error;
  return data as ProjectTeamMember;
}
export async function removeProjectTeamMember(id: string) {
  const { data: existing } = await supabase.from("project_team_members").select("*").eq("id", id).maybeSingle();
  const { error } = await supabase.from("project_team_members").delete().eq("id", id);
  if (error) throw error;
  if (existing) {
    const row = existing as ProjectTeamMember;
    await logActivity({
      project_id: row.project_id,
      entity_type: "team_member",
      entity_id: row.id,
      action: "removed",
      description: `Team member removed`,
    });
    if (row.person_type === "employee" && row.employee_id) {
      await supabase
        .from("employee_assignments")
        .delete()
        .eq("employee_id", row.employee_id)
        .eq("project_id", row.project_id);
    }
  }
}

// ------- Dashboard / project stats -------
export async function getTeamDashboardStats() {
  const [emp, sub, ea, ptmSubs] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("subcontractors").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("employee_assignments").select("employee_id").eq("status", "active"),
    supabase
      .from("project_team_members")
      .select("subcontractor_id")
      .eq("person_type", "subcontractor")
      .eq("status", "active"),
  ]);
  const assignedEmployees = new Set((ea.data ?? []).map((r: { employee_id: string }) => r.employee_id)).size;
  const assignedSubs = new Set(
    (ptmSubs.data ?? []).map((r: { subcontractor_id: string | null }) => r.subcontractor_id).filter(Boolean),
  ).size;
  return {
    activeEmployees: emp.count ?? 0,
    activeSubcontractors: sub.count ?? 0,
    assignedEmployees,
    assignedSubcontractors: assignedSubs,
  };
}

export async function getProjectPeopleStats(projectId: string) {
  const [team, contacts] = await Promise.all([
    supabase.from("project_team_members").select("person_type").eq("project_id", projectId).eq("status", "active"),
    supabase.from("external_contacts").select("id", { count: "exact", head: true }).eq("project_id", projectId),
  ]);
  const t = team.data ?? [];
  return {
    employees: t.filter((r: { person_type: string }) => r.person_type === "employee").length,
    subcontractors: t.filter((r: { person_type: string }) => r.person_type === "subcontractor").length,
    contacts: contacts.count ?? 0,
  };
}
