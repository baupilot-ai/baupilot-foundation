# Bautagesberichte – Polier & Bauleiter

## Zielgruppe
BauPilot Foundation fokussiert sich ab sofort strikt auf zwei Rollen:
- **Polier** – erfasst täglich Bautagesberichte direkt von der Baustelle (mobil).
- **Bauleiter** – prüft, ergänzt, gibt frei und wertet aus.

Admin sieht/darf alles. Viewer/Bauherr nur lesend, sofern freigegeben.

## Workflow Polier
1. Öffnet Projekt → Tab **Bautagesberichte** → Button **Neu**.
2. Datum ist automatisch heute (deutsches Format, Wochentag sichtbar). Datum kann geändert werden.
3. Aktiviert oben rechts optional **Polier-Modus** — reduziert die Maske auf das Wesentliche (Allgemein, Wetter, Personal, Fotos).
4. Klickt in Reiter **Wetter** auf *Wetter automatisch laden*.
   - Bei vorhandenem Projekt-GPS wird über Open-Meteo (kostenlos, kein Key nötig) das reale Wetter für das gewählte Datum geladen.
   - Ohne GPS werden Fallback-Werte gesetzt.
5. Erfasst Personal (Anzahl / Firmen), Geräte, Material, ausgeführte Arbeiten, Behinderungen, Fotos.
6. Optional: Button **Mit KI formulieren** öffnet einen Dialog. Stichpunkte reichen ("Decke EG betoniert, 18 Mann, 2 Kräne, Beton C30/37, keine Unfälle"). Die KI erzeugt strukturierte Felder (Arbeiten, Material, Geräte, Behinderungen, Vorkommnisse, Zusammenfassung).
7. Speichern → Status **Entwurf**. Später *Einreichen* → geht an Bauleiter.

## Workflow Bauleiter
1. Öffnet Projekt → **Bautagesberichte**.
2. Nutzt Filter:
   - **Datum** und **Status**
   - Textsuche in Arbeiten / Notizen / Sicherheit
   - **Schnellfilter**: Mit Behinderung / Mit Unfall/Vorfall / Wetterbeeinflussung
3. Klickt einen Bericht an → sieht alle Reiter (inkl. Unterschriften, Anhänge).
4. Aktionen: Prüfen → Genehmigen oder Ablehnen (mit Grund).
5. Export-Buttons: **PDF / Excel / E-Mail** (aktuell Platzhalter, siehe unten).

## Rechte
Umgesetzt via RLS und Rollenmatrix (`src/lib/security/permissions.ts`):
- Polier: eigene Berichte erstellen & bearbeiten.
- Bauleiter: alle Berichte im Firmen-Scope lesen, prüfen, freigeben.
- Admin/Owner: alles.
- Viewer/Bauherr: nur lesen.

## Wetterlogik
Datei: `src/hooks/use-daily-report-weather.ts`

Signatur:
```ts
useDailyReportWeather(date: string, projectLocation: { lat, lng })
  → { data, loading, error, load(date) }
```

Reihenfolge:
1. `load(date)` wird per Button ausgelöst.
2. Wenn `lat/lng` gültig → Fetch auf **Open-Meteo** (`https://api.open-meteo.com/v1/forecast`) mit den stündlichen Größen `temperature_2m`, `precipitation`, `weather_code`, `wind_speed_10m`, `relative_humidity_2m`. Werte für 08/12/18 Uhr werden als Morgens/Mittags/Abends abgebildet, WMO-Code auf deutsche Bezeichnung gemappt.
3. Ohne Koordinaten oder bei API-Fehler → sauberer Fallback (Mock).
4. **Keine API-Keys im Code.** Für einen späteren bezahlten Anbieter kann `VITE_WEATHER_API_KEY` (Client) bzw. `WEATHER_API_KEY` (Server) hinterlegt und die Fetch-Funktion ausgetauscht werden – das Interface bleibt stabil.

Persistierte Wetterfelder in `daily_reports`:
`weather_condition, weather_morning_temp, weather_noon_temp, weather_evening_temp, temperature, wind, wind_speed, precipitation, rainfall_mm, humidity, weather_impact, weather_impact_notes, weather_notes`.

## KI-Erweiterung
Aktuell: `aiGenerateDailyReport` (`src/lib/ai.functions.ts`) nutzt das Lovable AI Gateway (`google/gemini-3-flash-preview`, Key `LOVABLE_API_KEY` bleibt serverseitig).

Ergebnis wird direkt in die passenden Felder des Berichts übernommen (`work_performed`, `materials_delivered`, `equipment_used`, `delays`, `incidents`, `ai_generated_summary`, `workers_count`).

Später denkbar:
- Sprach-zu-Text auf der Baustelle → Text → gleiche Pipeline.
- Vorlagen-Prompt pro Gewerk/Bauphase.
- RAG mit Projekt-Historie (Baubuch, ähnliche Berichte).

## PDF-Export (Roadmap)
Aktuell Platzhalter (`toast.info`). Nächste Schritte:
1. Server-Function `aiOrPdfGenerateDailyReport` mit `pdfmake`/`pdf-lib` auf Cloudflare Workers-kompatibler Bibliothek.
2. Layout: Kopf (Projekt, Datum, Polier), Wetter-Block, Personal-Tabelle, Geräte, Arbeiten, Vorkommnisse, Unterschriften.
3. Speicherung in Bucket `daily-report-files` + Signed URL.
4. E-Mail-Versand via Resend oder ähnlichem Anbieter (Secret über Add-Secret-Flow).

## Datenmodell (relevante Felder)
`daily_reports` ergänzt (Migration vom 2026-07-01):
`weather_morning_temp, weather_noon_temp, weather_evening_temp, precipitation, weather_impact, weather_impact_notes, incidents, next_steps, companies_on_site, ai_generated_summary, updated_by`. Trigger `set_daily_report_updated_by` setzt Autor & Zeit bei Änderung.

## Mobile / UX Regeln
- Große Buttons, sparsame Reiter im Polier-Modus.
- Empty-, Loading- und Error-States in Liste und Editor.
- Wochentag + `TT.MM.JJJJ` prominent im Kopf des Editors.
- Statusbadges farbcodiert (Entwurf/eingereicht/genehmigt/abgelehnt).
