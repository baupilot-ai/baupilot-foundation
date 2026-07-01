import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2, Cloud, Users, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  listDailyReports, createDailyReport, updateDailyReport, deleteDailyReport,
  SITE_STATUS, WEATHER_OPTIONS, type DailyReport,
} from "@/lib/site-modules";
import { formatDate } from "@/lib/i18n";

export function DailyReportsTab({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DailyReport | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<DailyReport | null>(null);
  const [dateFilter, setDateFilter] = useState("");

  async function load() {
    setLoading(true);
    try { setItems(await listDailyReports(projectId)); }
    catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const filtered = dateFilter ? items.filter((i) => i.report_date === dateFilter) : items;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full sm:w-auto" />
          {dateFilter && <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>{t("dailyReports.clearFilter")}</Button>}
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> {t("dailyReports.new")}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState onCreate={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => {
            const s = SITE_STATUS.find((x) => x.value === r.site_status);
            return (
              <Card key={r.id} className="border-border/70">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{formatDate(r.report_date)}</span>
                        {s && <StatusBadge tone={s.tone}>{t(`dailyReports.status.${s.value}`, s.label)}</StatusBadge>}
                        {r.weather_condition && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Cloud className="h-3.5 w-3.5" />{t(`dailyReports.weather.${r.weather_condition}`, r.weather_condition)}
                            {r.temperature != null && <> · {r.temperature}°</>}
                          </span>
                        )}
                        {r.workers_count != null && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />{r.workers_count}
                          </span>
                        )}
                      </div>
                      {r.work_performed && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.work_performed}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" aria-label={t("common.edit")} onClick={() => { setEditing(r); setOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" aria-label={t("common.delete")} onClick={() => setConfirmDel(r)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DailyReportDialog
        open={open}
        onOpenChange={setOpen}
        projectId={projectId}
        editing={editing}
        onSaved={load}
      />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dailyReports.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("dailyReports.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deleteDailyReport(confirmDel.id); toast.success(t("states.deleted")); setConfirmDel(null); load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
              }}
            >{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();
  return (
    <Card className="border-dashed border-border/70 bg-muted/30">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <CalendarDays className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t("dailyReports.empty")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("dailyReports.emptyDesc")}</p>
        <Button onClick={onCreate}><Plus className="h-4 w-4" />{t("dailyReports.create")}</Button>
      </CardContent>
    </Card>
  );
}

function DailyReportDialog({
  open, onOpenChange, projectId, editing, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; projectId: string;
  editing: DailyReport | null; onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<DailyReport>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editing ?? { report_date: new Date().toISOString().slice(0, 10), site_status: "normal" });
    }
  }, [open, editing]);

  function set<K extends keyof DailyReport>(k: K, v: DailyReport[K] | null) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.report_date) { toast.error(t("dailyReports.dateRequired")); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateDailyReport(editing.id, form);
        toast.success(t("dailyReports.updated"));
      } else {
        await createDailyReport({ ...form, project_id: projectId, report_date: form.report_date } as never);
        toast.success(t("dailyReports.created"));
      }
      onOpenChange(false); onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.saveFailed"));
    } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{editing ? t("dailyReports.edit") : t("dailyReports.new")}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`${t("dailyReports.fields.reportDate")} *`}><Input type="date" required value={form.report_date ?? ""} onChange={(e) => set("report_date", e.target.value)} /></Field>
            <Field label={t("dailyReports.fields.siteStatus")}>
              <Select value={form.site_status ?? "normal"} onValueChange={(v) => set("site_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SITE_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(`dailyReports.status.${s.value}`, s.label)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={t("dailyReports.fields.weather")}>
              <Select value={form.weather_condition ?? ""} onValueChange={(v) => set("weather_condition", v)}>
                <SelectTrigger><SelectValue placeholder={t("dailyReports.fields.weatherSelect")} /></SelectTrigger>
                <SelectContent>{WEATHER_OPTIONS.map((w) => <SelectItem key={w} value={w}>{t(`dailyReports.weather.${w}`, w)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={t("dailyReports.fields.temperature")}><Input type="number" value={form.temperature ?? ""} onChange={(e) => set("temperature", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label={t("dailyReports.fields.wind")}><Input value={form.wind ?? ""} onChange={(e) => set("wind", e.target.value)} placeholder={t("dailyReports.fields.windPlaceholder")} /></Field>
            <Field label={t("dailyReports.fields.workersCount")}><Input type="number" value={form.workers_count ?? ""} onChange={(e) => set("workers_count", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label={t("dailyReports.fields.start")}><Input type="time" value={form.working_hours_start ?? ""} onChange={(e) => set("working_hours_start", e.target.value)} /></Field>
            <Field label={t("dailyReports.fields.end")}><Input type="time" value={form.working_hours_end ?? ""} onChange={(e) => set("working_hours_end", e.target.value)} /></Field>
          </div>
          <Field label={t("dailyReports.fields.workPerformed")}><Textarea rows={3} value={form.work_performed ?? ""} onChange={(e) => set("work_performed", e.target.value)} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("dailyReports.fields.subcontractors")}><Textarea rows={2} value={form.subcontractors ?? ""} onChange={(e) => set("subcontractors", e.target.value)} /></Field>
            <Field label={t("dailyReports.fields.equipment")}><Textarea rows={2} value={form.equipment_used ?? ""} onChange={(e) => set("equipment_used", e.target.value)} /></Field>
            <Field label={t("dailyReports.fields.materialsDelivered")}><Textarea rows={2} value={form.materials_delivered ?? ""} onChange={(e) => set("materials_delivered", e.target.value)} /></Field>
            <Field label={t("dailyReports.fields.delays")}><Textarea rows={2} value={form.delays ?? ""} onChange={(e) => set("delays", e.target.value)} /></Field>
            <Field label={t("dailyReports.fields.safetyNotes")}><Textarea rows={2} value={form.safety_notes ?? ""} onChange={(e) => set("safety_notes", e.target.value)} /></Field>
            <Field label={t("dailyReports.fields.visitors")}><Textarea rows={2} value={form.visitors ?? ""} onChange={(e) => set("visitors", e.target.value)} /></Field>
          </div>
          <Field label={t("dailyReports.fields.notes")}><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
