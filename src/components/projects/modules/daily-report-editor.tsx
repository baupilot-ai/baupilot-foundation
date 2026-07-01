import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Plus, Trash2, Upload, FileText, X, Check, Send, Sparkles, CloudSun } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/ui/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { useDailyReportWeather, type ProjectLocation } from "@/hooks/use-daily-report-weather";
import { aiGenerateDailyReport } from "@/lib/ai.functions";
import {
  DailyReport, DRAttachment, DRDelay, DREquipment, DRMaterial, DRPhoto, DRSignature,
  DRVisitor, DRWork, DRWorkforce, DELAY_TYPES, PHOTO_CATEGORIES_PRO, SIGNATURE_ROLES,
  createReport, updateReport, listChildren, insertChild, deleteChild,
  uploadReportFile, submitReport, approveReport, rejectReport,
} from "@/lib/daily-reports";
import { WEATHER_OPTIONS } from "@/lib/site-modules";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  reportId: string | null;
  onSaved: () => void;
}

export function DailyReportEditor({ open, onOpenChange, projectId, reportId, onSaved }: Props) {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const [report, setReport] = useState<Partial<DailyReport>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(reportId);

  // child collections
  const [workforce, setWorkforce] = useState<DRWorkforce[]>([]);
  const [equipment, setEquipment] = useState<DREquipment[]>([]);
  const [materials, setMaterials] = useState<DRMaterial[]>([]);
  const [work, setWork] = useState<DRWork[]>([]);
  const [delays, setDelays] = useState<DRDelay[]>([]);
  const [visitors, setVisitors] = useState<DRVisitor[]>([]);
  const [photos, setPhotos] = useState<DRPhoto[]>([]);
  const [signatures, setSignatures] = useState<DRSignature[]>([]);
  const [attachments, setAttachments] = useState<DRAttachment[]>([]);

  // reference data
  const [equipmentList, setEquipmentList] = useState<{ id: string; name: string }[]>([]);
  const [materialsList, setMaterialsList] = useState<{ id: string; name: string; unit: string | null }[]>([]);
  const [projectLoc, setProjectLoc] = useState<ProjectLocation>({ lat: null, lng: null });

  // Polier quick mode
  const [quickMode, setQuickMode] = useState(false);

  // AI formulate dialog
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const aiGen = useServerFn(aiGenerateDailyReport);

  const weather = useDailyReportWeather(report.report_date ?? "", projectLoc);

  useEffect(() => {
    if (!open) return;
    setCurrentId(reportId);
    (async () => {
      setLoading(true);
      try {
        const [eq, mat, proj] = await Promise.all([
          supabase.from("equipment").select("id, name").order("name"),
          supabase.from("materials").select("id, name, unit").order("name"),
          supabase.from("projects").select("gps_lat, gps_lng").eq("id", projectId).maybeSingle(),
        ]);
        setEquipmentList((eq.data ?? []) as never);
        setMaterialsList((mat.data ?? []) as never);
        setProjectLoc({ lat: proj.data?.gps_lat ?? null, lng: proj.data?.gps_lng ?? null });

        if (reportId) {
          const { data } = await supabase.from("daily_reports").select("*").eq("id", reportId).single();
          if (data) setReport(data);
          await loadChildren(reportId);
        } else {
          setReport({ report_date: new Date().toISOString().slice(0, 10), status: "draft", site_status: "normal", foreman_id: profile?.id });
          setWorkforce([]); setEquipment([]); setMaterials([]); setWork([]); setDelays([]);
          setVisitors([]); setPhotos([]); setSignatures([]); setAttachments([]);
        }
      } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reportId]);

  async function loadChildren(id: string) {
    const [wf, eq, mat, wk, dl, vi, ph, sg, at] = await Promise.all([
      listChildren<DRWorkforce>("daily_report_workforce", id),
      listChildren<DREquipment>("daily_report_equipment", id),
      listChildren<DRMaterial>("daily_report_materials", id),
      listChildren<DRWork>("daily_report_work_performed", id),
      listChildren<DRDelay>("daily_report_delays", id),
      listChildren<DRVisitor>("daily_report_visitors", id),
      listChildren<DRPhoto>("daily_report_photos", id),
      listChildren<DRSignature>("daily_report_signatures", id),
      listChildren<DRAttachment>("daily_report_attachments", id),
    ]);
    setWorkforce(wf); setEquipment(eq); setMaterials(mat); setWork(wk); setDelays(dl);
    setVisitors(vi); setPhotos(ph); setSignatures(sg); setAttachments(at);
  }

  async function ensureSaved(): Promise<string> {
    if (currentId) {
      await updateReport(currentId, report);
      return currentId;
    }
    if (!report.report_date) throw new Error(t("dailyReports.dateRequired"));
    const r = await createReport({ ...report, project_id: projectId, report_date: report.report_date } as never);
    setCurrentId(r.id);
    return r.id;
  }

  async function saveHeader() {
    setSaving(true);
    try {
      await ensureSaved();
      toast.success(t("common.saved"));
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.saveFailed"));
    } finally { setSaving(false); }
  }

  async function addChild<T>(table: Parameters<typeof insertChild>[0], row: Record<string, unknown>, setter: (v: T[]) => void, current: T[]) {
    const id = await ensureSaved();
    const created = await insertChild<T>(table, { ...row, daily_report_id: id, project_id: projectId });
    setter([...current, created]);
  }

  async function removeChild<T extends { id: string }>(table: Parameters<typeof deleteChild>[0], id: string, setter: (v: T[]) => void, current: T[]) {
    await deleteChild(table, id);
    setter(current.filter((x) => x.id !== id));
  }

  const totalWorkers = useMemo(
    () => workforce.reduce((s, w) => s + (w.own_workers ?? 0) + (w.subcontractor_workers ?? 0), 0),
    [workforce],
  );

  const canApprove = report.status === "submitted" || report.status === "reviewed";
  const canSubmit = report.status === "draft" || !report.status;

  const dateLabel = report.report_date ? formatWeekdayDate(report.report_date) : "";

  async function applyAiDraft() {
    if (!aiInput.trim()) return;
    setAiBusy(true);
    try {
      const res = await aiGen({ data: { input: aiInput } });
      setReport((r) => ({
        ...r,
        work_performed: [r.work_performed, res.work_performed].filter(Boolean).join("\n\n") || res.work_performed,
        materials_delivered: res.materials ?? r.materials_delivered,
        equipment_used: res.equipment ?? r.equipment_used,
        delays: res.delays ?? r.delays,
        incidents: res.incidents ?? r.incidents,
        weather_condition: r.weather_condition ?? res.weather,
        ai_generated_summary: res.summary,
        workers_count: res.workforce_count ?? r.workers_count,
      }));
      toast.success(t("dailyReports.ai.appliedSuccess", "KI-Text übernommen"));
      setAiOpen(false);
      setAiInput("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "KI-Fehler");
    } finally {
      setAiBusy(false);
    }
  }

  async function loadWeather() {
    if (!report.report_date) return;
    const w = await weather.load(report.report_date);
    setReport((r) => ({
      ...r,
      weather_condition: r.weather_condition ?? w.condition ?? undefined,
      weather_morning_temp: r.weather_morning_temp ?? w.morningTemp ?? undefined,
      weather_noon_temp: r.weather_noon_temp ?? w.noonTemp ?? undefined,
      weather_evening_temp: r.weather_evening_temp ?? w.eveningTemp ?? undefined,
      temperature: r.temperature ?? w.noonTemp ?? undefined,
      wind_speed: r.wind_speed ?? w.windSpeed ?? undefined,
      precipitation: r.precipitation ?? w.precipitation ?? undefined,
      rainfall_mm: r.rainfall_mm ?? w.precipitationMm ?? undefined,
      humidity: r.humidity ?? w.humidity ?? undefined,
    }));
    toast.success(w.source === "mock"
      ? t("dailyReports.weatherFields.loadedMock", "Wetter (Fallback) geladen")
      : t("dailyReports.weatherFields.loaded", "Wetter geladen"));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-auto">
              <DialogTitle>{currentId ? t("dailyReports.edit") : t("dailyReports.new")}</DialogTitle>
              {dateLabel && <div className="mt-1 text-sm text-muted-foreground">{dateLabel}</div>}
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={quickMode} onCheckedChange={setQuickMode} />
              {t("dailyReports.polierMode", "Polier-Modus")}
            </label>
            <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
              <Sparkles className="h-4 w-4" /> {t("dailyReports.ai.formulate", "Mit KI formulieren")}
            </Button>
            {report.status && <StatusBadge tone={statusTone(report.status)}>{t(`dailyReports.reportStatus.${report.status}`)}</StatusBadge>}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="max-h-[calc(95vh-8rem)] overflow-y-auto p-4">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-4 flex w-full flex-wrap justify-start gap-1 bg-muted/40">
                <TabsTrigger value="general">{t("dailyReports.sections.general")}</TabsTrigger>
                <TabsTrigger value="weather">{t("dailyReports.sections.weather")}</TabsTrigger>
                <TabsTrigger value="workforce">{t("dailyReports.sections.workforce")} ({workforce.length})</TabsTrigger>
                {!quickMode && <TabsTrigger value="equipment">{t("dailyReports.sections.equipment")} ({equipment.length})</TabsTrigger>}
                {!quickMode && <TabsTrigger value="materials">{t("dailyReports.sections.materials")} ({materials.length})</TabsTrigger>}
                {!quickMode && <TabsTrigger value="work">{t("dailyReports.sections.work")} ({work.length})</TabsTrigger>}
                {!quickMode && <TabsTrigger value="delays">{t("dailyReports.sections.delays")} ({delays.length})</TabsTrigger>}
                {!quickMode && <TabsTrigger value="visitors">{t("dailyReports.sections.visitors")} ({visitors.length})</TabsTrigger>}
                <TabsTrigger value="photos">{t("dailyReports.sections.photos")} ({photos.length})</TabsTrigger>
                {!quickMode && <TabsTrigger value="signatures">{t("dailyReports.sections.signatures")} ({signatures.length})</TabsTrigger>}
                {!quickMode && <TabsTrigger value="attachments">{t("dailyReports.sections.attachments")} ({attachments.length})</TabsTrigger>}
              </TabsList>

              {/* GENERAL */}
              <TabsContent value="general" className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={`${t("dailyReports.fields.reportDate")} *`}>
                    <Input type="date" value={report.report_date ?? ""} onChange={(e) => setReport({ ...report, report_date: e.target.value })} />
                  </Field>
                  <Field label={t("dailyReports.fields.siteStatus")}>
                    <Select value={report.site_status ?? "normal"} onValueChange={(v) => setReport({ ...report, site_status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["normal", "delayed", "stopped", "limited"].map((s) => (
                          <SelectItem key={s} value={s}>{t(`dailyReports.status.${s}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={t("dailyReports.fields.start")}>
                    <Input type="time" value={report.working_hours_start ?? ""} onChange={(e) => setReport({ ...report, working_hours_start: e.target.value })} />
                  </Field>
                  <Field label={t("dailyReports.fields.end")}>
                    <Input type="time" value={report.working_hours_end ?? ""} onChange={(e) => setReport({ ...report, working_hours_end: e.target.value })} />
                  </Field>
                </div>
                <Field label={t("dailyReports.fields.companiesOnSite", "Firmen vor Ort")}>
                  <Textarea rows={2} value={report.companies_on_site ?? ""} onChange={(e) => setReport({ ...report, companies_on_site: e.target.value })} placeholder="z.B. Müller GmbH, Elektro Meier, ..." />
                </Field>
                <Field label={t("dailyReports.fields.workPerformed", "Ausgeführte Arbeiten (Zusammenfassung)")}>
                  <Textarea rows={4} value={report.work_performed ?? ""} onChange={(e) => setReport({ ...report, work_performed: e.target.value })} />
                </Field>
                <Field label={t("dailyReports.fields.incidents", "Besondere Vorkommnisse / Unfälle")}>
                  <Textarea rows={2} value={report.incidents ?? ""} onChange={(e) => setReport({ ...report, incidents: e.target.value })} />
                </Field>
                <Field label={t("dailyReports.fields.delays", "Behinderungen")}>
                  <Textarea rows={2} value={report.delays ?? ""} onChange={(e) => setReport({ ...report, delays: e.target.value })} />
                </Field>
                <Field label={t("dailyReports.fields.nextSteps", "Nächste Schritte / Anweisungen Bauleitung")}>
                  <Textarea rows={2} value={report.next_steps ?? ""} onChange={(e) => setReport({ ...report, next_steps: e.target.value })} />
                </Field>
                <Field label={t("dailyReports.fields.notes")}>
                  <Textarea rows={2} value={report.notes ?? ""} onChange={(e) => setReport({ ...report, notes: e.target.value })} />
                </Field>
                <Field label={t("dailyReports.fields.safetyNotes")}>
                  <Textarea rows={2} value={report.safety_notes ?? ""} onChange={(e) => setReport({ ...report, safety_notes: e.target.value })} />
                </Field>
                {report.ai_generated_summary && (
                  <div className="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-primary"><Sparkles className="h-4 w-4" />{t("dailyReports.ai.summary", "KI-Zusammenfassung")}</div>
                    <div className="mt-1 whitespace-pre-wrap text-muted-foreground">{report.ai_generated_summary}</div>
                  </div>
                )}
                {report.rejection_reason && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                    <div className="font-semibold text-destructive">{t("dailyReports.rejectionReason")}</div>
                    <div className="mt-1 text-muted-foreground">{report.rejection_reason}</div>
                  </div>
                )}
              </TabsContent>

              {/* WEATHER */}
              <TabsContent value="weather" className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">
                    {projectLoc.lat != null && projectLoc.lng != null
                      ? t("dailyReports.weatherFields.autoAvailable", "GPS vorhanden – Wetter kann automatisch geladen werden.")
                      : t("dailyReports.weatherFields.autoUnavailable", "Kein Projekt-GPS – Fallback-Wetter wird geladen.")}
                  </div>
                  <Button size="sm" variant="outline" disabled={weather.loading || !report.report_date} onClick={loadWeather}>
                    {weather.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudSun className="h-4 w-4" />}
                    {t("dailyReports.weatherFields.loadAuto", "Wetter automatisch laden")}
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label={t("dailyReports.fields.weather")}>
                    <Select value={report.weather_condition ?? ""} onValueChange={(v) => setReport({ ...report, weather_condition: v })}>
                      <SelectTrigger><SelectValue placeholder={t("dailyReports.fields.weatherSelect")} /></SelectTrigger>
                      <SelectContent>{WEATHER_OPTIONS.map((w) => <SelectItem key={w} value={w}>{t(`dailyReports.weather.${w}`, w)}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label={t("dailyReports.weatherFields.morningTemp", "Temperatur morgens (°C)")}><NumberInput value={report.weather_morning_temp} onChange={(v) => setReport({ ...report, weather_morning_temp: v })} /></Field>
                  <Field label={t("dailyReports.weatherFields.noonTemp", "Temperatur mittags (°C)")}><NumberInput value={report.weather_noon_temp} onChange={(v) => setReport({ ...report, weather_noon_temp: v })} /></Field>
                  <Field label={t("dailyReports.weatherFields.eveningTemp", "Temperatur abends (°C)")}><NumberInput value={report.weather_evening_temp} onChange={(v) => setReport({ ...report, weather_evening_temp: v })} /></Field>
                  <Field label={t("dailyReports.weatherFields.windSpeed")}><NumberInput value={report.wind_speed} onChange={(v) => setReport({ ...report, wind_speed: v })} /></Field>
                  <Field label={t("dailyReports.weatherFields.wind", "Wind")}><Input value={report.wind ?? ""} onChange={(e) => setReport({ ...report, wind: e.target.value })} /></Field>
                  <Field label={t("dailyReports.weatherFields.precipitation", "Niederschlag")}><Input value={report.precipitation ?? ""} onChange={(e) => setReport({ ...report, precipitation: e.target.value })} placeholder="keiner / Regen / Schnee" /></Field>
                  <Field label={t("dailyReports.weatherFields.rainfall")}><NumberInput value={report.rainfall_mm} onChange={(v) => setReport({ ...report, rainfall_mm: v })} /></Field>
                  <Field label={t("dailyReports.weatherFields.humidity")}><NumberInput value={report.humidity} onChange={(v) => setReport({ ...report, humidity: v })} /></Field>
                  <Field label={t("dailyReports.weatherFields.groundCondition")}><Input value={report.ground_condition ?? ""} onChange={(e) => setReport({ ...report, ground_condition: e.target.value })} /></Field>
                </div>
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <Switch checked={!!report.weather_impact} onCheckedChange={(v) => setReport({ ...report, weather_impact: v })} />
                  <div className="text-sm font-medium">{t("dailyReports.weatherFields.impact", "Arbeitsbeeinflussung durch Wetter")}</div>
                </div>
                {report.weather_impact && (
                  <Field label={t("dailyReports.weatherFields.impactNotes", "Beschreibung der Wetterbeeinflussung")}>
                    <Textarea rows={2} value={report.weather_impact_notes ?? ""} onChange={(e) => setReport({ ...report, weather_impact_notes: e.target.value })} />
                  </Field>
                )}
                <Field label={t("dailyReports.weatherFields.notes")}>
                  <Textarea rows={2} value={report.weather_notes ?? ""} onChange={(e) => setReport({ ...report, weather_notes: e.target.value })} />
                </Field>
              </TabsContent>

              {/* WORKFORCE */}
              <TabsContent value="workforce" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{t("dailyReports.workforce.total")}: <span className="font-semibold text-foreground">{totalWorkers}</span></div>
                  <AddButton label={t("dailyReports.workforce.add")} onClick={() => addChild<DRWorkforce>("daily_report_workforce", { own_workers: 0, subcontractor_workers: 0 }, setWorkforce, workforce)} />
                </div>
                {workforce.map((w, i) => (
                  <ChildCard key={w.id} onDelete={() => removeChild("daily_report_workforce", w.id, setWorkforce, workforce)} title={`#${i + 1}`}>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      <ChildField label={t("dailyReports.workforce.company")}><ChildInput table="daily_report_workforce" id={w.id} field="company_name" value={w.company_name} rows={workforce} setRows={setWorkforce} /></ChildField>
                      <ChildField label={t("dailyReports.workforce.trade")}><ChildInput table="daily_report_workforce" id={w.id} field="trade" value={w.trade} rows={workforce} setRows={setWorkforce} /></ChildField>
                      <ChildField label={t("dailyReports.workforce.supervisor")}><ChildInput table="daily_report_workforce" id={w.id} field="supervisor" value={w.supervisor} rows={workforce} setRows={setWorkforce} /></ChildField>
                      <ChildField label={t("dailyReports.workforce.ownWorkers")}><ChildNumber table="daily_report_workforce" id={w.id} field="own_workers" value={w.own_workers} rows={workforce} setRows={setWorkforce} /></ChildField>
                      <ChildField label={t("dailyReports.workforce.subWorkers")}><ChildNumber table="daily_report_workforce" id={w.id} field="subcontractor_workers" value={w.subcontractor_workers} rows={workforce} setRows={setWorkforce} /></ChildField>
                      <ChildField label={t("dailyReports.workforce.workingHours")}><ChildNumber table="daily_report_workforce" id={w.id} field="working_hours" value={w.working_hours} rows={workforce} setRows={setWorkforce} /></ChildField>
                      <ChildField label={t("dailyReports.workforce.overtime")}><ChildNumber table="daily_report_workforce" id={w.id} field="overtime" value={w.overtime} rows={workforce} setRows={setWorkforce} /></ChildField>
                      <ChildField label={t("dailyReports.workforce.nightShift")}>
                        <div className="flex items-center gap-2 pt-1"><Switch checked={!!w.night_shift} onCheckedChange={(v) => updateChildInline("daily_report_workforce", w.id, "night_shift", v, workforce, setWorkforce)} /></div>
                      </ChildField>
                      <ChildField label={t("dailyReports.fields.notes")} full>
                        <ChildInput table="daily_report_workforce" id={w.id} field="notes" value={w.notes} rows={workforce} setRows={setWorkforce} textarea />
                      </ChildField>
                    </div>
                  </ChildCard>
                ))}
              </TabsContent>

              {/* EQUIPMENT */}
              <TabsContent value="equipment" className="space-y-3">
                <div className="flex justify-end">
                  <AddButton label={t("dailyReports.equipment.add")} onClick={() => addChild<DREquipment>("daily_report_equipment", {}, setEquipment, equipment)} />
                </div>
                {equipment.map((e) => (
                  <ChildCard key={e.id} onDelete={() => removeChild("daily_report_equipment", e.id, setEquipment, equipment)}>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      <ChildField label={t("dailyReports.equipment.equipment")}>
                        <Select value={e.equipment_id ?? ""} onValueChange={async (v) => {
                          const item = equipmentList.find((x) => x.id === v);
                          await updateChildInline("daily_report_equipment", e.id, "equipment_id", v, equipment, setEquipment);
                          if (item) await updateChildInline("daily_report_equipment", e.id, "equipment_name", item.name, equipment, setEquipment);
                        }}>
                          <SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger>
                          <SelectContent>{equipmentList.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </ChildField>
                      <ChildField label={t("dailyReports.equipment.quantity")}><ChildNumber table="daily_report_equipment" id={e.id} field="quantity" value={e.quantity} rows={equipment} setRows={setEquipment} /></ChildField>
                      <ChildField label={t("dailyReports.equipment.workingHours")}><ChildNumber table="daily_report_equipment" id={e.id} field="working_hours" value={e.working_hours} rows={equipment} setRows={setEquipment} /></ChildField>
                      <ChildField label={t("dailyReports.equipment.operator")}><ChildInput table="daily_report_equipment" id={e.id} field="operator" value={e.operator} rows={equipment} setRows={setEquipment} /></ChildField>
                      <ChildField label={t("dailyReports.equipment.status")}><ChildInput table="daily_report_equipment" id={e.id} field="status" value={e.status} rows={equipment} setRows={setEquipment} /></ChildField>
                      <ChildField label={t("dailyReports.fields.notes")} full><ChildInput table="daily_report_equipment" id={e.id} field="notes" value={e.notes} rows={equipment} setRows={setEquipment} textarea /></ChildField>
                    </div>
                  </ChildCard>
                ))}
              </TabsContent>

              {/* MATERIALS */}
              <TabsContent value="materials" className="space-y-3">
                <div className="flex justify-end">
                  <AddButton label={t("dailyReports.materials.add")} onClick={() => addChild<DRMaterial>("daily_report_materials", {}, setMaterials, materials)} />
                </div>
                {materials.map((m) => (
                  <ChildCard key={m.id} onDelete={() => removeChild("daily_report_materials", m.id, setMaterials, materials)}>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      <ChildField label={t("dailyReports.materials.material")}>
                        <Select value={m.material_id ?? ""} onValueChange={async (v) => {
                          const item = materialsList.find((x) => x.id === v);
                          await updateChildInline("daily_report_materials", m.id, "material_id", v, materials, setMaterials);
                          if (item) {
                            await updateChildInline("daily_report_materials", m.id, "material_name", item.name, materials, setMaterials);
                            if (item.unit) await updateChildInline("daily_report_materials", m.id, "unit", item.unit, materials, setMaterials);
                          }
                        }}>
                          <SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger>
                          <SelectContent>{materialsList.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </ChildField>
                      <ChildField label={t("dailyReports.materials.quantity")}><ChildNumber table="daily_report_materials" id={m.id} field="quantity" value={m.quantity} rows={materials} setRows={setMaterials} /></ChildField>
                      <ChildField label={t("dailyReports.materials.unit")}><ChildInput table="daily_report_materials" id={m.id} field="unit" value={m.unit} rows={materials} setRows={setMaterials} /></ChildField>
                      <ChildField label={t("dailyReports.materials.supplier")}><ChildInput table="daily_report_materials" id={m.id} field="supplier" value={m.supplier} rows={materials} setRows={setMaterials} /></ChildField>
                      <ChildField label={t("dailyReports.materials.deliveryNumber")}><ChildInput table="daily_report_materials" id={m.id} field="delivery_number" value={m.delivery_number} rows={materials} setRows={setMaterials} /></ChildField>
                      <ChildField label={t("dailyReports.fields.notes")} full><ChildInput table="daily_report_materials" id={m.id} field="notes" value={m.notes} rows={materials} setRows={setMaterials} textarea /></ChildField>
                    </div>
                  </ChildCard>
                ))}
              </TabsContent>

              {/* WORK */}
              <TabsContent value="work" className="space-y-3">
                <div className="flex justify-end">
                  <AddButton label={t("dailyReports.work.add")} onClick={() => addChild<DRWork>("daily_report_work_performed", { progress_pct: 0 }, setWork, work)} />
                </div>
                {work.map((w) => (
                  <ChildCard key={w.id} onDelete={() => removeChild("daily_report_work_performed", w.id, setWork, work)}>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      <ChildField label={t("dailyReports.work.area")}><ChildInput table="daily_report_work_performed" id={w.id} field="area" value={w.area} rows={work} setRows={setWork} /></ChildField>
                      <ChildField label={t("dailyReports.work.section")}><ChildInput table="daily_report_work_performed" id={w.id} field="building_section" value={w.building_section} rows={work} setRows={setWork} /></ChildField>
                      <ChildField label={t("dailyReports.work.floor")}><ChildInput table="daily_report_work_performed" id={w.id} field="floor" value={w.floor} rows={work} setRows={setWork} /></ChildField>
                      <ChildField label={t("dailyReports.work.trade")}><ChildInput table="daily_report_work_performed" id={w.id} field="trade" value={w.trade} rows={work} setRows={setWork} /></ChildField>
                      <ChildField label={t("dailyReports.work.progress")}><ChildNumber table="daily_report_work_performed" id={w.id} field="progress_pct" value={w.progress_pct} rows={work} setRows={setWork} /></ChildField>
                      <ChildField label={t("dailyReports.work.description")} full><ChildInput table="daily_report_work_performed" id={w.id} field="description" value={w.description} rows={work} setRows={setWork} textarea /></ChildField>
                      <ChildField label={t("dailyReports.fields.notes")} full><ChildInput table="daily_report_work_performed" id={w.id} field="notes" value={w.notes} rows={work} setRows={setWork} textarea /></ChildField>
                    </div>
                  </ChildCard>
                ))}
              </TabsContent>

              {/* DELAYS */}
              <TabsContent value="delays" className="space-y-3">
                <div className="flex justify-end">
                  <AddButton label={t("dailyReports.delays.add")} onClick={() => addChild<DRDelay>("daily_report_delays", { delay_type: "other" }, setDelays, delays)} />
                </div>
                {delays.map((d) => (
                  <ChildCard key={d.id} onDelete={() => removeChild("daily_report_delays", d.id, setDelays, delays)}>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      <ChildField label={t("dailyReports.delays.type")}>
                        <Select value={d.delay_type ?? "other"} onValueChange={(v) => updateChildInline("daily_report_delays", d.id, "delay_type", v, delays, setDelays)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{DELAY_TYPES.map((x) => <SelectItem key={x} value={x}>{t(`dailyReports.delayTypes.${x}`)}</SelectItem>)}</SelectContent>
                        </Select>
                      </ChildField>
                      <ChildField label={t("dailyReports.delays.responsible")}><ChildInput table="daily_report_delays" id={d.id} field="responsible_party" value={d.responsible_party} rows={delays} setRows={setDelays} /></ChildField>
                      <ChildField label={t("dailyReports.delays.impact")}><ChildInput table="daily_report_delays" id={d.id} field="impact" value={d.impact} rows={delays} setRows={setDelays} /></ChildField>
                      <ChildField label={t("dailyReports.delays.description")} full><ChildInput table="daily_report_delays" id={d.id} field="description" value={d.description} rows={delays} setRows={setDelays} textarea /></ChildField>
                      <ChildField label={t("dailyReports.delays.mitigation")} full><ChildInput table="daily_report_delays" id={d.id} field="mitigation" value={d.mitigation} rows={delays} setRows={setDelays} textarea /></ChildField>
                      <ChildField label={t("dailyReports.delays.affected")} full><ChildInput table="daily_report_delays" id={d.id} field="affected_activities" value={d.affected_activities} rows={delays} setRows={setDelays} /></ChildField>
                    </div>
                  </ChildCard>
                ))}
              </TabsContent>

              {/* VISITORS */}
              <TabsContent value="visitors" className="space-y-3">
                <div className="flex justify-end">
                  <AddButton label={t("dailyReports.visitors.add")} onClick={() => addChild<DRVisitor>("daily_report_visitors", {}, setVisitors, visitors)} />
                </div>
                {visitors.map((v) => (
                  <ChildCard key={v.id} onDelete={() => removeChild("daily_report_visitors", v.id, setVisitors, visitors)}>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      <ChildField label={t("dailyReports.visitors.name")}><ChildInput table="daily_report_visitors" id={v.id} field="name" value={v.name} rows={visitors} setRows={setVisitors} /></ChildField>
                      <ChildField label={t("dailyReports.visitors.company")}><ChildInput table="daily_report_visitors" id={v.id} field="company_name" value={v.company_name} rows={visitors} setRows={setVisitors} /></ChildField>
                      <ChildField label={t("dailyReports.visitors.purpose")}><ChildInput table="daily_report_visitors" id={v.id} field="purpose" value={v.purpose} rows={visitors} setRows={setVisitors} /></ChildField>
                      <ChildField label={t("dailyReports.visitors.arrival")}>
                        <Input type="time" value={v.arrival ?? ""} onChange={(e) => updateChildInline("daily_report_visitors", v.id, "arrival", e.target.value, visitors, setVisitors)} />
                      </ChildField>
                      <ChildField label={t("dailyReports.visitors.departure")}>
                        <Input type="time" value={v.departure ?? ""} onChange={(e) => updateChildInline("daily_report_visitors", v.id, "departure", e.target.value, visitors, setVisitors)} />
                      </ChildField>
                      <ChildField label={t("dailyReports.fields.notes")} full><ChildInput table="daily_report_visitors" id={v.id} field="notes" value={v.notes} rows={visitors} setRows={setVisitors} textarea /></ChildField>
                    </div>
                  </ChildCard>
                ))}
              </TabsContent>

              {/* PHOTOS */}
              <TabsContent value="photos" className="space-y-3">
                <PhotoManager
                  reportId={currentId}
                  ensureSaved={ensureSaved}
                  projectId={projectId}
                  photos={photos}
                  setPhotos={setPhotos}
                />
              </TabsContent>

              {/* SIGNATURES */}
              <TabsContent value="signatures" className="space-y-3">
                <SignatureManager
                  reportId={currentId}
                  ensureSaved={ensureSaved}
                  projectId={projectId}
                  signatures={signatures}
                  setSignatures={setSignatures}
                />
              </TabsContent>

              {/* ATTACHMENTS */}
              <TabsContent value="attachments" className="space-y-3">
                <AttachmentManager
                  ensureSaved={ensureSaved}
                  projectId={projectId}
                  companyId={profile?.company_id ?? null}
                  attachments={attachments}
                  setAttachments={setAttachments}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <DialogFooter className="border-t p-3">
          <ApprovalActions
            report={report as DailyReport}
            currentId={currentId}
            projectId={projectId}
            canSubmit={canSubmit}
            canApprove={canApprove}
            onChanged={async () => { if (currentId) { const r = await import("@/lib/daily-reports").then((m) => m.getReport(currentId)); setReport(r); onSaved(); } }}
          />
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("common.close")}</Button>
          <Button onClick={saveHeader} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />{t("dailyReports.ai.formulate", "Mit KI formulieren")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("dailyReports.ai.hint", "Stichpunkte eingeben — z.B. \"Decke EG betoniert, 18 Mann, 2 Kräne, Beton C30/37, keine Unfälle\". Die KI formt daraus einen strukturierten Bericht.")}
            </p>
            <Textarea rows={6} value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Kurze Stichpunkte..." />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAiOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={applyAiDraft} disabled={aiBusy || !aiInput.trim()}>
              {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {t("dailyReports.ai.generate", "Generieren & übernehmen")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function statusTone(s: string): "neutral" | "info" | "success" | "warning" | "danger" {
  return s === "approved" ? "success" : s === "rejected" ? "danger" : s === "submitted" || s === "reviewed" ? "info" : "neutral";
}

function formatWeekdayDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    const wd = d.toLocaleDateString("de-DE", { weekday: "long" });
    const dt = d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${wd}, ${dt}`;
  } catch { return iso; }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function ChildField({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={`space-y-1 ${full ? "sm:col-span-2 lg:col-span-3" : ""}`}><Label className="text-[11px] text-muted-foreground">{label}</Label>{children}</div>;
}

function NumberInput({ value, onChange }: { value: number | null | undefined; onChange: (v: number | null) => void }) {
  return <Input type="number" step="0.1" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />;
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button size="sm" variant="outline" onClick={onClick}><Plus className="h-4 w-4" />{label}</Button>;
}

function ChildCard({ children, onDelete, title }: { children: React.ReactNode; onDelete: () => void; title?: string }) {
  const { t } = useTranslation();
  return (
    <Card className="border-border/70">
      <CardContent className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{title ?? ""}</span>
          <Button size="icon" variant="ghost" onClick={onDelete} aria-label={t("common.delete")}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

// Debounced inline persist helper
async function updateChildInline<T extends { id: string }>(table: Parameters<typeof deleteChild>[0], id: string, field: string, value: unknown, rows: T[], setter: (v: T[]) => void) {
  setter(rows.map((r) => (r.id === id ? { ...r, [field]: value } as T : r)));
  const { updateChild } = await import("@/lib/daily-reports");
  await updateChild(table, id, { [field]: value }).catch(() => {});
}

function ChildInput<T extends { id: string }>({ table, id, field, value, rows, setRows, textarea }: {
  table: Parameters<typeof deleteChild>[0]; id: string; field: string; value: string | null | undefined; rows: T[]; setRows: (v: T[]) => void; textarea?: boolean;
}) {
  const [local, setLocal] = useState(value ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { setLocal(value ?? ""); }, [value]);
  const onChange = (v: string) => {
    setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => updateChildInline(table, id, field, v, rows, setRows), 600);
  };
  return textarea
    ? <Textarea rows={2} value={local} onChange={(e) => onChange(e.target.value)} />
    : <Input value={local} onChange={(e) => onChange(e.target.value)} />;
}

function ChildNumber<T extends { id: string }>({ table, id, field, value, rows, setRows }: {
  table: Parameters<typeof deleteChild>[0]; id: string; field: string; value: number | null | undefined; rows: T[]; setRows: (v: T[]) => void;
}) {
  const [local, setLocal] = useState<string>(value == null ? "" : String(value));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { setLocal(value == null ? "" : String(value)); }, [value]);
  const onChange = (v: string) => {
    setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => updateChildInline(table, id, field, v === "" ? null : Number(v), rows, setRows), 600);
  };
  return <Input type="number" step="0.1" value={local} onChange={(e) => onChange(e.target.value)} />;
}

// ---- Photos ----
function PhotoManager({ reportId, ensureSaved, projectId, photos, setPhotos }: {
  reportId: string | null; ensureSaved: () => Promise<string>; projectId: string; photos: DRPhoto[]; setPhotos: (v: DRPhoto[]) => void;
}) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile } = useProfile();

  async function onUpload(files: FileList | null) {
    if (!files || !profile?.company_id) return;
    setUploading(true);
    try {
      const id = await ensureSaved();
      const created: DRPhoto[] = [];
      for (const f of Array.from(files)) {
        const path = await uploadReportFile(profile.company_id, f);
        const row = await insertChild<DRPhoto>("daily_report_photos", { daily_report_id: id, project_id: projectId, storage_path: path, category: "general" });
        created.push(row);
      }
      setPhotos([...photos, ...created]);
      toast.success(t("common.saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.saveFailed"));
    } finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <input ref={inputRef} type="file" multiple accept="image/*" hidden onChange={(e) => onUpload(e.target.files)} />
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {t("dailyReports.photos.upload")}
        </Button>
      </div>
      {photos.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("dailyReports.photos.empty")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => <PhotoTile key={p.id} photo={p} onRemove={async () => { await deleteChild("daily_report_photos", p.id); setPhotos(photos.filter((x) => x.id !== p.id)); }} onUpdate={(patch) => setPhotos(photos.map((x) => x.id === p.id ? { ...x, ...patch } : x))} />)}
        </div>
      )}
    </div>
  );
}

function PhotoTile({ photo, onRemove, onUpdate }: { photo: DRPhoto; onRemove: () => void; onUpdate: (patch: Partial<DRPhoto>) => void }) {
  const { t } = useTranslation();
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { (async () => {
    if (!photo.storage_path) return;
    const { data } = await supabase.storage.from("daily-report-files").createSignedUrl(photo.storage_path, 3600);
    setUrl(data?.signedUrl ?? null);
  })(); }, [photo.storage_path]);
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted">
        {url ? <img src={url} alt={photo.description ?? ""} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>}
      </div>
      <CardContent className="space-y-2 p-2">
        <Select value={photo.category ?? "general"} onValueChange={async (v) => { onUpdate({ category: v }); await updateChildInline("daily_report_photos", photo.id, "category", v, [photo], () => {}); }}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{PHOTO_CATEGORIES_PRO.map((c) => <SelectItem key={c} value={c}>{t(`dailyReports.photoCategories.${c}`)}</SelectItem>)}</SelectContent>
        </Select>
        <Input className="h-8 text-xs" placeholder={t("dailyReports.photos.description")} defaultValue={photo.description ?? ""} onBlur={async (e) => { onUpdate({ description: e.target.value }); await updateChildInline("daily_report_photos", photo.id, "description", e.target.value, [photo], () => {}); }} />
        <Button size="sm" variant="ghost" className="w-full" onClick={onRemove}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
      </CardContent>
    </Card>
  );
}

// ---- Signatures ----
function SignatureManager({ reportId, ensureSaved, projectId, signatures, setSignatures }: {
  reportId: string | null; ensureSaved: () => Promise<string>; projectId: string; signatures: DRSignature[]; setSignatures: (v: DRSignature[]) => void;
}) {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState<{ role: string } | null>(null);
  const [name, setName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  function start(e: React.PointerEvent) { drawing.current = true; const c = canvasRef.current!; const rect = c.getBoundingClientRect(); const ctx = c.getContext("2d")!; ctx.beginPath(); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top); }
  function move(e: React.PointerEvent) { if (!drawing.current) return; const c = canvasRef.current!; const rect = c.getBoundingClientRect(); const ctx = c.getContext("2d")!; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#111"; ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke(); }
  function end() { drawing.current = false; }
  function clear() { const c = canvasRef.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); }

  async function save() {
    if (!dialog || !name) { toast.error(t("dailyReports.signatures.nameRequired")); return; }
    const c = canvasRef.current!;
    const data = c.toDataURL("image/png");
    const id = await ensureSaved();
    const row = await insertChild<DRSignature>("daily_report_signatures", { daily_report_id: id, project_id: projectId, role: dialog.role, signer_name: name, signature_data: data });
    setSignatures([...signatures, row]);
    setDialog(null); setName(""); clear();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SIGNATURE_ROLES.map((r) => (
          <Button key={r} size="sm" variant="outline" onClick={() => setDialog({ role: r })}>
            <Plus className="h-4 w-4" />{t(`dailyReports.signatures.roles.${r}`)}
          </Button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {signatures.map((s) => (
          <Card key={s.id}><CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{t(`dailyReports.signatures.roles.${s.role}`)}</div>
                <div className="font-semibold">{s.signer_name}</div>
                <div className="text-xs text-muted-foreground">{new Date(s.signed_at).toLocaleString()}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={async () => { await deleteChild("daily_report_signatures", s.id); setSignatures(signatures.filter((x) => x.id !== s.id)); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
            {s.signature_data && <img src={s.signature_data} alt="" className="mt-2 h-20 w-full rounded border bg-white object-contain" />}
          </CardContent></Card>
        ))}
      </div>

      <Dialog open={!!dialog} onOpenChange={(o) => { if (!o) { setDialog(null); setName(""); clear(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{dialog && t(`dailyReports.signatures.roles.${dialog.role}`)}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label={t("dailyReports.signatures.name")}><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <div className="rounded border bg-white">
              <canvas ref={canvasRef} width={480} height={160} className="h-40 w-full touch-none" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end} />
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={clear}><X className="h-4 w-4" />{t("dailyReports.signatures.clear")}</Button>
              <Button size="sm" onClick={save}><Check className="h-4 w-4" />{t("common.save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Attachments ----
function AttachmentManager({ ensureSaved, projectId, companyId, attachments, setAttachments }: {
  ensureSaved: () => Promise<string>; projectId: string; companyId: string | null; attachments: DRAttachment[]; setAttachments: (v: DRAttachment[]) => void;
}) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onUpload(files: FileList | null) {
    if (!files || !companyId) return;
    setUploading(true);
    try {
      const id = await ensureSaved();
      const created: DRAttachment[] = [];
      for (const f of Array.from(files)) {
        const path = await uploadReportFile(companyId, f);
        const row = await insertChild<DRAttachment>("daily_report_attachments", { daily_report_id: id, project_id: projectId, file_path: path, filename: f.name, mime_type: f.type, file_size: f.size });
        created.push(row);
      }
      setAttachments([...attachments, ...created]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.saveFailed"));
    } finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  }

  async function download(a: DRAttachment) {
    const { data } = await supabase.storage.from("daily-report-files").createSignedUrl(a.file_path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <input ref={inputRef} type="file" multiple hidden onChange={(e) => onUpload(e.target.files)} />
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {t("dailyReports.attachments.upload")}
        </Button>
      </div>
      {attachments.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("dailyReports.attachments.empty")}</p>
      ) : (
        <div className="divide-y rounded border">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <button onClick={() => download(a)} className="min-w-0 flex-1 truncate text-left text-sm hover:underline">{a.filename}</button>
              <span className="text-xs text-muted-foreground">{a.file_size ? `${Math.round(a.file_size / 1024)} KB` : ""}</span>
              <Button size="icon" variant="ghost" onClick={async () => { await deleteChild("daily_report_attachments", a.id); setAttachments(attachments.filter((x) => x.id !== a.id)); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Approval actions ----
function ApprovalActions({ report, currentId, projectId, canSubmit, canApprove, onChanged }: {
  report: DailyReport; currentId: string | null; projectId: string; canSubmit: boolean; canApprove: boolean; onChanged: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);

  if (!currentId) return null;

  return (
    <div className="mr-auto flex flex-wrap gap-2">
      {canSubmit && <Button size="sm" variant="outline" onClick={async () => { try { await submitReport(currentId, projectId); toast.success(t("dailyReports.approvals.submitted")); await onChanged(); } catch (e) { toast.error(e instanceof Error ? e.message : "err"); } }}><Send className="h-4 w-4" />{t("dailyReports.approvals.submit")}</Button>}
      {canApprove && <Button size="sm" onClick={async () => { try { await approveReport(currentId, projectId); toast.success(t("dailyReports.approvals.approved")); await onChanged(); } catch (e) { toast.error(e instanceof Error ? e.message : "err"); } }}><Check className="h-4 w-4" />{t("dailyReports.approvals.approve")}</Button>}
      {canApprove && <Button size="sm" variant="outline" onClick={() => setRejectOpen(true)}><X className="h-4 w-4" />{t("dailyReports.approvals.reject")}</Button>}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("dailyReports.approvals.reject")}</DialogTitle></DialogHeader>
          <Field label={t("dailyReports.approvals.reason")}><Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={async () => { try { await rejectReport(currentId, projectId, reason); toast.success(t("dailyReports.approvals.rejected")); setRejectOpen(false); setReason(""); await onChanged(); } catch (e) { toast.error(e instanceof Error ? e.message : "err"); } }}>{t("dailyReports.approvals.reject")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
