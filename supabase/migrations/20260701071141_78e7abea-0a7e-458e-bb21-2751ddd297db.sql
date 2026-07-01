
-- ============ Extend daily_reports ============
ALTER TABLE public.daily_reports
  ADD COLUMN IF NOT EXISTS feels_like numeric,
  ADD COLUMN IF NOT EXISTS wind_speed numeric,
  ADD COLUMN IF NOT EXISTS rainfall_mm numeric,
  ADD COLUMN IF NOT EXISTS snow_mm numeric,
  ADD COLUMN IF NOT EXISTS humidity numeric,
  ADD COLUMN IF NOT EXISTS ground_condition text,
  ADD COLUMN IF NOT EXISTS working_conditions text,
  ADD COLUMN IF NOT EXISTS sunrise time,
  ADD COLUMN IF NOT EXISTS sunset time,
  ADD COLUMN IF NOT EXISTS weather_notes text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS submitted_by uuid,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_by uuid,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS foreman_id uuid;

-- ============ Helper: generic child-table creator via inline blocks ============

-- daily_report_workforce
CREATE TABLE IF NOT EXISTS public.daily_report_workforce (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  daily_report_id uuid NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  company_name text,
  trade text,
  own_workers integer DEFAULT 0,
  subcontractor_workers integer DEFAULT 0,
  supervisor text,
  working_hours numeric,
  overtime numeric,
  night_shift boolean DEFAULT false,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_workforce TO authenticated;
GRANT ALL ON public.daily_report_workforce TO service_role;
ALTER TABLE public.daily_report_workforce ENABLE ROW LEVEL SECURITY;

-- daily_report_equipment
CREATE TABLE IF NOT EXISTS public.daily_report_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  daily_report_id uuid NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  equipment_id uuid REFERENCES public.equipment(id) ON DELETE SET NULL,
  equipment_name text,
  quantity numeric,
  working_hours numeric,
  operator text,
  status text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_equipment TO authenticated;
GRANT ALL ON public.daily_report_equipment TO service_role;
ALTER TABLE public.daily_report_equipment ENABLE ROW LEVEL SECURITY;

-- daily_report_materials
CREATE TABLE IF NOT EXISTS public.daily_report_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  daily_report_id uuid NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  material_id uuid REFERENCES public.materials(id) ON DELETE SET NULL,
  material_name text,
  quantity numeric,
  unit text,
  supplier text,
  delivery_number text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_materials TO authenticated;
GRANT ALL ON public.daily_report_materials TO service_role;
ALTER TABLE public.daily_report_materials ENABLE ROW LEVEL SECURITY;

-- daily_report_work_performed
CREATE TABLE IF NOT EXISTS public.daily_report_work_performed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  daily_report_id uuid NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  area text,
  building_section text,
  floor text,
  trade text,
  description text,
  progress_pct numeric,
  schedule_activity_id uuid REFERENCES public.project_schedule(id) ON DELETE SET NULL,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_work_performed TO authenticated;
GRANT ALL ON public.daily_report_work_performed TO service_role;
ALTER TABLE public.daily_report_work_performed ENABLE ROW LEVEL SECURITY;

-- daily_report_delays
CREATE TABLE IF NOT EXISTS public.daily_report_delays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  daily_report_id uuid NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  delay_type text,
  description text,
  responsible_party text,
  impact text,
  mitigation text,
  affected_activities text,
  photos jsonb DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_delays TO authenticated;
GRANT ALL ON public.daily_report_delays TO service_role;
ALTER TABLE public.daily_report_delays ENABLE ROW LEVEL SECURITY;

-- daily_report_visitors
CREATE TABLE IF NOT EXISTS public.daily_report_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  daily_report_id uuid NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  name text,
  company_name text,
  purpose text,
  arrival time,
  departure time,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_visitors TO authenticated;
GRANT ALL ON public.daily_report_visitors TO service_role;
ALTER TABLE public.daily_report_visitors ENABLE ROW LEVEL SECURITY;

-- daily_report_photos
CREATE TABLE IF NOT EXISTS public.daily_report_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  daily_report_id uuid NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  project_photo_id uuid REFERENCES public.project_photos(id) ON DELETE SET NULL,
  storage_path text,
  description text,
  category text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_photos TO authenticated;
GRANT ALL ON public.daily_report_photos TO service_role;
ALTER TABLE public.daily_report_photos ENABLE ROW LEVEL SECURITY;

-- daily_report_signatures
CREATE TABLE IF NOT EXISTS public.daily_report_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  daily_report_id uuid NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  role text NOT NULL,
  signer_name text NOT NULL,
  signature_data text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_signatures TO authenticated;
GRANT ALL ON public.daily_report_signatures TO service_role;
ALTER TABLE public.daily_report_signatures ENABLE ROW LEVEL SECURITY;

-- daily_report_attachments
CREATE TABLE IF NOT EXISTS public.daily_report_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  daily_report_id uuid NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  filename text,
  mime_type text,
  file_size bigint,
  category text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_attachments TO authenticated;
GRANT ALL ON public.daily_report_attachments TO service_role;
ALTER TABLE public.daily_report_attachments ENABLE ROW LEVEL SECURITY;

-- daily_report_links (polymorphic)
CREATE TABLE IF NOT EXISTS public.daily_report_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  daily_report_id uuid NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  label text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_report_links TO authenticated;
GRANT ALL ON public.daily_report_links TO service_role;
ALTER TABLE public.daily_report_links ENABLE ROW LEVEL SECURITY;

-- ============ RLS policies (loop) ============
DO $$
DECLARE t text;
DECLARE tables text[] := ARRAY[
  'daily_report_workforce','daily_report_equipment','daily_report_materials',
  'daily_report_work_performed','daily_report_delays','daily_report_visitors',
  'daily_report_photos','daily_report_signatures','daily_report_attachments',
  'daily_report_links'
];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_select" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_insert" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_update" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_delete" ON public.%1$s', t);
    EXECUTE format('CREATE POLICY "%1$s_select" ON public.%1$s FOR SELECT TO authenticated USING (company_id = get_user_company(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "%1$s_insert" ON public.%1$s FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "%1$s_update" ON public.%1$s FOR UPDATE TO authenticated USING (company_id = get_user_company(auth.uid())) WITH CHECK (company_id = get_user_company(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "%1$s_delete" ON public.%1$s FOR DELETE TO authenticated USING (company_id = get_user_company(auth.uid()))', t);
    -- Triggers for defaults and updated_at
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_defaults ON public.%1$s', t);
    EXECUTE format('CREATE TRIGGER trg_%1$s_defaults BEFORE INSERT ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator()', t);
    IF t <> 'daily_report_links' THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_updated ON public.%1$s', t);
      EXECUTE format('CREATE TRIGGER trg_%1$s_updated BEFORE UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
    END IF;
  END LOOP;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_drw_report ON public.daily_report_workforce(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_dre_report ON public.daily_report_equipment(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_drm_report ON public.daily_report_materials(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_drwp_report ON public.daily_report_work_performed(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_drd_report ON public.daily_report_delays(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_drv_report ON public.daily_report_visitors(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_drp_report ON public.daily_report_photos(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_drs_report ON public.daily_report_signatures(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_dra_report ON public.daily_report_attachments(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_drl_report ON public.daily_report_links(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_dr_status ON public.daily_reports(project_id, status);
