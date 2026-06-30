import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/site-modules";

export type Equipment = Tables<"equipment">;
export type Tool = Tables<"tools">;
export type Material = Tables<"materials">;
export type InventoryLocation = Tables<"inventory_locations">;
export type InventoryStock = Tables<"inventory_stock">;
export type Delivery = Tables<"deliveries">;
export type DeliveryItem = Tables<"delivery_items">;
export type MaterialUsage = Tables<"material_usage">;
export type EquipmentAssignment = Tables<"equipment_assignments">;
export type ToolAssignment = Tables<"tool_assignments">;
export type MaintenanceRecord = Tables<"maintenance_records">;

// ---------- Constants ----------
export const EQUIPMENT_CATEGORIES = [
  "Crane", "Excavator", "Loader", "Concrete equipment", "Compaction",
  "Lifting equipment", "Scaffolding", "Vehicle", "Surveying", "Power tools", "Other",
];
export const EQUIPMENT_STATUS = [
  { value: "available", label: "Available", tone: "success" as const },
  { value: "assigned", label: "Assigned", tone: "info" as const },
  { value: "maintenance", label: "In maintenance", tone: "warning" as const },
  { value: "defective", label: "Defective", tone: "danger" as const },
  { value: "lost", label: "Lost", tone: "danger" as const },
  { value: "archived", label: "Archived", tone: "neutral" as const },
];

export const TOOL_CATEGORIES = [
  "Measuring", "Drilling", "Cutting", "Formwork tools", "Electrical tools",
  "Safety equipment", "Hand tools", "Other",
];
export const TOOL_STATUS = [
  { value: "available", label: "Available", tone: "success" as const },
  { value: "assigned", label: "Assigned", tone: "info" as const },
  { value: "defective", label: "Defective", tone: "danger" as const },
  { value: "lost", label: "Lost", tone: "danger" as const },
  { value: "archived", label: "Archived", tone: "neutral" as const },
];

export const MATERIAL_CATEGORIES = [
  "Concrete", "Reinforcement steel", "Formwork", "Timber", "Masonry",
  "Insulation", "Waterproofing", "Drywall", "Electrical", "Plumbing",
  "HVAC", "Consumables", "Other",
];
export const MATERIAL_UNITS = ["pcs", "m", "m2", "m3", "kg", "t", "l", "pallet", "roll", "bag"];

export const LOCATION_TYPES = [
  "Company warehouse", "Project site", "Container", "Vehicle", "External warehouse",
];

export const DELIVERY_STATUS = [
  { value: "expected", label: "Expected", tone: "neutral" as const },
  { value: "arrived", label: "Arrived", tone: "info" as const },
  { value: "partial", label: "Partially received", tone: "warning" as const },
  { value: "received", label: "Received", tone: "success" as const },
  { value: "cancelled", label: "Cancelled", tone: "neutral" as const },
  { value: "delayed", label: "Delayed", tone: "danger" as const },
];

export function statusMeta<T extends { value: string; label: string; tone: "info" | "neutral" | "warning" | "success" | "danger" }>(
  list: T[], value: string | null,
) {
  return list.find((s) => s.value === value) ?? { value: value ?? "", label: value ?? "—", tone: "neutral" as const };
}

