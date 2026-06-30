
-- EQUIPMENT
CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  equipment_number text,
  category text,
  manufacturer text,
  model text,
  serial_number text,
  purchase_date date,
  status text NOT NULL DEFAULT 'available',
  current_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  current_location text,
  responsible_person text,
  maintenance_due_date date,
  inspection_due_date date,
  notes text,
  qr_code text UNIQUE,
  image_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment TO authenticated;
GRANT ALL ON public.equipment TO service_role;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipment_company_select" ON public.equipment FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "equipment_company_insert" ON public.equipment FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "equipment_company_update" ON public.equipment FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "equipment_company_delete" ON public.equipment FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_equipment_defaults BEFORE INSERT ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_equipment_updated BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TOOLS
CREATE TABLE public.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  tool_number text,
  category text,
  manufacturer text,
  model text,
  serial_number text,
  status text NOT NULL DEFAULT 'available',
  current_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  current_location text,
  responsible_person text,
  notes text,
  qr_code text UNIQUE,
  image_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tools TO authenticated;
GRANT ALL ON public.tools TO service_role;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tools_company_select" ON public.tools FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "tools_company_insert" ON public.tools FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "tools_company_update" ON public.tools FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "tools_company_delete" ON public.tools FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_tools_defaults BEFORE INSERT ON public.tools FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_tools_updated BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MATERIALS
CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  material_number text,
  name text NOT NULL,
  category text,
  unit text NOT NULL DEFAULT 'pcs',
  supplier text,
  default_price numeric(14,2),
  minimum_stock numeric(14,3),
  notes text,
  archived boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materials TO authenticated;
GRANT ALL ON public.materials TO service_role;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "materials_company_select" ON public.materials FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "materials_company_insert" ON public.materials FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "materials_company_update" ON public.materials FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "materials_company_delete" ON public.materials FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_materials_defaults BEFORE INSERT ON public.materials FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_materials_updated BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- INVENTORY LOCATIONS
CREATE TABLE public.inventory_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  name text NOT NULL,
  location_type text,
  address text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_locations TO authenticated;
