import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Note: server-only imports (ai, ai-gateway.server) are loaded lazily inside handlers
// so client bundles don't pull them in.

async function getAI() {
  const { generateText } = await import("ai");
  const { createLovableAiGatewayProvider, DEFAULT_AI_MODEL } = await import("./ai-gateway.server");
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const gateway = createLovableAiGatewayProvider(key);
  return { gateway, model: gateway(DEFAULT_AI_MODEL), generateText };
}

async function logUsage(
  supabase: any,
  companyId: string,
  userId: string,
  feature: string,
  model: string,
  tokensIn = 0,
  tokensOut = 0,
) {
  await supabase.from("ai_usage").insert({
    company_id: companyId,
    user_id: userId,
    feature,
    model,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
  });
}

async function getCompanyId(supabase: any, userId: string): Promise<string> {
  const { data } = await supabase.from("profiles").select("company_id").eq("id", userId).maybeSingle();
  if (!data?.company_id) throw new Error("No company");
  return data.company_id as string;
}

// ---------- Chat (non-streaming; simple + reliable across TanStack) ----------
export const aiChatSend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        conversationId: z.string().uuid().nullable().optional(),
        message: z.string().min(1).max(8000),
        projectId: z.string().uuid().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const companyId = await getCompanyId(supabase, userId);
    const { model, generateText } = await getAI();

    let conversationId = data.conversationId ?? null;
    if (!conversationId) {
      const { data: conv, error } = await supabase
        .from("ai_conversations")
        .insert({
          company_id: companyId,
          user_id: userId,
          project_id: data.projectId ?? null,
          title: data.message.slice(0, 60),
        })
        .select()
        .single();
      if (error) throw error;
      conversationId = conv.id;
    }

    // Load history
    const { data: history } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    const messages = [
      {
        role: "system" as const,
        content:
          "Du bist BauPilot AI – ein Assistent für Bauunternehmen, Bauleiter und Poliere. Antworte präzise, professionell und auf Deutsch. Nutze Markdown, Tabellen und Codeblöcke wenn hilfreich.",
      },
      ...(history ?? []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: data.message },
    ];

    // Insert user message
    await supabase.from("ai_messages").insert({
      conversation_id: conversationId,
      company_id: companyId,
      role: "user",
      content: data.message,
    });

    const result = await generateText({ model, messages: messages as any });

    const { data: assistantMsg, error: aErr } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        company_id: companyId,
        role: "assistant",
        content: result.text,
        tokens_in: result.usage?.inputTokens ?? 0,
        tokens_out: result.usage?.outputTokens ?? 0,
      })
      .select()
      .single();
    if (aErr) throw aErr;

    await supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
    await logUsage(supabase, companyId, userId, "chat", "google/gemini-3-flash-preview", result.usage?.inputTokens ?? 0, result.usage?.outputTokens ?? 0);

    return { conversationId, message: assistantMsg };
  });

// ---------- Daily Report Generation ----------
const DailyReportSchema = z.object({
  weather: z.string().nullable(),
  temperature: z.string().nullable(),
  workforce_count: z.number().nullable(),
  work_performed: z.string(),
  materials: z.string().nullable(),
  equipment: z.string().nullable(),
  delays: z.string().nullable(),
  incidents: z.string().nullable(),
  summary: z.string(),
});

