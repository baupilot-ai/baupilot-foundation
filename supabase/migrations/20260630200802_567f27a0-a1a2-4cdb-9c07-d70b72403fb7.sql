
-- Companies table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My company',
  industry text,
  company_size text,
  address text,
  vat_id text,
  phone text,
  email text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER companies_set_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE INDEX IF NOT EXISTS profiles_company_id_idx ON public.profiles(company_id);

-- Security definer helpers to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.get_user_company(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND company_id = _company_id
  )
$$;

-- Company RLS
CREATE POLICY "Members view their company" ON public.companies
  FOR SELECT TO authenticated
  USING (public.is_company_member(id));

CREATE POLICY "Members update their company" ON public.companies
  FOR UPDATE TO authenticated
  USING (public.is_company_member(id))
  WITH CHECK (public.is_company_member(id));

CREATE POLICY "Authenticated can create company" ON public.companies
  FOR INSERT TO authenticated WITH CHECK (true);

-- Profiles: expand RLS so users can see profiles of company colleagues
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view profiles in own company" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR (company_id IS NOT NULL AND company_id = public.get_user_company(auth.uid()))
  );

-- Extend projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS actual_start date,
  ADD COLUMN IF NOT EXISTS actual_finish date,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS projects_company_id_idx ON public.projects(company_id);

-- Update default status to 'planned' and migrate legacy 'planning' values
ALTER TABLE public.projects ALTER COLUMN current_status SET DEFAULT 'planned';
UPDATE public.projects SET current_status = 'planned' WHERE current_status = 'planning';

-- New project policies (replace existing user_id-scoped policy with company-scoped)
DROP POLICY IF EXISTS "Users manage own projects" ON public.projects;

CREATE POLICY "Company members view projects" ON public.projects
  FOR SELECT TO authenticated
  USING (
    company_id IS NOT NULL
    AND company_id = public.get_user_company(auth.uid())
  );

CREATE POLICY "Company members create projects" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Company members update projects" ON public.projects
  FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company(auth.uid()))
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Company members delete projects" ON public.projects
  FOR DELETE TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));

-- Updated handle_new_user: creates a default company if needed and links profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id uuid;
  derived_name text;
BEGIN
  derived_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'company_name', ''),
    CONCAT(COALESCE(NEW.raw_user_meta_data->>'first_name', 'My'), '''s company')
  );

  INSERT INTO public.companies (name) VALUES (derived_name)
  RETURNING id INTO new_company_id;

  INSERT INTO public.profiles (id, email, first_name, last_name, role, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner'),
    new_company_id
  )
  ON CONFLICT (id) DO UPDATE SET company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id);

  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: ensure every existing profile has a company; ensure existing projects have company_id
DO $$
DECLARE
  p record;
  new_cid uuid;
BEGIN
  FOR p IN SELECT id, first_name FROM public.profiles WHERE company_id IS NULL LOOP
    INSERT INTO public.companies (name) VALUES (COALESCE(p.first_name, 'My') || '''s company')
    RETURNING id INTO new_cid;
    UPDATE public.profiles SET company_id = new_cid WHERE id = p.id;
  END LOOP;
END $$;

UPDATE public.projects pr
SET company_id = pf.company_id, created_by = COALESCE(pr.created_by, pr.user_id)
FROM public.profiles pf
WHERE pr.company_id IS NULL AND pf.id = pr.user_id;

-- Auto-fill company_id and created_by on new project inserts
CREATE OR REPLACE FUNCTION public.set_project_company_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  IF NEW.company_id IS NULL THEN
    NEW.company_id := public.get_user_company(auth.uid());
  END IF;
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_set_company_defaults ON public.projects;
CREATE TRIGGER projects_set_company_defaults
  BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_project_company_defaults();
