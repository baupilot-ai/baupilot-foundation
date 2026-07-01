-- Security hardening: explicit BauPilot roles and least-privilege RLS helpers.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_allowed'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_allowed
      CHECK (role IN ('owner', 'admin', 'bauleiter', 'polier', 'subcontractor', 'client', 'viewer'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_company_role(company_id uuid, allowed_roles text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.company_id = has_company_role.company_id
      AND p.role = ANY(allowed_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_company(company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_company_role(company_id, ARRAY['owner', 'admin']);
$$;

CREATE OR REPLACE FUNCTION public.can_manage_projects(company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_company_role(company_id, ARRAY['owner', 'admin', 'bauleiter']);
$$;

CREATE OR REPLACE FUNCTION public.can_manage_site_operations(company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_company_role(company_id, ARRAY['owner', 'admin', 'bauleiter', 'polier']);
$$;

CREATE OR REPLACE FUNCTION public.can_delete_records(company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_company_role(company_id, ARRAY['owner', 'admin', 'bauleiter']);
$$;

CREATE OR REPLACE FUNCTION public.can_read_company(company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_company_role(company_id, ARRAY['owner', 'admin', 'bauleiter', 'polier'])
     OR public.has_company_role(company_id, ARRAY['subcontractor', 'client', 'viewer']);
$$;

CREATE OR REPLACE FUNCTION public.can_manage_team(company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_company_role(company_id, ARRAY['owner', 'admin', 'bauleiter']);
$$;

CREATE OR REPLACE FUNCTION public.can_manage_resources(company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_company_role(company_id, ARRAY['owner', 'admin', 'bauleiter', 'polier']);
$$;

CREATE OR REPLACE FUNCTION public.can_write_documents(company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_company_role(company_id, ARRAY['owner', 'admin', 'bauleiter', 'polier', 'subcontractor']);
$$;

-- Companies
DROP POLICY IF EXISTS "Members update their company" ON public.companies;
DROP POLICY IF EXISTS "Owners and admins update company" ON public.companies;
CREATE POLICY "Owners and admins update company" ON public.companies
  FOR UPDATE TO authenticated
  USING (public.can_manage_company(id))
  WITH CHECK (public.can_manage_company(id));

-- Projects
DROP POLICY IF EXISTS "Company members create projects" ON public.projects;
DROP POLICY IF EXISTS "Company members update projects" ON public.projects;
DROP POLICY IF EXISTS "Company members delete projects" ON public.projects;
DROP POLICY IF EXISTS "Managers create projects" ON public.projects;
DROP POLICY IF EXISTS "Managers update projects" ON public.projects;
DROP POLICY IF EXISTS "Managers delete projects" ON public.projects;
CREATE POLICY "Managers create projects" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.can_manage_projects(company_id));
CREATE POLICY "Managers update projects" ON public.projects
  FOR UPDATE TO authenticated
  USING (public.can_manage_projects(company_id))
  WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.can_manage_projects(company_id));
CREATE POLICY "Managers delete projects" ON public.projects
  FOR DELETE TO authenticated
  USING (public.can_delete_records(company_id));

-- Site operations: managers + polier write, delete restricted
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'daily_reports','tasks','defects','project_photos','documents','plans','milestones',
    'equipment','tools','materials','inventory_locations','inventory_stock','deliveries',
    'delivery_items','material_usage','equipment_assignments','maintenance_logs',
    'daily_report_workforce','daily_report_equipment','daily_report_materials',
    'daily_report_work_performed','daily_report_delays','daily_report_visitors',
    'daily_report_photos','daily_report_signatures','daily_report_attachments','daily_report_links'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_company_insert', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_company_update', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_company_delete', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_role_insert', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_role_update', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_role_delete', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.can_manage_site_operations(company_id))', t || '_role_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.can_manage_site_operations(company_id)) WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.can_manage_site_operations(company_id))', t || '_role_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.can_delete_records(company_id))', t || '_role_delete', t);
  END LOOP;
END $$;

-- Team tables: only managers can write
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['employees','subcontractors','external_contacts','project_team_members','employee_assignments'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_role_insert', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_role_update', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_role_delete', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.can_manage_team(company_id))', t || '_role_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.can_manage_team(company_id)) WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.can_manage_team(company_id))', t || '_role_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.can_manage_team(company_id))', t || '_role_delete', t);
  END LOOP;
END $$;

-- Documents/plans/photos: subcontractors may upload, only managers delete
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['documents','plans','project_photos','daily_report_attachments','daily_report_photos'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_role_insert', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_role_update', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_role_delete', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.can_write_documents(company_id))', t || '_role_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.can_write_documents(company_id)) WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.can_write_documents(company_id))', t || '_role_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.can_delete_records(company_id))', t || '_role_delete', t);
  END LOOP;
END $$;

-- Resources: bauleiter/polier operate, managers delete
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['equipment','tools','materials','inventory_locations','inventory_stock','deliveries','delivery_items','material_usage','equipment_assignments','maintenance_logs'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_role_insert', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_role_update', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_role_delete', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.can_manage_resources(company_id))', t || '_role_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.can_manage_resources(company_id)) WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.can_manage_resources(company_id))', t || '_role_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.can_delete_records(company_id))', t || '_role_delete', t);
  END LOOP;
END $$;

-- Profiles
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own limited profile" ON public.profiles;
CREATE POLICY "Users update own limited profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.can_manage_company(company_id))
  WITH CHECK (id = auth.uid() OR public.can_manage_company(company_id));
