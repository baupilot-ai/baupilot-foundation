
-- Generic trigger reuse: public.set_company_and_creator already exists.
-- For tables using uploaded_by we already have set_document_defaults. New tables use created_by, so set_company_and_creator fits.

-- =========================================================
-- quality_checklists
-- =========================================================
CREATE TABLE public.quality_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  checklist_type text NOT NULL DEFAULT 'custom',
  status text NOT NULL DEFAULT 'draft',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date date,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quality_checklists TO authenticated;
GRANT ALL ON public.quality_checklists TO service_role;
ALTER TABLE public.quality_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qc_select" ON public.quality_checklists FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qc_insert" ON public.quality_checklists FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qc_update" ON public.quality_checklists FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qc_delete" ON public.quality_checklists FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_qc_defaults BEFORE INSERT ON public.quality_checklists FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_qc_updated BEFORE UPDATE ON public.quality_checklists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_qc_project ON public.quality_checklists(project_id);

-- =========================================================
-- quality_checklist_items
-- =========================================================
CREATE TABLE public.quality_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  checklist_id uuid NOT NULL REFERENCES public.quality_checklists(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  result text NOT NULL DEFAULT 'not_checked',
  comment text,
  photo_url text,
  responsible_person text,
  due_date date,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quality_checklist_items TO authenticated;
GRANT ALL ON public.quality_checklist_items TO service_role;
ALTER TABLE public.quality_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qci_select" ON public.quality_checklist_items FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qci_insert" ON public.quality_checklist_items FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qci_update" ON public.quality_checklist_items FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qci_delete" ON public.quality_checklist_items FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_qci_defaults BEFORE INSERT ON public.quality_checklist_items FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_qci_updated BEFORE UPDATE ON public.quality_checklist_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_qci_checklist ON public.quality_checklist_items(checklist_id);

-- =========================================================
-- quality_inspections
-- =========================================================
CREATE TABLE public.quality_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  inspection_number text,
  title text NOT NULL,
  description text,
  inspection_type text NOT NULL DEFAULT 'quality',
  location text,
  inspector text,
  inspection_date date,
  status text NOT NULL DEFAULT 'scheduled',
  result text,
  notes text,
  checklist_id uuid REFERENCES public.quality_checklists(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quality_inspections TO authenticated;
GRANT ALL ON public.quality_inspections TO service_role;
ALTER TABLE public.quality_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qi_select" ON public.quality_inspections FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qi_insert" ON public.quality_inspections FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qi_update" ON public.quality_inspections FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qi_delete" ON public.quality_inspections FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_qi_defaults BEFORE INSERT ON public.quality_inspections FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_qi_updated BEFORE UPDATE ON public.quality_inspections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_qi_project ON public.quality_inspections(project_id);

-- =========================================================
-- acceptance_records
-- =========================================================
CREATE TABLE public.acceptance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  acceptance_number text,
  title text NOT NULL,
  description text,
  acceptance_type text NOT NULL DEFAULT 'custom',
  location text,
  contractor text,
  client_contact text,
  acceptance_date date,
  status text NOT NULL DEFAULT 'draft',
  result text,
  signature_url text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acceptance_records TO authenticated;
GRANT ALL ON public.acceptance_records TO service_role;
ALTER TABLE public.acceptance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ar_select" ON public.acceptance_records FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ar_insert" ON public.acceptance_records FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ar_update" ON public.acceptance_records FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ar_delete" ON public.acceptance_records FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_ar_defaults BEFORE INSERT ON public.acceptance_records FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_ar_updated BEFORE UPDATE ON public.acceptance_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_ar_project ON public.acceptance_records(project_id);

-- =========================================================
-- punch_lists
-- =========================================================
CREATE TABLE public.punch_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  status text NOT NULL DEFAULT 'open',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.punch_lists TO authenticated;
GRANT ALL ON public.punch_lists TO service_role;
ALTER TABLE public.punch_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pl_select" ON public.punch_lists FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "pl_insert" ON public.punch_lists FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "pl_update" ON public.punch_lists FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "pl_delete" ON public.punch_lists FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_pl_defaults BEFORE INSERT ON public.punch_lists FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_pl_updated BEFORE UPDATE ON public.punch_lists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_pl_project ON public.punch_lists(project_id);

-- =========================================================
-- punch_list_items
-- =========================================================
CREATE TABLE public.punch_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  punch_list_id uuid NOT NULL REFERENCES public.punch_lists(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  responsible_person text,
  due_date date,
  photo_url text,
  comment text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.punch_list_items TO authenticated;
GRANT ALL ON public.punch_list_items TO service_role;
ALTER TABLE public.punch_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pli_select" ON public.punch_list_items FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "pli_insert" ON public.punch_list_items FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "pli_update" ON public.punch_list_items FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "pli_delete" ON public.punch_list_items FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_pli_defaults BEFORE INSERT ON public.punch_list_items FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_pli_updated BEFORE UPDATE ON public.punch_list_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_pli_list ON public.punch_list_items(punch_list_id);

-- =========================================================
-- ncr_reports
-- =========================================================
CREATE TABLE public.ncr_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  ncr_number text,
  title text NOT NULL,
  description text,
  location text,
  root_cause text,
  corrective_action text,
  preventive_action text,
  responsible_person text,
  due_date date,
  status text NOT NULL DEFAULT 'draft',
  priority text NOT NULL DEFAULT 'medium',
  photo_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ncr_reports TO authenticated;
GRANT ALL ON public.ncr_reports TO service_role;
ALTER TABLE public.ncr_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ncr_select" ON public.ncr_reports FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ncr_insert" ON public.ncr_reports FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ncr_update" ON public.ncr_reports FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ncr_delete" ON public.ncr_reports FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_ncr_defaults BEFORE INSERT ON public.ncr_reports FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_ncr_updated BEFORE UPDATE ON public.ncr_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_ncr_project ON public.ncr_reports(project_id);

-- =========================================================
-- safety_inspections
-- =========================================================
CREATE TABLE public.safety_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  inspection_number text,
  title text NOT NULL,
  description text,
  inspection_date date,
  inspector text,
  location text,
  status text NOT NULL DEFAULT 'scheduled',
  result text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.safety_inspections TO authenticated;
GRANT ALL ON public.safety_inspections TO service_role;
ALTER TABLE public.safety_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "si_select" ON public.safety_inspections FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "si_insert" ON public.safety_inspections FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "si_update" ON public.safety_inspections FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "si_delete" ON public.safety_inspections FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_si_defaults BEFORE INSERT ON public.safety_inspections FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_si_updated BEFORE UPDATE ON public.safety_inspections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_si_project ON public.safety_inspections(project_id);

-- =========================================================
-- toolbox_talks
-- =========================================================
CREATE TABLE public.toolbox_talks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  topic text,
  date date,
  trainer text,
  participants_count int,
  notes text,
  signature_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.toolbox_talks TO authenticated;
GRANT ALL ON public.toolbox_talks TO service_role;
ALTER TABLE public.toolbox_talks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tt_select" ON public.toolbox_talks FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "tt_insert" ON public.toolbox_talks FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "tt_update" ON public.toolbox_talks FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "tt_delete" ON public.toolbox_talks FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_tt_defaults BEFORE INSERT ON public.toolbox_talks FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_tt_updated BEFORE UPDATE ON public.toolbox_talks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_tt_project ON public.toolbox_talks(project_id);

-- =========================================================
-- safety_observations
-- =========================================================
CREATE TABLE public.safety_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  observation_type text NOT NULL DEFAULT 'unsafe_condition',
  title text NOT NULL,
  description text,
  location text,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  responsible_person text,
  due_date date,
  photo_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.safety_observations TO authenticated;
GRANT ALL ON public.safety_observations TO service_role;
ALTER TABLE public.safety_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "so_select" ON public.safety_observations FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "so_insert" ON public.safety_observations FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "so_update" ON public.safety_observations FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "so_delete" ON public.safety_observations FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_so_defaults BEFORE INSERT ON public.safety_observations FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_so_updated BEFORE UPDATE ON public.safety_observations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_so_project ON public.safety_observations(project_id);

-- =========================================================
-- accident_reports
-- =========================================================
CREATE TABLE public.accident_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  accident_number text,
  accident_date date,
  accident_time time,
  location text,
  injured_person text,
  witnesses text,
  description text,
  severity text NOT NULL DEFAULT 'minor',
  immediate_action text,
  corrective_action text,
  status text NOT NULL DEFAULT 'draft',
  photo_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accident_reports TO authenticated;
GRANT ALL ON public.accident_reports TO service_role;
ALTER TABLE public.accident_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ac_select" ON public.accident_reports FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ac_insert" ON public.accident_reports FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ac_update" ON public.accident_reports FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ac_delete" ON public.accident_reports FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_ac_defaults BEFORE INSERT ON public.accident_reports FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_ac_updated BEFORE UPDATE ON public.accident_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_ac_project ON public.accident_reports(project_id);

-- =========================================================
-- corrective_actions
-- =========================================================
CREATE TABLE public.corrective_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  source_type text,
  source_id uuid,
  title text NOT NULL,
  description text,
  responsible_person text,
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  status text NOT NULL DEFAULT 'open',
  completion_date date,
  proof_photo_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.corrective_actions TO authenticated;
GRANT ALL ON public.corrective_actions TO service_role;
ALTER TABLE public.corrective_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ca_select" ON public.corrective_actions FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ca_insert" ON public.corrective_actions FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ca_update" ON public.corrective_actions FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ca_delete" ON public.corrective_actions FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_ca_defaults BEFORE INSERT ON public.corrective_actions FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_ca_updated BEFORE UPDATE ON public.corrective_actions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_ca_project ON public.corrective_actions(project_id);

-- =========================================================
-- quality_safety_signatures
-- =========================================================
CREATE TABLE public.quality_safety_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  signer_name text NOT NULL,
  signer_role text,
  signature_url text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quality_safety_signatures TO authenticated;
GRANT ALL ON public.quality_safety_signatures TO service_role;
ALTER TABLE public.quality_safety_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qss_select" ON public.quality_safety_signatures FOR SELECT TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qss_insert" ON public.quality_safety_signatures FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qss_update" ON public.quality_safety_signatures FOR UPDATE TO authenticated USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "qss_delete" ON public.quality_safety_signatures FOR DELETE TO authenticated USING (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_qss_defaults BEFORE INSERT ON public.quality_safety_signatures FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE INDEX idx_qss_entity ON public.quality_safety_signatures(entity_type, entity_id);
