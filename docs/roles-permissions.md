# BauPilot Rollen- und Rechte-Matrix

| Bereich | Owner | Admin | Bauleiter | Polier | Nachunternehmer | Bauherr | Nur Lesen |
|---|---:|---:|---:|---:|---:|---:|---:|
| Dashboard lesen | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Firma bearbeiten | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Projekte lesen | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Projekte erstellen/bearbeiten | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Projekte löschen | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Baustellenmodule lesen | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tagesberichte/Mängel/Leistung schreiben | ✅ | ✅ | ✅ | ✅ | ✅* | ❌ | ❌ |
| Dokumente lesen | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dokumente hochladen/bearbeiten | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Dokumente löschen | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ressourcen verwalten | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Team verwalten | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Einstellungen lesen | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Einstellungen ändern | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

\* Nachunternehmer dürfen nur operative Angaben/Dokumente beitragen. Kritische Freigaben, Löschungen und Projektstammdaten bleiben bei Owner/Admin/Bauleiter.

## Wichtig

Die UI blendet geschützte Menüpunkte aus. Die echte Sicherheit liegt aber in Supabase RLS. Deshalb dürfen Rollen nie nur im Frontend geprüft werden.
