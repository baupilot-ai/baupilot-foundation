
-- project_calendar
CREATE TABLE public.project_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_calendar TO authenticated;
GRANT ALL ON public.project_calendar TO service_role;
ALTER TABLE public.project_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_select" ON public.project_calendar FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "calendar_insert" ON public.project_calendar FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "calendar_update" ON public.project_calendar FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "calendar_delete" ON public.project_calendar FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_project_calendar_defaults BEFORE INSERT ON public.project_calendar FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_project_calendar_updated BEFORE UPDATE ON public.project_calendar FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- calendar_events
CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'other',
  start_datetime timestamptz NOT NULL,
  end_datetime timestamptz,
  all_day boolean NOT NULL DEFAULT false,
  location text,
  responsible_person text,
  status text NOT NULL DEFAULT 'planned',
  color text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select" ON public.calendar_events FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "events_insert" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "events_update" ON public.calendar_events FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "events_delete" ON public.calendar_events FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_calendar_events_defaults BEFORE INSERT ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_calendar_events_updated BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_calendar_events_project ON public.calendar_events(project_id, start_datetime);

-- project_schedule
CREATE TABLE public.project_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  activity_number text,
  activity_name text NOT NULL,
  description text,
  start_date date,
  finish_date date,
  duration_days integer,
  progress_percent integer NOT NULL DEFAULT 0,
  responsible_person text,
  status text NOT NULL DEFAULT 'not_started',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_schedule TO authenticated;
GRANT ALL ON public.project_schedule TO service_role;
ALTER TABLE public.project_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_select" ON public.project_schedule FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "schedule_insert" ON public.project_schedule FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "schedule_update" ON public.project_schedule FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "schedule_delete" ON public.project_schedule FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_project_schedule_defaults BEFORE INSERT ON public.project_schedule FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_project_schedule_updated BEFORE UPDATE ON public.project_schedule FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_project_schedule_project ON public.project_schedule(project_id, start_date);

-- project_milestones
CREATE TABLE public.project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  planned_date date,
  actual_date date,
  responsible_person text,
  status text NOT NULL DEFAULT 'planned',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_milestones TO authenticated;
GRANT ALL ON public.project_milestones TO service_role;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ms_select" ON public.project_milestones FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "ms_insert" ON public.project_milestones FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "ms_update" ON public.project_milestones FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "ms_delete" ON public.project_milestones FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_project_milestones_defaults BEFORE INSERT ON public.project_milestones FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_project_milestones_updated BEFORE UPDATE ON public.project_milestones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- schedule_dependencies
CREATE TABLE public.schedule_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  predecessor_activity_id uuid NOT NULL REFERENCES public.project_schedule(id) ON DELETE CASCADE,
  successor_activity_id uuid NOT NULL REFERENCES public.project_schedule(id) ON DELETE CASCADE,
  dependency_type text NOT NULL DEFAULT 'fs',
  lag_days integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_dependencies TO authenticated;
GRANT ALL ON public.schedule_dependencies TO service_role;
ALTER TABLE public.schedule_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dep_select" ON public.schedule_dependencies FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "dep_insert" ON public.schedule_dependencies FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "dep_update" ON public.schedule_dependencies FOR UPDATE TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "dep_delete" ON public.schedule_dependencies FOR DELETE TO authenticated USING (public.is_company_member(company_id));
CREATE TRIGGER trg_schedule_dependencies_defaults BEFORE INSERT ON public.schedule_dependencies FOR EACH ROW EXECUTE FUNCTION public.set_company_and_creator();
CREATE TRIGGER trg_schedule_dependencies_updated BEFORE UPDATE ON public.schedule_dependencies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- notification_settings
CREATE TABLE public.notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  notify_deadlines boolean NOT NULL DEFAULT true,
  notify_delays boolean NOT NULL DEFAULT true,
  notify_milestones boolean NOT NULL DEFAULT true,
  notify_deliveries boolean NOT NULL DEFAULT true,
  notify_schedule_changes boolean NOT NULL DEFAULT true,
  notification_frequency text NOT NULL DEFAULT 'immediate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_settings TO authenticated;
GRANT ALL ON public.notification_settings TO service_role;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ns_select" ON public.notification_settings FOR SELECT TO authenticated USING (user_id = auth.uid() AND public.is_company_member(company_id));
CREATE POLICY "ns_insert" ON public.notification_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.is_company_member(company_id));
CREATE POLICY "ns_update" ON public.notification_settings FOR UPDATE TO authenticated USING (user_id = auth.uid() AND public.is_company_member(company_id));
CREATE POLICY "ns_delete" ON public.notification_settings FOR DELETE TO authenticated USING (user_id = auth.uid() AND public.is_company_member(company_id));
CREATE OR REPLACE FUNCTION public.set_notification_settings_defaults() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.company_id IS NULL THEN NEW.company_id := public.get_user_company(auth.uid()); END IF;
  IF NEW.user_id IS NULL THEN NEW.user_id := auth.uid(); END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_notification_settings_defaults BEFORE INSERT ON public.notification_settings FOR EACH ROW EXECUTE FUNCTION public.set_notification_settings_defaults();
CREATE TRIGGER trg_notification_settings_updated BEFORE UPDATE ON public.notification_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- notification_events
CREATE TABLE public.notification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  event_type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'unread',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_events TO authenticated;
GRANT ALL ON public.notification_events TO service_role;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ne_select" ON public.notification_events FOR SELECT TO authenticated USING (user_id = auth.uid() AND public.is_company_member(company_id));
CREATE POLICY "ne_insert" ON public.notification_events FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "ne_update" ON public.notification_events FOR UPDATE TO authenticated USING (user_id = auth.uid() AND public.is_company_member(company_id));
CREATE POLICY "ne_delete" ON public.notification_events FOR DELETE TO authenticated USING (user_id = auth.uid() AND public.is_company_member(company_id));
CREATE OR REPLACE FUNCTION public.set_notification_event_defaults() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.company_id IS NULL THEN NEW.company_id := public.get_user_company(auth.uid()); END IF;
  IF NEW.user_id IS NULL THEN NEW.user_id := auth.uid(); END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_notification_events_defaults BEFORE INSERT ON public.notification_events FOR EACH ROW EXECUTE FUNCTION public.set_notification_event_defaults();
CREATE INDEX idx_notification_events_user ON public.notification_events(user_id, created_at DESC);
