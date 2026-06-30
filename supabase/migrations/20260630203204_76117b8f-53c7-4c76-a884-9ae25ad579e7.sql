
CREATE TABLE public.daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  weather_condition text, temperature numeric, wind text,
  site_status text DEFAULT 'normal',
  working_hours_start time, working_hours_end time,
  workers_count integer, subcontractors text, equipment_used text,
  materials_delivered text, work_performed text, delays text,
  safety_notes text, visitors text, notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_reports TO authenticated;
GRANT ALL ON public.daily_reports TO service_role;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dr_select" ON public.daily_reports FOR SELECT TO authenticated USING (company_id = get_user_company(auth.uid()));
CREATE POLICY "dr_insert" ON public.daily_reports FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "dr_update" ON public.daily_reports FOR UPDATE TO authenticated USING (company_id = get_user_company(auth.uid())) WITH CHECK (company_id = get_user_company(auth.uid()));
CREATE POLICY "dr_delete" ON public.daily_reports FOR DELETE TO authenticated USING (company_id = get_user_company(auth.uid()));

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL, description text,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  assigned_to text, due_date date,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated USING (company_id = get_user_company(auth.uid()));
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE TO authenticated USING (company_id = get_user_company(auth.uid())) WITH CHECK (company_id = get_user_company(auth.uid()));
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE TO authenticated USING (company_id = get_user_company(auth.uid()));

CREATE TABLE public.defects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL, description text, location text,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  responsible_person text, due_date date, photo_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.defects TO authenticated;
GRANT ALL ON public.defects TO service_role;
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "def_select" ON public.defects FOR SELECT TO authenticated USING (company_id = get_user_company(auth.uid()));
CREATE POLICY "def_insert" ON public.defects FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "def_update" ON public.defects FOR UPDATE TO authenticated USING (company_id = get_user_company(auth.uid())) WITH CHECK (company_id = get_user_company(auth.uid()));
CREATE POLICY "def_delete" ON public.defects FOR DELETE TO authenticated USING (company_id = get_user_company(auth.uid()));

CREATE TABLE public.project_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text, description text,
  photo_url text NOT NULL,
  category text DEFAULT 'general',
  taken_at timestamptz,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_photos TO authenticated;
GRANT ALL ON public.project_photos TO service_role;
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ph_select" ON public.project_photos FOR SELECT TO authenticated USING (company_id = get_user_company(auth.uid()));
CREATE POLICY "ph_insert" ON public.project_photos FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company(auth.uid()) AND uploaded_by = auth.uid());
CREATE POLICY "ph_update" ON public.project_photos FOR UPDATE TO authenticated USING (company_id = get_user_company(auth.uid())) WITH CHECK (company_id = get_user_company(auth.uid()));
CREATE POLICY "ph_delete" ON public.project_photos FOR DELETE TO authenticated USING (company_id = get_user_company(auth.uid()));

CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  description text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "al_select" ON public.activity_log FOR SELECT TO authenticated USING (company_id = get_user_company(auth.uid()));
CREATE POLICY "al_insert" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company(auth.uid()));

CREATE OR REPLACE FUNCTION public.set_company_and_creator()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.company_id IS NULL THEN NEW.company_id := public.get_user_company(auth.uid()); END IF;
  IF TG_TABLE_NAME = 'project_photos' THEN
    IF NEW.uploaded_by IS NULL THEN NEW.uploaded_by := auth.uid(); END IF;
  ELSE
    IF NEW.created_by IS NULL THEN NEW.created_by := auth.uid(); END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_dr_defaults BEFORE INSERT ON public.daily_reports FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_tasks_defaults BEFORE INSERT ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_defects_defaults BEFORE INSERT ON public.defects FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_photos_defaults BEFORE INSERT ON public.project_photos FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_al_defaults BEFORE INSERT ON public.activity_log FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();

CREATE TRIGGER trg_dr_updated BEFORE UPDATE ON public.daily_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_defects_updated BEFORE UPDATE ON public.defects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_dr_project ON public.daily_reports(project_id, report_date DESC);
CREATE INDEX idx_tasks_project ON public.tasks(project_id, status);
CREATE INDEX idx_defects_project ON public.defects(project_id, status);
CREATE INDEX idx_photos_project ON public.project_photos(project_id, created_at DESC);
CREATE INDEX idx_al_project ON public.activity_log(project_id, created_at DESC);