export const aiGenerateDailyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ input: z.string().min(3).max(4000), projectId: z.string().uuid().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const companyId = await getCompanyId(supabase, userId);
    const { model, generateText } = await getAI();

    const prompt = `Erstelle aus der folgenden Baustellen-Notiz einen strukturierten Bautagesbericht als JSON.

Rohtext:
"""
${data.input}
"""

Antworte NUR mit einem JSON-Objekt in dieser Form (keine Codeblöcke, keine Erklärung):
{
  "weather": string|null,
  "temperature": string|null,
  "workforce_count": number|null,
  "work_performed": string,
  "materials": string|null,
  "equipment": string|null,
  "delays": string|null,
  "incidents": string|null,
  "summary": string
}`;

    const result = await generateText({ model, prompt });
    const jsonText = result.text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    let parsed: z.infer<typeof DailyReportSchema>;
    try {
      parsed = DailyReportSchema.parse(JSON.parse(jsonText));
    } catch {
      throw new Error("KI-Antwort konnte nicht als Bautagesbericht interpretiert werden.");
    }

    await logUsage(supabase, companyId, userId, "daily_report", "google/gemini-3-flash-preview", result.usage?.inputTokens ?? 0, result.usage?.outputTokens ?? 0);
    return parsed;
  });

// ---------- Task Extraction ----------
const TaskSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  due_date: z.string().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).nullable(),
  assignee_hint: z.string().nullable(),
});

export const aiGenerateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ input: z.string().min(3).max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const companyId = await getCompanyId(supabase, userId);
    const { model, generateText } = await getAI();

    const today = new Date().toISOString().slice(0, 10);
    const prompt = `Heute ist ${today}. Extrahiere aus folgendem Satz eine Aufgabe als JSON.

Satz: "${data.input}"

Antworte NUR mit JSON (keine Codeblöcke):
{"title":"","description":null,"due_date":"YYYY-MM-DD"|null,"priority":"low"|"medium"|"high"|"urgent"|null,"assignee_hint":null}`;

    const result = await generateText({ model, prompt });
    const jsonText = result.text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const parsed = TaskSchema.parse(JSON.parse(jsonText));

    await logUsage(supabase, companyId, userId, "task_create", "google/gemini-3-flash-preview");
    return parsed;
  });

// ---------- Project Summary ----------
export const aiProjectSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ projectId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const companyId = await getCompanyId(supabase, userId);
    const { model, generateText } = await getAI();

    const [{ data: project }, { data: tasks }, { data: defects }, { data: milestones }, { data: reports }] = await Promise.all([
      supabase.from("projects").select("*").eq("id", data.projectId).maybeSingle(),
      supabase.from("tasks").select("id,title,status,due_date,priority").eq("project_id", data.projectId).limit(50),
      supabase.from("defects").select("id,title,status,severity").eq("project_id", data.projectId).limit(50),
      supabase.from("project_milestones").select("name,due_date,status,current_status").eq("project_id", data.projectId).limit(30),
      supabase.from("daily_reports").select("report_date,summary,status").eq("project_id", data.projectId).order("report_date", { ascending: false }).limit(5),
    ]);

    if (!project) throw new Error("Projekt nicht gefunden");

    const context_text = `Projekt: ${project.name}
Status: ${project.status}
Aufgaben (${tasks?.length ?? 0}): ${JSON.stringify(tasks?.slice(0, 20) ?? [])}
Mängel (${defects?.length ?? 0}): ${JSON.stringify(defects?.slice(0, 20) ?? [])}
Meilensteine: ${JSON.stringify(milestones ?? [])}
Letzte Bautagesberichte: ${JSON.stringify(reports ?? [])}`;

    const prompt = `Erstelle eine professionelle Projektzusammenfassung als Markdown mit folgenden Abschnitten:
### Fortschritt
### Offene Aufgaben
### Offene Mängel
### Risiken
### Verzögerungen
### Personal & Ressourcen
### Empfehlung

Basierend auf:
${context_text}`;

    const result = await generateText({ model, prompt });
    await logUsage(supabase, companyId, userId, "project_summary", "google/gemini-3-flash-preview");
    return { markdown: result.text };
  });

