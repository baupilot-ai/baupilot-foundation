
-- ============ ai_conversations ============
CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'Neue Unterhaltung',
  model text NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  feature text NOT NULL DEFAULT 'chat',
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations TO authenticated;
GRANT ALL ON public.ai_conversations TO service_role;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_conv_select" ON public.ai_conversations FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ai_conv_insert" ON public.ai_conversations FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "ai_conv_update" ON public.ai_conversations FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "ai_conv_delete" ON public.ai_conversations FOR DELETE TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) AND user_id = auth.uid());
CREATE TRIGGER trg_ai_conv_updated BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ai_messages ============
CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('system','user','assistant','tool')),
  content text NOT NULL,
  tokens_in integer DEFAULT 0,
  tokens_out integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_messages_conv ON public.ai_messages(conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_messages TO authenticated;
GRANT ALL ON public.ai_messages TO service_role;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_msg_select" ON public.ai_messages FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ai_msg_insert" ON public.ai_messages FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ai_msg_update" ON public.ai_messages FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ai_msg_delete" ON public.ai_messages FOR DELETE TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));

-- ============ ai_prompts ============
CREATE TABLE public.ai_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  is_shared boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_prompts TO authenticated;
GRANT ALL ON public.ai_prompts TO service_role;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_prompts_select" ON public.ai_prompts FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ai_prompts_write" ON public.ai_prompts FOR ALL TO authenticated
  USING (company_id = public.get_user_company(auth.uid()))
  WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_ai_prompts_updated BEFORE UPDATE ON public.ai_prompts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ai_settings ============
CREATE TABLE public.ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_model text NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  temperature numeric NOT NULL DEFAULT 0.4,
  max_tokens integer NOT NULL DEFAULT 2000,
  system_prompt text,
  provider text NOT NULL DEFAULT 'lovable',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_settings TO authenticated;
GRANT ALL ON public.ai_settings TO service_role;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_settings_own" ON public.ai_settings FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND company_id = public.get_user_company(auth.uid()));
CREATE TRIGGER trg_ai_settings_updated BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ai_usage ============
CREATE TABLE public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  feature text NOT NULL,
  model text,
  tokens_in integer DEFAULT 0,
  tokens_out integer DEFAULT 0,
  status text NOT NULL DEFAULT 'ok',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_usage_company_date ON public.ai_usage(company_id, created_at DESC);
GRANT SELECT, INSERT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_usage_select" ON public.ai_usage FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ai_usage_insert" ON public.ai_usage FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

-- ============ ai_feedback ============
CREATE TABLE public.ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.ai_messages(id) ON DELETE CASCADE,
  rating text NOT NULL CHECK (rating IN ('up','down')),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_feedback TO authenticated;
GRANT ALL ON public.ai_feedback TO service_role;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_feedback_select" ON public.ai_feedback FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ai_feedback_write" ON public.ai_feedback FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND company_id = public.get_user_company(auth.uid()));
