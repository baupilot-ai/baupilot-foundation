# Paket 3: Audit Logging & Aktivitätsverlauf

Dieses Paket ergänzt eine belastbare Audit-Spur für BauPilot Foundation.

## Was neu ist

- Neue Tabelle `audit_events` als zentrale, immutable Historie.
- Automatische Datenbank-Trigger für wichtige Tabellen.
- Erfassung von:
  - Aktion: erstellt, geändert, gelöscht, Status geändert, hochgeladen, archiviert, wiederhergestellt
  - Tabelle / Entity-Typ
  - Entity-ID
  - Projekt-ID
  - Benutzer / Actor-ID
  - alte und neue Daten als JSONB
  - geänderte Felder
  - Zeitpunkt
- Spiegelung in die bestehende `activity_log`, damit alte UI-Stellen weiter funktionieren.
- Verbesserter Activity-Tab mit Suche und Aktionsfilter.

## Warum das wichtig ist

Für echte Baustellen-Software muss nachvollziehbar sein:

- Wer hat einen Tagesbericht geändert?
- Wer hat einen Mangel geschlossen?
- Wer hat ein Dokument hochgeladen?
- Wer hat ein Projekt archiviert?
- Welche Felder wurden geändert?

Das schützt euch bei Diskussionen mit Bauherrn, Nachunternehmern und internem Team.

## Installation

1. Patch einspielen.
2. Supabase Migration ausführen:

```sql
supabase/migrations/20260701103000_paket3_audit_events.sql
```

3. App testen:

```bash
bun install
bun run check
bun run build
bun run dev
```

## Testfälle

- Projekt erstellen → Eintrag in `audit_events`.
- Projektstatus ändern → `status_changed`.
- Tagesbericht erstellen → `created`.
- Mangel schließen → `status_changed`.
- Dokument/Foto hochladen → `uploaded`.
- Projekt archivieren → `archived`.
- Projekt wiederherstellen → `restored`.
- Datensatz löschen → `deleted`.

## Wichtig

Die neue Tabelle enthält `old_data` und `new_data`. Das ist stark für Nachvollziehbarkeit, kann aber sensible Daten enthalten. Für sehr große Unternehmenskunden sollte später eine Retention-Regel ergänzt werden, z. B. Audit-Daten 5 bis 10 Jahre behalten und nur Admins exportieren lassen.
