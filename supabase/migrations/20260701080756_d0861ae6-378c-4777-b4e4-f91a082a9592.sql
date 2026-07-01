
-- Extend project_schedule with Package 9 fields
ALTER TABLE public.project_schedule
  ADD COLUMN IF NOT EXISTS trade text,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS building_section text,
  ADD COLUMN IF NOT EXISTS floor text,
  ADD COLUMN IF NOT EXISTS room text,
  ADD COLUMN IF NOT EXISTS actual_start_date date,
  ADD COLUMN IF NOT EXISTS actual_end_date date,
  ADD COLUMN IF NOT EXISTS baseline_start_date date,
  ADD COLUMN IF NOT EXISTS baseline_end_date date,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS is_critical boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS float_days integer,
  ADD COLUMN IF NOT EXISTS sort_order integer,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE public.project_milestones
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- schedule_baselines
CREATE TABLE IF NOT EXISTS public.schedule_baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_baselines TO authenticated;
GRANT ALL ON public.schedule_baselines TO service_role;
ALTER TABLE public.schedule_baselines ENABLE ROW LEVEL SECURITY;
CREATE POLICY sb_select ON public.schedule_baselines FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY sb_insert ON public.schedule_baselines FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY sb_update ON public.schedule_baselines FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY sb_delete ON public.schedule_baselines FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_sb_defaults BEFORE INSERT ON public.schedule_baselines FOR EACH ROW EXECUTE FUNCTION public.set_project_company_defaults();
CREATE TRIGGER trg_sb_updated BEFORE UPDATE ON public.schedule_baselines FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- progress_updates
CREATE TABLE IF NOT EXISTS public.progress_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.project_schedule(id) ON DELETE CASCADE,
  progress_percent integer NOT NULL,
  note text,
  update_date date NOT NULL DEFAULT (now()::date),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_updates TO authenticated;
GRANT ALL ON public.progress_updates TO service_role;
ALTER TABLE public.progress_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY pu_select ON public.progress_updates FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY pu_insert ON public.progress_updates FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY pu_update ON public.progress_updates FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY pu_delete ON public.progress_updates FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_pu_defaults BEFORE INSERT ON public.progress_updates FOR EACH ROW EXECUTE FUNCTION public.set_project_company_defaults();
CREATE TRIGGER trg_pu_updated BEFORE UPDATE ON public.progress_updates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- delay_events
CREATE TABLE IF NOT EXISTS public.delay_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.project_schedule(id) ON DELETE CASCADE,
  reason text,
  impact_days integer,
  detected_at date NOT NULL DEFAULT (now()::date),
  resolved_at date,
  status text NOT NULL DEFAULT 'open',
  responsible_party text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delay_events TO authenticated;
GRANT ALL ON public.delay_events TO service_role;
ALTER TABLE public.delay_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY de_select ON public.delay_events FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY de_insert ON public.delay_events FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY de_update ON public.delay_events FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY de_delete ON public.delay_events FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_de_defaults BEFORE INSERT ON public.delay_events FOR EACH ROW EXECUTE FUNCTION public.set_project_company_defaults();
CREATE TRIGGER trg_de_updated BEFORE UPDATE ON public.delay_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- task_assignments
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.project_schedule(id) ON DELETE CASCADE,
  assignee_user_id uuid,
  assignee_name text,
  role text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_assignments TO authenticated;
GRANT ALL ON public.task_assignments TO service_role;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY ta_select ON public.task_assignments FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY ta_insert ON public.task_assignments FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY ta_update ON public.task_assignments FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY ta_delete ON public.task_assignments FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_ta_defaults BEFORE INSERT ON public.task_assignments FOR EACH ROW EXECUTE FUNCTION public.set_project_company_defaults();
CREATE TRIGGER trg_ta_updated BEFORE UPDATE ON public.task_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- task_comments
CREATE TABLE IF NOT EXISTS public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.project_schedule(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_comments TO authenticated;
GRANT ALL ON public.task_comments TO service_role;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tc_select ON public.task_comments FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY tc_insert ON public.task_comments FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY tc_update ON public.task_comments FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY tc_delete ON public.task_comments FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_tc_defaults BEFORE INSERT ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.set_project_company_defaults();
CREATE TRIGGER trg_tc_updated BEFORE UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- task_attachments
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.project_schedule(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  file_size bigint,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_attachments TO authenticated;
GRANT ALL ON public.task_attachments TO service_role;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tat_select ON public.task_attachments FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY tat_insert ON public.task_attachments FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY tat_update ON public.task_attachments FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY tat_delete ON public.task_attachments FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_tat_defaults BEFORE INSERT ON public.task_attachments FOR EACH ROW EXECUTE FUNCTION public.set_project_company_defaults();
CREATE TRIGGER trg_tat_updated BEFORE UPDATE ON public.task_attachments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- task_history
CREATE TABLE IF NOT EXISTS public.task_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.project_schedule(id) ON DELETE CASCADE,
  field_name text,
  old_value text,
  new_value text,
  change_type text NOT NULL DEFAULT 'update',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_history TO authenticated;
GRANT ALL ON public.task_history TO service_role;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY th_select ON public.task_history FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY th_insert ON public.task_history FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY th_update ON public.task_history FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY th_delete ON public.task_history FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_th_defaults BEFORE INSERT ON public.task_history FOR EACH ROW EXECUTE FUNCTION public.set_project_company_defaults();
CREATE TRIGGER trg_th_updated BEFORE UPDATE ON public.task_history FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- resource_allocations
CREATE TABLE IF NOT EXISTS public.resource_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.project_schedule(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  resource_name text,
  quantity numeric,
  unit text,
  allocation_date date,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resource_allocations TO authenticated;
GRANT ALL ON public.resource_allocations TO service_role;
ALTER TABLE public.resource_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY ra_select ON public.resource_allocations FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY ra_insert ON public.resource_allocations FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY ra_update ON public.resource_allocations FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY ra_delete ON public.resource_allocations FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_ra_defaults BEFORE INSERT ON public.resource_allocations FOR EACH ROW EXECUTE FUNCTION public.set_project_company_defaults();
CREATE TRIGGER trg_ra_updated BEFORE UPDATE ON public.resource_allocations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_progress_updates_task ON public.progress_updates(task_id, update_date DESC);
CREATE INDEX IF NOT EXISTS idx_delay_events_project ON public.delay_events(project_id, status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON public.task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_history_task ON public.task_history(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resource_alloc_task ON public.resource_allocations(task_id);
