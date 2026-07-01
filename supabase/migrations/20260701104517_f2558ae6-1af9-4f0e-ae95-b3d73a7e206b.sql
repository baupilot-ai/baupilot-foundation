
-- Package 4-9: extend existing tables (additive, non-breaking)

-- Documents Pro: approval workflow, versioning, tags, offline
ALTER TABLE public.project_documents
  ADD COLUMN IF NOT EXISTS version_major integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS version_minor integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS submitted_for_review_at timestamptz,
  ADD COLUMN IF NOT EXISTS submitted_for_review_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_by uuid,
  ADD COLUMN IF NOT EXISTS rejected_reason text,
  ADD COLUMN IF NOT EXISTS sync_status text NOT NULL DEFAULT 'synced',
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_documents_status ON public.project_documents(project_id, status);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON public.project_documents USING gin(tags);

-- Milestones: schedule + responsible + offline
ALTER TABLE public.project_milestones
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS responsible_user_id uuid,
  ADD COLUMN IF NOT EXISTS sync_status text NOT NULL DEFAULT 'synced',
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_milestones_project_due ON public.project_milestones(project_id, due_date);

-- Notifications: entity linkage
ALTER TABLE public.notification_events
  ADD COLUMN IF NOT EXISTS entity_type text,
  ADD COLUMN IF NOT EXISTS entity_id uuid,
  ADD COLUMN IF NOT EXISTS link_url text;

CREATE INDEX IF NOT EXISTS idx_notification_events_unread
  ON public.notification_events(user_id, created_at DESC)
  WHERE status = 'unread';
