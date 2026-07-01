# Version 1.0 Production Checklist

- [ ] Remove committed `.env`; rotate any exposed Supabase keys if a service key was ever committed.
- [ ] Add real environment variables in Lovable/Vercel/hosting provider.
- [ ] Apply latest Supabase migrations.
- [ ] Confirm roles in `profiles.role` use the approved values.
- [ ] Run `bun run check` locally and in CI.
- [ ] Add Sentry or another error monitor before customer rollout.
- [ ] Define backup/restore process for Supabase DB and Storage.
- [ ] Test with two companies to confirm tenant isolation.
- [ ] Test with every role: owner, admin, bauleiter, polier, subcontractor, client, viewer.