GRANT ALL ON public.inventory_locations TO service_role;
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_loc_select" ON public.inventory_locations FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "inv_loc_insert" ON public.inventory_locations FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "inv_loc_update" ON public.inventory_locations FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "inv_loc_delete" ON public.inventory_locations FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_inv_loc_defaults BEFORE INSERT ON public.inventory_locations FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_inv_loc_updated BEFORE UPDATE ON public.inventory_locations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- INVENTORY STOCK
CREATE TABLE public.inventory_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.inventory_locations(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  quantity numeric(14,3) NOT NULL DEFAULT 0,
  unit text,
  updated_by uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (material_id, location_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_stock TO authenticated;
GRANT ALL ON public.inventory_stock TO service_role;
ALTER TABLE public.inventory_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_stock_select" ON public.inventory_stock FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "inv_stock_insert" ON public.inventory_stock FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "inv_stock_update" ON public.inventory_stock FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "inv_stock_delete" ON public.inventory_stock FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_inv_stock_defaults BEFORE INSERT ON public.inventory_stock FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_inv_stock_updated BEFORE UPDATE ON public.inventory_stock FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DELIVERIES
CREATE TABLE public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  supplier text,
  delivery_number text,
  delivery_date date,
  delivery_time time,
  status text NOT NULL DEFAULT 'expected',
  received_by text,
  notes text,
  document_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliveries TO authenticated;
GRANT ALL ON public.deliveries TO service_role;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deliv_select" ON public.deliveries FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "deliv_insert" ON public.deliveries FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "deliv_update" ON public.deliveries FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "deliv_delete" ON public.deliveries FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_deliv_defaults BEFORE INSERT ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_deliv_updated BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DELIVERY ITEMS
CREATE TABLE public.delivery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  delivery_id uuid NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  material_id uuid REFERENCES public.materials(id) ON DELETE SET NULL,
  description text,
  quantity numeric(14,3) NOT NULL DEFAULT 0,
  unit text,
  unit_price numeric(14,2),
  total_price numeric(14,2),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_items TO authenticated;
GRANT ALL ON public.delivery_items TO service_role;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deliv_items_select" ON public.delivery_items FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "deliv_items_insert" ON public.delivery_items FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "deliv_items_update" ON public.delivery_items FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "deliv_items_delete" ON public.delivery_items FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_deliv_items_defaults BEFORE INSERT ON public.delivery_items FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_deliv_items_updated BEFORE UPDATE ON public.delivery_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MATERIAL USAGE
CREATE TABLE public.material_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  daily_report_id uuid REFERENCES public.daily_reports(id) ON DELETE SET NULL,
  quantity numeric(14,3) NOT NULL DEFAULT 0,
  unit text,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  used_by text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_usage TO authenticated;
GRANT ALL ON public.material_usage TO service_role;
ALTER TABLE public.material_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mat_usage_select" ON public.material_usage FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "mat_usage_insert" ON public.material_usage FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "mat_usage_update" ON public.material_usage FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "mat_usage_delete" ON public.material_usage FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_mat_usage_defaults BEFORE INSERT ON public.material_usage FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_mat_usage_updated BEFORE UPDATE ON public.material_usage FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- EQUIPMENT ASSIGNMENTS
CREATE TABLE public.equipment_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment_assignments TO authenticated;
GRANT ALL ON public.equipment_assignments TO service_role;
ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eq_assign_select" ON public.equipment_assignments FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "eq_assign_insert" ON public.equipment_assignments FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "eq_assign_update" ON public.equipment_assignments FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "eq_assign_delete" ON public.equipment_assignments FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_eq_assign_defaults BEFORE INSERT ON public.equipment_assignments FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_eq_assign_updated BEFORE UPDATE ON public.equipment_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TOOL ASSIGNMENTS
CREATE TABLE public.tool_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_assignments TO authenticated;
GRANT ALL ON public.tool_assignments TO service_role;
ALTER TABLE public.tool_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tool_assign_select" ON public.tool_assignments FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "tool_assign_insert" ON public.tool_assignments FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "tool_assign_update" ON public.tool_assignments FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "tool_assign_delete" ON public.tool_assignments FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_tool_assign_defaults BEFORE INSERT ON public.tool_assignments FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_tool_assign_updated BEFORE UPDATE ON public.tool_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MAINTENANCE RECORDS
CREATE TABLE public.maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  equipment_id uuid REFERENCES public.equipment(id) ON DELETE CASCADE,
  tool_id uuid REFERENCES public.tools(id) ON DELETE CASCADE,
  record_type text NOT NULL DEFAULT 'maintenance',
  title text NOT NULL,
  description text,
  performed_date date,
  next_due_date date,
  performed_by text,
  cost numeric(14,2),
  status text NOT NULL DEFAULT 'completed',
  document_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_records TO authenticated;
GRANT ALL ON public.maintenance_records TO service_role;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maint_select" ON public.maintenance_records FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "maint_insert" ON public.maintenance_records FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "maint_update" ON public.maintenance_records FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "maint_delete" ON public.maintenance_records FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_maint_defaults BEFORE INSERT ON public.maintenance_records FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_maint_updated BEFORE UPDATE ON public.maintenance_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- QR SCAN EVENTS
CREATE TABLE public.qr_scan_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  scan_result text,
  scanned_by uuid,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qr_scan_events TO authenticated;
GRANT ALL ON public.qr_scan_events TO service_role;
ALTER TABLE public.qr_scan_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qr_select" ON public.qr_scan_events FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "qr_insert" ON public.qr_scan_events FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qr_update" ON public.qr_scan_events FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "qr_delete" ON public.qr_scan_events FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_qr_defaults BEFORE INSERT ON public.qr_scan_events FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_qr_updated BEFORE UPDATE ON public.qr_scan_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX equipment_company_idx ON public.equipment(company_id);
CREATE INDEX equipment_project_idx ON public.equipment(current_project_id);
CREATE INDEX tools_company_idx ON public.tools(company_id);
CREATE INDEX materials_company_idx ON public.materials(company_id);
CREATE INDEX inv_loc_company_idx ON public.inventory_locations(company_id);
CREATE INDEX inv_stock_company_idx ON public.inventory_stock(company_id);
CREATE INDEX deliveries_company_idx ON public.deliveries(company_id);
CREATE INDEX deliveries_project_idx ON public.deliveries(project_id);
CREATE INDEX delivery_items_delivery_idx ON public.delivery_items(delivery_id);
CREATE INDEX mat_usage_project_idx ON public.material_usage(project_id);
CREATE INDEX eq_assign_project_idx ON public.equipment_assignments(project_id);
CREATE INDEX tool_assign_project_idx ON public.tool_assignments(project_id);
CREATE INDEX maint_eq_idx ON public.maintenance_records(equipment_id);
CREATE INDEX maint_tool_idx ON public.maintenance_records(tool_id);
