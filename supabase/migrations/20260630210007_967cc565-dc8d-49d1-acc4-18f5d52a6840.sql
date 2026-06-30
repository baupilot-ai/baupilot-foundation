
-- Employees
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  job_title text,
  role text NOT NULL DEFAULT 'worker',
  trade text DEFAULT 'general',
  employment_type text DEFAULT 'full_time',
  status text NOT NULL DEFAULT 'active',
  notes text,
  avatar_url text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees_select" ON public.employees FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "employees_insert" ON public.employees FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id) OR company_id = public.get_user_company(auth.uid()));
CREATE POLICY "employees_update" ON public.employees FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "employees_delete" ON public.employees FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER employees_set_defaults BEFORE INSERT ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER employees_set_updated BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Subcontractors
CREATE TABLE public.subcontractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  trade text DEFAULT 'general',
  contact_person text,
  email text,
  phone text,
  address text,
  tax_number text,
  insurance_status text DEFAULT 'unknown',
  qualification_status text DEFAULT 'not_checked',
  rating smallint,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subcontractors TO authenticated;
GRANT ALL ON public.subcontractors TO service_role;
ALTER TABLE public.subcontractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs_select" ON public.subcontractors FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "subs_insert" ON public.subcontractors FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id) OR company_id = public.get_user_company(auth.uid()));
CREATE POLICY "subs_update" ON public.subcontractors FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "subs_delete" ON public.subcontractors FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER subs_set_defaults BEFORE INSERT ON public.subcontractors FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER subs_set_updated BEFORE UPDATE ON public.subcontractors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- External Contacts
CREATE TABLE public.external_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  contact_type text NOT NULL DEFAULT 'other',
  company_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  role_description text,
  address text,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.external_contacts TO authenticated;
GRANT ALL ON public.external_contacts TO service_role;
ALTER TABLE public.external_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ext_select" ON public.external_contacts FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "ext_insert" ON public.external_contacts FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id) OR company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ext_update" ON public.external_contacts FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "ext_delete" ON public.external_contacts FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER ext_set_defaults BEFORE INSERT ON public.external_contacts FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER ext_set_updated BEFORE UPDATE ON public.external_contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Project Team Members
CREATE TABLE public.project_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  person_type text NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  subcontractor_id uuid REFERENCES public.subcontractors(id) ON DELETE CASCADE,
  external_contact_id uuid REFERENCES public.external_contacts(id) ON DELETE CASCADE,
  project_role text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_team_members TO authenticated;
GRANT ALL ON public.project_team_members TO service_role;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ptm_select" ON public.project_team_members FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "ptm_insert" ON public.project_team_members FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id) OR company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ptm_update" ON public.project_team_members FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "ptm_delete" ON public.project_team_members FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER ptm_set_defaults BEFORE INSERT ON public.project_team_members FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER ptm_set_updated BEFORE UPDATE ON public.project_team_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Employee Assignments
CREATE TABLE public.employee_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assignment_role text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_assignments TO authenticated;
GRANT ALL ON public.employee_assignments TO service_role;
ALTER TABLE public.employee_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ea_select" ON public.employee_assignments FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "ea_insert" ON public.employee_assignments FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id) OR company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ea_update" ON public.employee_assignments FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "ea_delete" ON public.employee_assignments FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER ea_set_defaults BEFORE INSERT ON public.employee_assignments FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER ea_set_updated BEFORE UPDATE ON public.employee_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_employees_company ON public.employees(company_id);
CREATE INDEX idx_subs_company ON public.subcontractors(company_id);
CREATE INDEX idx_ext_project ON public.external_contacts(project_id);
CREATE INDEX idx_ptm_project ON public.project_team_members(project_id);
CREATE INDEX idx_ea_project ON public.employee_assignments(project_id);
CREATE INDEX idx_ea_employee ON public.employee_assignments(employee_id);
