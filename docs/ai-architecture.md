# BauPilot AI – AI Architecture

## Überblick

Das AI Center ist das zentrale KI-Modul in BauPilot. Alle KI-Funktionen laufen über einen einheitlichen Provider – den **Lovable AI Gateway**. Die Server-seitige Ausführung erfolgt in TanStack Start `createServerFn`-Handlern; das Frontend ruft diese als typsichere RPCs auf.

## Datenfluss

```
[Client Route /ai/*]
   │  useServerFn(aiXxx)
   ▼
[createServerFn Handler]  ──►  Supabase (RLS)   ┐
   │                                             │
   │  Lovable AI Gateway (google/gemini-3-flash) │
   ▼                                             ▼
[Antwort JSON/Markdown]                       ai_usage / ai_messages
```

## Module

| Feature | Server Function | Speicherung |
|---|---|---|
| Chat | `aiChatSend` | `ai_conversations`, `ai_messages` |
| Bautagesbericht | `aiGenerateDailyReport` | Vorschau → `daily_reports` |
| Aufgabe | `aiGenerateTask` | Vorschau → `tasks` |
| Protokoll | `aiGenerateProtocol` | Markdown Export |
| Zusammenfassung | `aiProjectSummary` | Markdown |
| KI-Suche | `aiSearch` | Markdown |
| Risikoanalyse | `aiRiskAnalysis` | JSON Ampel |

Jeder Aufruf wird zusätzlich in `ai_usage` geloggt (Feature, Modell, Tokens).

## Datenmodell

- **ai_conversations** – Chatverläufe (Titel, Modell, Projektbezug)
- **ai_messages** – Chat-Nachrichten mit Rolle & Tokens
- **ai_settings** – Nutzerpräferenzen (Modell, Temperatur, System-Prompt, Provider)
- **ai_prompts** – gespeicherte Vorlagen pro Firma
- **ai_usage** – Nutzungsstatistik (Feature, Modell, Tokens, Status)
- **ai_feedback** – Daumen hoch/runter zu einzelnen Antworten

Alle Tabellen haben **RLS aktiviert** und sind firmenbezogen (`company_id`).

## Sicherheit

- `LOVABLE_API_KEY` bleibt server-seitig.
- Jeder KI-Endpoint nutzt `requireSupabaseAuth`-Middleware.
- RLS erzwingt Multi-Tenant-Isolation.
- Kein SQL wird an den User zurückgegeben – nur formatierte Ergebnisse.

## Rechte

Neue Permissions in `src/lib/security/permissions.ts`:

- `ai.chat`
- `ai.daily_reports`
- `ai.protocols`
- `ai.search`
- `ai.summary`
- `ai.settings`
- `ai.admin`

Rollenzuordnung: Owner/Admin/Bauleiter voll, Polier operativ, Client/Viewer kein Zugriff.

## Erweiterbarkeit

- **RAG / Wissensbasis**: `ai_prompts` und ein späteres `ai_documents_index` bilden die Grundlage. Embeddings über `pgvector` können später ergänzt werden.
- **Weitere Provider**: `ai_settings.provider` ist bereits vorbereitet (openai/azure/local). Der Provider-Factory in `src/lib/ai-gateway.server.ts` kann erweitert werden.
- **Streaming**: Aktuell laufen die Anfragen als `generateText` (Request/Response). Für Streaming kann ein zusätzlicher Server-Route unter `src/routes/api/ai.chat.ts` mit `toUIMessageStreamResponse` ergänzt werden.
- **Tool Calling / Agents**: `ai.functions.ts` kann leicht auf `tool()` + `stopWhen(stepCountIs(50))` erweitert werden, sodass die KI eigenständig Daten aus Supabase abfragt.

## UI

- Modul unter `/ai` mit Tab-Navigation (Chat, Bautagesbericht, Aufgabe, Protokoll, Zusammenfassung, Suche, Risiko, Wissen, Einstellungen).
- ChatGPT-ähnliches Layout mit Markdown-Rendering (react-markdown + remark-gfm), Copy, Neu generieren, Stop.
- Vollständig responsive und Dark-Mode kompatibel über bestehende Theme-Tokens.
