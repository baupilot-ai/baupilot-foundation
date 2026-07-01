# BauPilot Security Baseline

## Secrets
- `.env` and `.env.*` must never be committed.
- Only `.env.example` is allowed in git.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be imported by client components or route files that ship to the browser.

## Roles
| Role | Meaning | Typical rights |
| --- | --- | --- |
| owner | Company owner | full company/project/admin rights |
| admin | Internal admin | full company/project rights except ownership transfer |
| bauleiter | Project manager | create/update projects, reports, tasks, defects, resources |
| polier | Foreman | create/update site reports, photos, defects, tasks, material usage |
| subcontractor | External partner | read project context and create assigned operational records only |
| client | Client/Bauherr | read-only project visibility |
| viewer | Internal read-only | read-only company/project visibility |

## Production gates
Before customer use:
1. Secret scan passes.
2. RLS audit passes.
3. Typecheck, lint and build pass in CI.
4. Every table has explicit SELECT/INSERT/UPDATE/DELETE policies.
5. Destructive actions are limited to owner/admin/bauleiter.
6. Server-only service role usage is reviewed manually.
