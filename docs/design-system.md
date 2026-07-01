# BauPilot Foundation — Design System

Version: 2026-07 Polier-Fokus Redesign
Zielrollen: **Polier** (mobile-first, eine Hand, Handschuhe, Sonne) und **Bauleiter** (Tablet, Übersicht, Freigaben).

## Nordstern

> "Die App fühlt sich an, als wäre sie von einem Polier entwickelt worden."

Vier harte Regeln:

1. **Weniger ist mehr.** Jeder Screen beantwortet eine Frage. Sekundäres wird entfernt, nicht versteckt.
2. **20 Sekunden.** Morgens muss die wichtigste Information ohne Scrollen sichtbar sein.
3. **Drei Klicks.** Von Heute bis zu jeder Aktion — maximal drei Tippgesten.
4. **Eine Hand.** Alle primären Aktionen sind auf einem 6" Display mit dem Daumen erreichbar.

## Informationsarchitektur — nur 5 Bereiche

| Nav | Route | Zweck |
| --- | --- | --- |
| Heute | `/dashboard` | Morgenbriefing, Wetter, Projekt, Quick Actions |
| Bericht | `/projects` → `#daily-reports` | Bautagesbericht (geführt, KI-gestützt) |
| Mängel | `/projects` → `#defects` | Foto → Beschreibung → Priorität |
| Pläne | `/projects` → `#plans` | Aktuelle freigegebene Pläne |
| Aufgaben | `/projects` → `#tasks` | Heute / Überfällig / Erledigt |

Bestehende Module (Team, Ressourcen, KI-Center, Q&S, Schedule) bleiben in der Datenbank und über Deep Links erreichbar, sind aber **nicht Teil der Haupt-Navigation**. Bauleiter-Ansichten leben zunächst als gefilterte Sichten innerhalb der 5 Bereiche.

## Farbsystem (OKLCH-Tokens, `src/styles.css`)

Nur semantische Tokens verwenden — **niemals** `bg-white`, `text-blue-500`, `#…` in Komponenten.

| Token | Bedeutung | Light | Dark |
| --- | --- | --- | --- |
| `background` | App-Grund | oklch(0.985 …) | oklch(0.155 …) |
| `surface` / `card` | Karten | Weiß | oklch(0.20 …) |
| `surface-sunken` | Sekundär, Filterleiste | oklch(0.97 …) | oklch(0.14 …) |
| `primary` | Marke, Fokus, CTA | oklch(0.52 0.18 255) | oklch(0.68 0.17 255) |
| `primary-soft` | Selektierte Chips, Badges | oklch(0.94 0.04 255) | oklch(0.30 …) |
| `success` | „OK, abgegeben, freigegeben" | oklch(0.60 0.15 155) | 0.70 … |
| `warning` | „Bericht fehlt, prüfen" | oklch(0.75 0.16 70) | 0.80 … |
| `destructive` | „Kritisch, überfällig, Mangel" | oklch(0.58 0.22 25) | 0.65 … |
| `info` | Neutral positive Zahlen | oklch(0.62 0.14 240) | 0.72 … |
| `muted-foreground` | Sekundäre Labels | oklch(0.48 …) | 0.72 … |
| `border` / `border-strong` | Trenner | oklch(0.915 …) / 0.86 | 10% / 18% Weiß |

Statusfarben sind eindeutig: **Blau ist neutral gut**, **Grün ist erledigt**, **Amber ist Aufmerksamkeit**, **Rot ist Handlungsbedarf**. Keine Mischbedeutungen.

## Typografie

- Familie: **Inter** (`--font-sans`), aktiviert `cv11`, `ss01`, `ss03` für tabellarische Ziffern und offenere Formen.
- Skala:
  - Hero-Zeile (Heute-Begrüßung): 30–36 px, `font-semibold`, `tracking-tight`
  - Sektionslabel (Uppercase Eyebrows): 11–13 px, `tracking-[0.14em]`, `uppercase`, `text-muted-foreground` oder `text-primary/80`
  - Body: 14–15 px, 1.5 Zeilenhöhe
  - Sekundär: 12 px, `text-muted-foreground`
- **Keine Zeilenlängen über ~60 Zeichen** in Fließtext (Content-Bereich `max-w-3xl` auf Heute).

## Layout & Spacing

- Basis-Grid 4 px, praktische Stufen: 4, 8, 12, 16, 20, 24, 32, 48.
- Content-Container: `max-w-3xl` auf Heute (Polier), `max-w-7xl` in Listen (Bauleiter).
- Karten: `rounded-2xl border border-border/60`, `shadow-sm` default, `card-interactive` Utility für Hover.
- Hero-Fläche nutzt `surface-hero` (weiches radiales Blau) — nur einmal pro Screen.

## Touch-Ziele

