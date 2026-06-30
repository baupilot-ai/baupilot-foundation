
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_number TEXT NOT NULL,
  name TEXT NOT NULL,
  client TEXT,
  site_address TEXT,
  gps_lat NUMERIC,
  gps_lng NUMERIC,
  project_type TEXT,
  building_category TEXT,
  construction_phase TEXT,
  contract_value NUMERIC,
  planned_start DATE,
  planned_finish DATE,
  current_status TEXT NOT NULL DEFAULT 'planning',
  site_manager TEXT,
  foreman TEXT,
  project_manager TEXT,
  safety_manager TEXT,
  client_contact TEXT,
  architect TEXT,
  structural_engineer TEXT,
  mep_engineer TEXT,
  description TEXT,
  notes TEXT,
  cover_image_url TEXT,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX projects_user_id_idx ON public.projects(user_id);
CREATE INDEX projects_archived_idx ON public.projects(archived_at);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
