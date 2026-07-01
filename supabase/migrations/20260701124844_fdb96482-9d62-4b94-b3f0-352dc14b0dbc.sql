
ALTER TABLE public.daily_reports
  ADD COLUMN IF NOT EXISTS weather_morning_temp numeric,
  ADD COLUMN IF NOT EXISTS weather_noon_temp numeric,
  ADD COLUMN IF NOT EXISTS weather_evening_temp numeric,
  ADD COLUMN IF NOT EXISTS precipitation text,
  ADD COLUMN IF NOT EXISTS weather_impact boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS weather_impact_notes text,
  ADD COLUMN IF NOT EXISTS incidents text,
  ADD COLUMN IF NOT EXISTS next_steps text,
  ADD COLUMN IF NOT EXISTS companies_on_site text,
  ADD COLUMN IF NOT EXISTS ai_generated_summary text,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.set_daily_report_updated_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_by := auth.uid();
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_daily_reports_updated_by ON public.daily_reports;
CREATE TRIGGER trg_daily_reports_updated_by
BEFORE UPDATE ON public.daily_reports
FOR EACH ROW EXECUTE FUNCTION public.set_daily_report_updated_by();