- Bottom-Nav Items: 56 px Höhe, Icon 22 px in 36 px Pill (`bg-primary/10` bei aktiv).
- Quick-Action-Karten: `min-h-[112px]`, `rounded-2xl`, Icon 40 px Container.
- Buttons mind. 44 px Höhe (`h-11` primär, `h-9` sekundär).
- Formularfelder mind. 44 px, keine winzigen Chevrons.

## Komponenten-Bausteine

- **Hero-Card** (`surface-hero`): Datum-Eyebrow, Begrüßung, Wetter- und Projekt-Sub-Karten, Status-Pills. Nur auf Heute.
- **StatusPill**: `rounded-full`, `ring-1 ring-inset`, immer mit farbigem Dot. Tone-Mapping in `Heute`-Screen und `status-badge.tsx` konsistent.
- **QuickAction**: Karte mit Icon oben, Label unten links, `ArrowRight` unten rechts. Der aktuell wichtigste CTA (fehlender Bericht) wird in `primary` gerendert mit `shadow-primary` — höchstens **einer** pro Screen.
- **StatusBadge** (bestehend): sekundäre Statusanzeige in Listen/Tabellen.
- **Sidebar**: 5 Kern-Items in `BauPilot`-Gruppe, Profil/Settings in `MoreHorizontal`-Subgruppe. Nichts anderes.
- **Bottom-Nav**: identische 5 Items wie Sidebar; aktiver Zustand über Pill hinter dem Icon.

## Motion

Kuratiert, nie dekorativ.

- Standarddauer 200 ms mit `--ease-out-quart` `cubic-bezier(0.25, 1, 0.5, 1)`.
- Hover-Karten: `translateY(-1px)` + `shadow-md` + `border-primary/35` (`card-interactive`).
- Pfeile: `translate-x-0.5` bei Hover.
- Keine Bounce-, Wiggle- oder Confetti-Effekte. `--ease-spring` steht bereit, aktuell ungenutzt — vorbehalten für Erfolgs-Bestätigung (z. B. Bericht abgegeben).

## Ladezustände

- Wetter: dezenter Textzustand („Wetter wird geladen…") statt Spinner.
- Zahlen: 0 statt Skeleton (Zahl 0 ist ehrlich, Skeleton ist Ausrede).
- Listen: Skeleton nur bei > 300 ms Ladezeit.

## Empty States

- Eine Zeile, eine Aktion. Kein Marketing-Text.
- Beispiel Bericht: „Kein Bericht heute" + primärer Button „Bautagesbericht starten".

## Error States

- Ein Satz Klartext, was der Nutzer als Nächstes tun kann. Keine Stacktraces, keine Codes.

## Fokus & Barrierefreiheit

- `:focus-visible` Outline 2 px `--ring`, Offset 2 px, Radius 6 px.
- Kontrast ≥ 4.5:1 für Text, ≥ 3:1 für Icons in aktivem Zustand.
- Alle Interaktionselemente per Tastatur erreichbar; Bottom-Nav ist `nav` mit `Link`, keine reinen `div` Klick-Handler.

## Icons

Lucide, konsistente `strokeWidth`. Aktive Nav-Icons `stroke-[2.3]`. Icon-Wahl bewusst und konservativ — kein Symbolzoo. Wetter-Icons werden aus WMO-Code / Textzustand deterministisch abgeleitet (`weatherIcon()` in `_app.dashboard.tsx`).

## Umsetzungspatterns

- Alle Farben/Radius/Schatten in `src/styles.css` (`@theme inline`).
- Utilities: `surface-hero`, `card-interactive` — via `@utility` in Tailwind v4.
- Semantische Tokens werden über `--color-*` gemappt; Komponenten verwenden `bg-primary`, `text-muted-foreground`, `border-border/60`, nie Rohwerte.
- Sprache: Alle neuen Strings in `heute` und `nav5` Namespaces in `de.json` und `en.json`.

## Was bewusst **nicht** im Foundation-Redesign passiert

- Keine Löschung von Modulen, Tabellen, Rollen, Audit-Log.
- Keine Umbenennung von Routen bestehender Module.
- Kein Umbau bestehender Editor-Flows (Bautagesbericht-Editor, Mängel-Formular). Diese sind für separate Redesign-Pässe vorgesehen und in der Roadmap unter „Guided Flows v2" gelistet.

## Definition of Done pro Screen

Ein Screen ist fertig, wenn:

1. Ein Polier morgens in unter 20 Sekunden versteht, was ansteht.
2. Die wichtigste Aktion ohne Scrollen sichtbar und mit dem Daumen erreichbar ist.
3. Kein Element auf dem Screen ist, das ein Polier nicht wirklich sehen muss.
4. TypeScript strict, Build erfolgreich, keine Linter-Fehler.
