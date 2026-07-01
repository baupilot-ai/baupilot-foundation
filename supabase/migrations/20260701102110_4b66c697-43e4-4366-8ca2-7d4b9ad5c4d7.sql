-- Paket 3: Audit logging and activity hardening
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  actor_id uuid,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL CHECK (action IN ('created','updated','deleted','status_changed','uploaded','archived','restored')),
  summary text,
  old_data jsonb,
  new_data jsonb,
  changed_fields text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audit_events TO authenticated;
GRANT INSERT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_events_select_company" ON public.audit_events;
CREATE POLICY "audit_events_select_company"
ON public.audit_events
FOR SELECT TO authenticated
USING (company_id = public.get_user_company(auth.uid()));

DROP POLICY IF EXISTS "audit_events_insert_company" ON public.audit_events;
CREATE POLICY "audit_events_insert_company"
ON public.audit_events
FOR INSERT TO authenticated
WITH CHECK (company_id = public.get_user_company(auth.uid()) AND coalesce(actor_id, auth.uid()) = auth.uid());

CREATE INDEX IF NOT EXISTS idx_audit_events_project_created ON public.audit_events(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_company_created ON public.audit_events(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON public.audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON public.audit_events(actor_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.audit_changed_fields(old_row jsonb, new_row jsonb)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT coalesce(array_agg(key ORDER BY key), '{}')
  FROM (
    SELECT key
    FROM jsonb_object_keys(old_row || new_row) AS key
    WHERE (old_row -> key) IS DISTINCT FROM (new_row -> key)
      AND key NOT IN ('updated_at')
  ) s;
$$;

CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row_old jsonb := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END;
  row_new jsonb := CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END;
  effective_row jsonb := coalesce(row_new, row_old);
  v_company_id uuid;
  v_project_id uuid;
  v_actor_id uuid := auth.uid();
  v_action text;
  v_entity_id uuid;
  v_changed_fields text[] := '{}';
  v_summary text;
BEGIN
  v_company_id := nullif(effective_row ->> 'company_id', '')::uuid;
  IF v_company_id IS NULL THEN
    v_company_id := public.get_user_company(v_actor_id);
  END IF;

  IF effective_row ? 'project_id' AND nullif(effective_row ->> 'project_id', '') IS NOT NULL THEN
    v_project_id := nullif(effective_row ->> 'project_id', '')::uuid;
  ELSIF TG_TABLE_NAME = 'projects' THEN
    v_project_id := nullif(effective_row ->> 'id', '')::uuid;
  ELSE
    v_project_id := NULL;
  END IF;

  v_entity_id := nullif(effective_row ->> 'id', '')::uuid;

  IF TG_OP = 'INSERT' THEN
    v_action := CASE WHEN TG_TABLE_NAME IN ('project_documents','document_versions','project_photos') THEN 'uploaded' ELSE 'created' END;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
  ELSE
    v_changed_fields := public.audit_changed_fields(row_old, row_new);
    IF TG_TABLE_NAME = 'projects' AND (OLD.archived_at IS DISTINCT FROM NEW.archived_at) THEN
      v_action := CASE WHEN NEW.archived_at IS NULL THEN 'restored' ELSE 'archived' END;
    ELSIF (row_old ->> 'status') IS DISTINCT FROM (row_new ->> 'status')
       OR (row_old ->> 'current_status') IS DISTINCT FROM (row_new ->> 'current_status') THEN
      v_action := 'status_changed';
    ELSE
      v_action := 'updated';
    END IF;
  END IF;

  v_summary := initcap(replace(TG_TABLE_NAME, '_', ' ')) || ' ' || v_action;
  IF effective_row ? 'title' AND coalesce(effective_row ->> 'title', '') <> '' THEN
    v_summary := v_summary || ': ' || (effective_row ->> 'title');
  ELSIF effective_row ? 'name' AND coalesce(effective_row ->> 'name', '') <> '' THEN
    v_summary := v_summary || ': ' || (effective_row ->> 'name');
  ELSIF effective_row ? 'report_date' AND coalesce(effective_row ->> 'report_date', '') <> '' THEN
    v_summary := v_summary || ': ' || (effective_row ->> 'report_date');
  END IF;

  INSERT INTO public.audit_events (
    company_id, project_id, actor_id, entity_type, entity_id, action,
    summary, old_data, new_data, changed_fields, metadata
  ) VALUES (
    v_company_id, v_project_id, v_actor_id, TG_TABLE_NAME, v_entity_id, v_action,
    v_summary, row_old, row_new, v_changed_fields,
    jsonb_build_object('source', 'db_trigger', 'operation', TG_OP)
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.mirror_audit_event_to_activity_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.project_id IS NOT NULL AND to_regclass('public.activity_log') IS NOT NULL THEN
    INSERT INTO public.activity_log (
      company_id, project_id, entity_type, entity_id, action, description, created_by, created_at
    ) VALUES (
      NEW.company_id, NEW.project_id, NEW.entity_type, NEW.entity_id, NEW.action, NEW.summary, NEW.actor_id, NEW.created_at
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_events_to_activity_log ON public.audit_events;
CREATE TRIGGER trg_audit_events_to_activity_log
AFTER INSERT ON public.audit_events
FOR EACH ROW EXECUTE FUNCTION public.mirror_audit_event_to_activity_log();

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'projects','daily_reports','tasks','defects','project_photos',
    'project_documents','document_versions','project_plans','plan_revisions',
    'project_team_members','employees','subcontractors','external_contacts',
    'equipment','tools','materials','deliveries','maintenance_records',
    'project_schedule','project_milestones','calendar_events',
    'quality_inspections','acceptance_records','punch_list_items','ncr_reports',
    'safety_inspections','safety_observations','accident_reports','corrective_actions'
  ] LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%I ON public.%I', tbl, tbl);
      EXECUTE format('CREATE TRIGGER trg_audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_row_change()', tbl, tbl);
    END IF;
  END LOOP;
END $$;