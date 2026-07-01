# BauPilot – Implementation Notes (Pakete 4–9)

Diese Notiz dokumentiert die getroffenen Entscheidungen bei der Umsetzung der
Pakete 4–9, damit die bestehende Architektur nicht zerstört wird.

## Additive Migrationen statt neuer Tabellen

Die vorhandene Struktur (`project_documents`, `project_milestones`,
`notification_events`, `quality_checklists`, `quality_checklist_items`,
`activity_log`, `audit_events`) deckt die geforderten Domänen bereits ab.
Statt neue parallele Tabellen (`notifications`, neue Meilensteintabelle)
anzulegen, wurden die bestehenden **additiv erweitert**:

- `project_documents` erhält Freigabeworkflow-Felder
  (`submitted_for_review_at/_by`, `approved_at/_by`, `rejected_at/_by`,
  `rejected_reason`), feingranulare Versionierung
  (`version_major`, `version_minor`, `is_current`), `tags text[]` und
  Offline-Felder (`sync_status`, `last_synced_at`).
- `project_milestones` erhält `start_date`, `due_date`, `completed_at`,
  `priority`, `responsible_user_id` sowie Offline-Felder.
- `notification_events` wird um `entity_type`, `entity_id`, `link_url`
  ergänzt (Deep-Links zu Dokument/Aufgabe/Mangel).

RLS bleibt unverändert (company-scoped), Audit-Trigger greifen weiterhin.

## Statusvokabular Dokumente

Die alten Werte (`draft`, `active`, `superseded`, `archived`) bleiben
gültig. Zusätzlich erlaubt: `review`, `approved`, `rejected`, `locked`.
Kein DB-Constraint auf `status`, damit alte Datensätze nicht ungültig
werden.

Freigabepfad: `draft → review → approved / rejected → archived`.

## Notifications

Kein separates `notifications`-Table – wir nutzen `notification_events`.
`src/lib/notifications.ts` kapselt Anlage, Zählung, „als gelesen markieren“
und `notifyApprovers()` (Fan-out an Owner/Admin/Bauleiter der Firma).
`NotificationsBell` in der Topbar zeigt Ungelesen-Badge, Live-Update über
Postgres-Realtime.

## Permissions

`src/lib/security/permissions.ts` wurde additiv erweitert um
`documents.upload/approve/archive`, `milestones.read/write`,
`notifications.read`, `quality.read/write`. Bestehende Keys bleiben
unverändert. Rollen-Zuordnung folgt der Matrix aus `docs/roles-permissions.md`.

## Offline-Vorbereitung

Nur Architektur: neue Spalten `sync_status ('synced'|'pending'|'failed')`
und `last_synced_at` auf Datensätzen, die typischerweise mobil erfasst
werden (Dokumente, Meilensteine). Es gibt bewusst noch keine
Client-Sync-Engine – aber der Datenpfad ist vorbereitet.

## Qualitätsmanagement

`quality_checklists` und `quality_checklist_items` existieren bereits mit
RLS. Der bestehende Q&S-Modul-Tab bleibt maßgeblich; keine Duplikate.
Vorlagen (Bewehrung, Schalung, Betonage, Arbeitssicherheit, Maße) werden
NICHT als Seed-Daten in die DB geschrieben, sondern können pro Firma in
der UI angelegt werden – so entstehen keine Fremd-Datensätze in Kunden-
Firmen.

## Was bewusst NICHT geändert wurde

- Kein Umbau der `documents-tab.tsx`-Kartenansicht (nur Aktionen im
  Dropdown ergänzt).
- Kein Umbau des Dashboards – die vorhandene `useStats`-Hook liefert
  bereits Meilensteine/verspätete Aktivitäten/Benachrichtigungen.
- Kein Rewrite des Milestone-Tabs; die neuen Spalten sind additiv und
  können in Folge-Iterationen genutzt werden.