// ---------- Protocol Generation ----------
export const aiGenerateProtocol = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ input: z.string().min(10).max(8000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const companyId = await getCompanyId(supabase, userId);
    const { model, generateText } = await getAI();

    const prompt = `Erstelle aus folgenden Besprechungsnotizen ein professionelles Baubesprechungsprotokoll als Markdown.

Struktur:
### Teilnehmer
### Besprochene Themen
### Aufgaben (Tabelle: Aufgabe | Verantwortlich | Termin)
### Nächste Schritte

Notizen:
"""
${data.input}
"""`;

    const result = await generateText({ model, prompt });
    await logUsage(supabase, companyId, userId, "protocol", "google/gemini-3-flash-preview");
    return { markdown: result.text };
  });

// ---------- Risk Analysis ----------
export const aiRiskAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ projectId: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const companyId = await getCompanyId(supabase, userId);
    const { model, generateText } = await getAI();

    let q = supabase.from("projects").select("id,name,status,end_date").eq("company_id", companyId);
    if (data.projectId) q = q.eq("id", data.projectId);
    const { data: projects } = await q.limit(20);
    const { data: openDefects } = await supabase.from("defects").select("id,project_id,severity,status").in("project_id", (projects ?? []).map((p: any) => p.id));
    const { data: overdueTasks } = await supabase
      .from("tasks")
      .select("id,project_id,status,due_date")
      .in("project_id", (projects ?? []).map((p: any) => p.id))
      .lt("due_date", new Date().toISOString().slice(0, 10))
      .neq("status", "done");

    const prompt = `Analysiere die folgenden Projektdaten und bewerte die Risiken. Antworte NUR mit JSON (keine Codeblöcke):

[
  {
    "project_id": "...",
    "project_name": "...",
    "schedule_risk": "green"|"yellow"|"red",
    "cost_risk": "green"|"yellow"|"red",
    "quality_risk": "green"|"yellow"|"red",
    "resource_risk": "green"|"yellow"|"red",
    "material_risk": "green"|"yellow"|"red",
    "document_risk": "green"|"yellow"|"red",
    "reasoning": "kurze Begründung"
  }
]

Daten:
Projekte: ${JSON.stringify(projects ?? [])}
Offene Mängel: ${JSON.stringify(openDefects ?? [])}
Überfällige Aufgaben: ${JSON.stringify(overdueTasks ?? [])}`;

    const result = await generateText({ model, prompt });
    const jsonText = result.text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const risks = JSON.parse(jsonText);
    await logUsage(supabase, companyId, userId, "risk_analysis", "google/gemini-3-flash-preview");
    return { risks };
  });

// ---------- AI Search ----------
export const aiSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ query: z.string().min(2).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const companyId = await getCompanyId(supabase, userId);
    const { model, generateText } = await getAI();

    // Fetch a broad slice of company data
    const [projects, tasks, defects, reports, docs] = await Promise.all([
      supabase.from("projects").select("id,name,status,end_date").eq("company_id", companyId).limit(50),
      supabase.from("tasks").select("id,title,status,due_date,project_id,priority").eq("company_id", companyId).limit(200),
      supabase.from("defects").select("id,title,status,severity,project_id").eq("company_id", companyId).limit(200),
      supabase.from("daily_reports").select("id,report_date,summary,project_id,status").eq("company_id", companyId).order("report_date", { ascending: false }).limit(50),
      supabase.from("project_documents").select("id,name,status,project_id").eq("company_id", companyId).limit(100),
    ]);

    const prompt = `Der Nutzer sucht: "${data.query}"

Beantworte die Frage präzise und in Markdown. Zeige relevante Ergebnisse als Tabelle wenn sinnvoll. Kein SQL, keine Datenbank-Details.

Daten (JSON):
Projekte: ${JSON.stringify(projects.data ?? [])}
Aufgaben: ${JSON.stringify(tasks.data ?? [])}
Mängel: ${JSON.stringify(defects.data ?? [])}
Bautagesberichte: ${JSON.stringify(reports.data ?? [])}
Dokumente: ${JSON.stringify(docs.data ?? [])}`;

    const result = await generateText({ model, prompt });
    await logUsage(supabase, companyId, userId, "search", "google/gemini-3-flash-preview");
    return { markdown: result.text };
  });
