
-- document_folders
CREATE TABLE public.document_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_folder_id uuid REFERENCES public.document_folders(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_folders TO authenticated;
GRANT ALL ON public.document_folders TO service_role;
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company members read folders" ON public.document_folders FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "company members insert folders" ON public.document_folders FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "company members update folders" ON public.document_folders FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "company members delete folders" ON public.document_folders FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_document_folders_defaults BEFORE INSERT ON public.document_folders FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_document_folders_updated BEFORE UPDATE ON public.document_folders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- project_documents
CREATE TABLE public.project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES public.document_folders(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_size bigint,
  category text NOT NULL DEFAULT 'other',
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active',
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_documents TO authenticated;
GRANT ALL ON public.project_documents TO service_role;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company members read documents" ON public.project_documents FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "company members insert documents" ON public.project_documents FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "company members update documents" ON public.project_documents FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "company members delete documents" ON public.project_documents FOR DELETE TO authenticated USING (public.is_company_member(company_id));

CREATE OR REPLACE FUNCTION public.set_document_defaults()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.company_id IS NULL THEN NEW.company_id := public.get_user_company(auth.uid()); END IF;
  IF NEW.uploaded_by IS NULL THEN NEW.uploaded_by := auth.uid(); END IF;
  IF NEW.created_by IS NULL THEN NEW.created_by := auth.uid(); END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_project_documents_defaults BEFORE INSERT ON public.project_documents FOR EACH ROW EXECUTE FUNCTION public.set_document_defaults();
CREATE TRIGGER trg_project_documents_updated BEFORE UPDATE ON public.project_documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- document_versions
CREATE TABLE public.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.project_documents(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  version integer NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_versions TO authenticated;
GRANT ALL ON public.document_versions TO service_role;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company members read doc versions" ON public.document_versions FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "company members insert doc versions" ON public.document_versions FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "company members delete doc versions" ON public.document_versions FOR DELETE TO authenticated USING (public.is_company_member(company_id));

CREATE OR REPLACE FUNCTION public.set_doc_version_defaults()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.company_id IS NULL THEN NEW.company_id := public.get_user_company(auth.uid()); END IF;
  IF NEW.uploaded_by IS NULL THEN NEW.uploaded_by := auth.uid(); END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_document_versions_defaults BEFORE INSERT ON public.document_versions FOR EACH ROW EXECUTE FUNCTION public.set_doc_version_defaults();

-- plan_sets
CREATE TABLE public.plan_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  discipline text,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_sets TO authenticated;
GRANT ALL ON public.plan_sets TO service_role;
ALTER TABLE public.plan_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company members read plan_sets" ON public.plan_sets FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "company members insert plan_sets" ON public.plan_sets FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "company members update plan_sets" ON public.plan_sets FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "company members delete plan_sets" ON public.plan_sets FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_plan_sets_defaults BEFORE INSERT ON public.plan_sets FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_plan_sets_updated BEFORE UPDATE ON public.plan_sets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- project_plans
CREATE TABLE public.project_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  plan_set_id uuid REFERENCES public.plan_sets(id) ON DELETE SET NULL,
  plan_number text NOT NULL,
  title text NOT NULL,
  discipline text,
  revision text NOT NULL DEFAULT 'A',
  status text NOT NULL DEFAULT 'draft',
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_size bigint,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_plans TO authenticated;
GRANT ALL ON public.project_plans TO service_role;
ALTER TABLE public.project_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company members read plans" ON public.project_plans FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "company members insert plans" ON public.project_plans FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "company members update plans" ON public.project_plans FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "company members delete plans" ON public.project_plans FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_project_plans_defaults BEFORE INSERT ON public.project_plans FOR EACH ROW EXECUTE FUNCTION public.set_document_defaults();
CREATE TRIGGER trg_project_plans_updated BEFORE UPDATE ON public.project_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- plan_revisions
CREATE TABLE public.plan_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.project_plans(id) ON DELETE CASCADE,
  revision text NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_revisions TO authenticated;
GRANT ALL ON public.plan_revisions TO service_role;
ALTER TABLE public.plan_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company members read plan_revs" ON public.plan_revisions FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "company members insert plan_revs" ON public.plan_revisions FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "company members delete plan_revs" ON public.plan_revisions FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_plan_revisions_defaults BEFORE INSERT ON public.plan_revisions FOR EACH ROW EXECUTE FUNCTION public.set_doc_version_defaults();

-- indexes
CREATE INDEX idx_documents_project ON public.project_documents(project_id, created_at DESC);
CREATE INDEX idx_doc_versions_doc ON public.document_versions(document_id, version DESC);
CREATE INDEX idx_plans_project ON public.project_plans(project_id, created_at DESC);
CREATE INDEX idx_plan_revisions_plan ON public.plan_revisions(plan_id, created_at DESC);
CREATE INDEX idx_folders_project ON public.document_folders(project_id);