// ---------- QR helpers ----------
export function generateQR(prefix: "EQ" | "TOOL" | "MAT"): string {
  const n = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}-${n}`;
}

// ---------- Equipment ----------
export async function listEquipment(opts?: { projectId?: string; status?: string; category?: string }) {
  let q = supabase.from("equipment").select("*").order("created_at", { ascending: false });
  if (opts?.projectId) q = q.eq("current_project_id", opts.projectId);
  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.category) q = q.eq("category", opts.category);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Equipment[];
}
export async function createEquipment(input: TablesInsert<"equipment">) {
  const { data, error } = await supabase.from("equipment").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: input.current_project_id ?? null, entity_type: "equipment", entity_id: data.id, action: "created", description: data.name });
  return data as Equipment;
}
export async function updateEquipment(id: string, patch: TablesUpdate<"equipment">) {
  const { data, error } = await supabase.from("equipment").update(patch).eq("id", id).select().single();
  if (error) throw error;
  if (patch.status === "defective") {
    await logActivity({ project_id: data.current_project_id, entity_type: "equipment", entity_id: id, action: "marked_defective", description: data.name });
  }
  return data as Equipment;
}
export async function deleteEquipment(id: string) {
  const { error } = await supabase.from("equipment").delete().eq("id", id);
  if (error) throw error;
}
export async function assignEquipment(equipmentId: string, projectId: string | null, assignedTo?: string | null) {
  const eq = await updateEquipment(equipmentId, {
    current_project_id: projectId,
    responsible_person: assignedTo ?? undefined,
    status: projectId ? "assigned" : "available",
  });
  if (projectId) {
    await supabase.from("equipment_assignments").insert({
      equipment_id: equipmentId, project_id: projectId,
      assigned_to: assignedTo ?? null, start_date: new Date().toISOString().slice(0, 10),
      status: "active",
    } as TablesInsert<"equipment_assignments">);
    await logActivity({ project_id: projectId, entity_type: "equipment", entity_id: equipmentId, action: "assigned", description: `${eq.name} assigned to project` });
  } else {
    await logActivity({ project_id: null, entity_type: "equipment", entity_id: equipmentId, action: "unassigned", description: `${eq.name} unassigned` });
  }
  return eq;
}

// ---------- Tools ----------
export async function listTools(opts?: { status?: string; category?: string }) {
  let q = supabase.from("tools").select("*").order("created_at", { ascending: false });
  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.category) q = q.eq("category", opts.category);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Tool[];
}
export async function createTool(input: TablesInsert<"tools">) {
  const { data, error } = await supabase.from("tools").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: input.current_project_id ?? null, entity_type: "tool", entity_id: data.id, action: "created", description: data.name });
  return data as Tool;
}
export async function updateTool(id: string, patch: TablesUpdate<"tools">) {
  const { data, error } = await supabase.from("tools").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as Tool;
}
export async function deleteTool(id: string) {
  const { error } = await supabase.from("tools").delete().eq("id", id);
  if (error) throw error;
}
export async function assignTool(toolId: string, projectId: string | null, assignedTo?: string | null) {
  const t = await updateTool(toolId, {
    current_project_id: projectId,
    responsible_person: assignedTo ?? undefined,
    status: projectId || assignedTo ? "assigned" : "available",
  });
  if (projectId) {
    await supabase.from("tool_assignments").insert({
      tool_id: toolId, project_id: projectId, assigned_to: assignedTo ?? null,
      start_date: new Date().toISOString().slice(0, 10), status: "active",
    } as TablesInsert<"tool_assignments">);
    await logActivity({ project_id: projectId, entity_type: "tool", entity_id: toolId, action: "assigned", description: `${t.name} assigned` });
  }
  return t;
}

// ---------- Materials ----------
export async function listMaterials(opts?: { category?: string; supplier?: string; includeArchived?: boolean }) {
  let q = supabase.from("materials").select("*").order("name");
  if (!opts?.includeArchived) q = q.eq("archived", false);
  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.supplier) q = q.eq("supplier", opts.supplier);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Material[];
}
export async function createMaterial(input: TablesInsert<"materials">) {
  const { data, error } = await supabase.from("materials").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: null, entity_type: "material", entity_id: data.id, action: "created", description: data.name });
  return data as Material;
}
export async function updateMaterial(id: string, patch: TablesUpdate<"materials">) {
  const { data, error } = await supabase.from("materials").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as Material;
}
export async function deleteMaterial(id: string) {
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Inventory ----------
export async function listInventoryLocations() {
  const { data, error } = await supabase.from("inventory_locations").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as InventoryLocation[];
}
export async function createInventoryLocation(input: TablesInsert<"inventory_locations">) {
  const { data, error } = await supabase.from("inventory_locations").insert(input).select().single();
  if (error) throw error;
  return data as InventoryLocation;
}
export async function updateInventoryLocation(id: string, patch: TablesUpdate<"inventory_locations">) {
  const { error } = await supabase.from("inventory_locations").update(patch).eq("id", id);
  if (error) throw error;
}
export async function deleteInventoryLocation(id: string) {
  const { error } = await supabase.from("inventory_locations").delete().eq("id", id);
  if (error) throw error;
}

export type StockRow = InventoryStock & { material?: Material | null; location?: InventoryLocation | null };
export async function listStock(): Promise<StockRow[]> {
  const { data, error } = await supabase
    .from("inventory_stock")
    .select("*, material:materials(*), location:inventory_locations(*)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as StockRow[];
}
export async function adjustStock(materialId: string, locationId: string, delta: number, projectId?: string | null) {
  // Upsert by (material_id, location_id)
  const { data: existing } = await supabase
    .from("inventory_stock").select("*")
    .eq("material_id", materialId).eq("location_id", locationId).maybeSingle();
  if (existing) {
    const newQty = Number(existing.quantity) + delta;
    const { error } = await supabase.from("inventory_stock")
      .update({ quantity: newQty, project_id: projectId ?? existing.project_id })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("inventory_stock").insert({
      material_id: materialId, location_id: locationId, quantity: delta, project_id: projectId ?? null,
    } as TablesInsert<"inventory_stock">);
    if (error) throw error;
  }
  await logActivity({ project_id: projectId ?? null, entity_type: "stock", entity_id: materialId, action: "stock_changed", description: `Stock adjusted ${delta >= 0 ? "+" : ""}${delta}` });
}
export async function moveStock(materialId: string, fromLocationId: string, toLocationId: string, qty: number) {
  await adjustStock(materialId, fromLocationId, -qty);
  await adjustStock(materialId, toLocationId, qty);
}

// ---------- Deliveries ----------
export type DeliveryWithItems = Delivery & { items?: DeliveryItem[] };
export async function listDeliveries(opts?: { projectId?: string; status?: string; supplier?: string }) {
  let q = supabase.from("deliveries").select("*, items:delivery_items(*)").order("delivery_date", { ascending: false, nullsFirst: false });
  if (opts?.projectId) q = q.eq("project_id", opts.projectId);
  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.supplier) q = q.eq("supplier", opts.supplier);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DeliveryWithItems[];
}
export async function createDelivery(input: TablesInsert<"deliveries">, items: Omit<TablesInsert<"delivery_items">, "delivery_id">[] = []) {
  const { data, error } = await supabase.from("deliveries").insert(input).select().single();
  if (error) throw error;
  if (items.length) {
    const rows = items.map((i) => ({ ...i, delivery_id: data.id }));
    const { error: e2 } = await supabase.from("delivery_items").insert(rows as TablesInsert<"delivery_items">[]);
    if (e2) throw e2;
  }
  await logActivity({ project_id: input.project_id ?? null, entity_type: "delivery", entity_id: data.id, action: "created", description: `Delivery from ${input.supplier ?? "supplier"}` });
  return data as Delivery;
}
export async function updateDelivery(id: string, patch: TablesUpdate<"deliveries">) {
  const { data, error } = await supabase.from("deliveries").update(patch).eq("id", id).select().single();
  if (error) throw error;
  if (patch.status === "received") {
    await logActivity({ project_id: data.project_id, entity_type: "delivery", entity_id: id, action: "received", description: `Delivery received` });
  }
  return data as Delivery;
}
export async function deleteDelivery(id: string) {
  const { error } = await supabase.from("deliveries").delete().eq("id", id);
  if (error) throw error;
}
export async function addDeliveryItem(input: TablesInsert<"delivery_items">) {
  const { error } = await supabase.from("delivery_items").insert(input);
  if (error) throw error;
}
export async function deleteDeliveryItem(id: string) {
  const { error } = await supabase.from("delivery_items").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Material usage ----------
export async function listMaterialUsage(projectId: string) {
  const { data, error } = await supabase
    .from("material_usage").select("*, material:materials(*)")
    .eq("project_id", projectId).order("usage_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Array<MaterialUsage & { material?: Material | null }>;
}
export async function createMaterialUsage(input: TablesInsert<"material_usage">) {
  const { data, error } = await supabase.from("material_usage").insert(input).select().single();
  if (error) throw error;
  return data as MaterialUsage;
}
export async function deleteMaterialUsage(id: string) {
  const { error } = await supabase.from("material_usage").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Maintenance ----------
export async function listMaintenance(opts?: { equipmentId?: string; toolId?: string }) {
  let q = supabase.from("maintenance_records").select("*, equipment:equipment(*), tool:tools(*)").order("performed_date", { ascending: false, nullsFirst: false });
  if (opts?.equipmentId) q = q.eq("equipment_id", opts.equipmentId);
  if (opts?.toolId) q = q.eq("tool_id", opts.toolId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}
export async function createMaintenance(input: TablesInsert<"maintenance_records">) {
  const { data, error } = await supabase.from("maintenance_records").insert(input).select().single();
  if (error) throw error;
  await logActivity({ project_id: null, entity_type: "maintenance", entity_id: data.id, action: "created", description: data.title });
  if (input.equipment_id && input.next_due_date) {
    await supabase.from("equipment").update({ maintenance_due_date: input.next_due_date }).eq("id", input.equipment_id);
  }
  return data as MaintenanceRecord;
}
export async function deleteMaintenance(id: string) {
  const { error } = await supabase.from("maintenance_records").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Dashboard stats ----------
export async function getResourceDashboardStats() {
  const today = new Date().toISOString().slice(0, 10);
  const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const monthAhead = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const [available, assigned, defective, mats, deliveriesUpcoming, deliveriesDelayed, maintDue, stock] = await Promise.all([
    supabase.from("equipment").select("id", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("equipment").select("id", { count: "exact", head: true }).eq("status", "assigned"),
    supabase.from("equipment").select("id", { count: "exact", head: true }).eq("status", "defective"),
    supabase.from("materials").select("id, minimum_stock").eq("archived", false),
    supabase.from("deliveries").select("id", { count: "exact", head: true }).eq("status", "expected").gte("delivery_date", today).lte("delivery_date", weekAhead),
    supabase.from("deliveries").select("id", { count: "exact", head: true }).eq("status", "delayed"),
    supabase.from("equipment").select("id", { count: "exact", head: true }).not("maintenance_due_date", "is", null).lte("maintenance_due_date", monthAhead),
    supabase.from("inventory_stock").select("material_id, quantity"),
  ]);
  // Low stock: aggregate stock per material, compare to minimum_stock
  const stockByMat = new Map<string, number>();
  for (const r of stock.data ?? []) stockByMat.set(r.material_id, (stockByMat.get(r.material_id) ?? 0) + Number(r.quantity));
  let lowStock = 0;
  for (const m of mats.data ?? []) {
    if (m.minimum_stock != null && Number(m.minimum_stock) > 0) {
      const have = stockByMat.get(m.id) ?? 0;
      if (have < Number(m.minimum_stock)) lowStock++;
    }
  }
  return {
    equipmentAvailable: available.count ?? 0,
    equipmentAssigned: assigned.count ?? 0,
    equipmentDefective: defective.count ?? 0,
    lowStock,
    deliveriesUpcoming: deliveriesUpcoming.count ?? 0,
    deliveriesDelayed: deliveriesDelayed.count ?? 0,
    maintenanceDueSoon: maintDue.count ?? 0,
  };
}

// ---------- Project stats ----------
export async function getProjectResourceStats(projectId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const [equipment, tools, deliveriesWeek, usage, overdueMaint] = await Promise.all([
    supabase.from("equipment").select("id", { count: "exact", head: true }).eq("current_project_id", projectId),
    supabase.from("tools").select("id", { count: "exact", head: true }).eq("current_project_id", projectId),
    supabase.from("deliveries").select("id", { count: "exact", head: true }).eq("project_id", projectId).gte("delivery_date", weekAgo).lte("delivery_date", weekAhead),
    supabase.from("material_usage").select("id", { count: "exact", head: true }).eq("project_id", projectId),
    supabase.from("equipment").select("id", { count: "exact", head: true }).eq("current_project_id", projectId).not("maintenance_due_date", "is", null).lt("maintenance_due_date", today),
  ]);
  return {
    equipmentCount: equipment.count ?? 0,
    toolsCount: tools.count ?? 0,
    deliveriesWeek: deliveriesWeek.count ?? 0,
    materialUsageCount: usage.count ?? 0,
    overdueMaintenance: overdueMaint.count ?? 0,
  };
}
