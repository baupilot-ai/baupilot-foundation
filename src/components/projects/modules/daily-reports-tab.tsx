import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2, Cloud, Users, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
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

export function DailyReportsTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DailyReport | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<DailyReport | null>(null);
  const [dateFilter, setDateFilter] = useState("");

  async function load() {
    setLoading(true);
    try { setItems(await listDailyReports(projectId)); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const filtered = dateFilter ? items.filter((i) => i.report_date === dateFilter) : items;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full sm:w-auto" />
          {dateFilter && <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>Clear</Button>}
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> New report
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
                        <span className="font-semibold">{new Date(r.report_date).toLocaleDateString()}</span>
                        {s && <StatusBadge tone={s.tone}>{s.label}</StatusBadge>}
                        {r.weather_condition && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Cloud className="h-3.5 w-3.5" />{r.weather_condition}
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
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setConfirmDel(r)}>
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
            <AlertDialogTitle>Delete daily report?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deleteDailyReport(confirmDel.id); toast.success("Deleted"); setConfirmDel(null); load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="border-dashed border-border/70 bg-muted/30">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <CalendarDays className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No daily reports yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">Log the first daily report from the site.</p>
        <Button onClick={onCreate}><Plus className="h-4 w-4" />Create report</Button>
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
    if (!form.report_date) { toast.error("Report date is required"); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateDailyReport(editing.id, form);
        toast.success("Report updated");
      } else {
        await createDailyReport({ ...form, project_id: projectId, report_date: form.report_date } as never);
        toast.success("Report created");
      }
      onOpenChange(false); onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{editing ? "Edit daily report" : "New daily report"}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Report date *"><Input type="date" required value={form.report_date ?? ""} onChange={(e) => set("report_date", e.target.value)} /></Field>
            <Field label="Site status">
              <Select value={form.site_status ?? "normal"} onValueChange={(v) => set("site_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SITE_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Weather">
              <Select value={form.weather_condition ?? ""} onValueChange={(v) => set("weather_condition", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{WEATHER_OPTIONS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Temperature (°C)"><Input type="number" value={form.temperature ?? ""} onChange={(e) => set("temperature", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Wind"><Input value={form.wind ?? ""} onChange={(e) => set("wind", e.target.value)} placeholder="Calm, light, strong…" /></Field>
            <Field label="Workers count"><Input type="number" value={form.workers_count ?? ""} onChange={(e) => set("workers_count", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Start"><Input type="time" value={form.working_hours_start ?? ""} onChange={(e) => set("working_hours_start", e.target.value)} /></Field>
            <Field label="End"><Input type="time" value={form.working_hours_end ?? ""} onChange={(e) => set("working_hours_end", e.target.value)} /></Field>
          </div>
          <Field label="Work performed"><Textarea rows={3} value={form.work_performed ?? ""} onChange={(e) => set("work_performed", e.target.value)} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Subcontractors"><Textarea rows={2} value={form.subcontractors ?? ""} onChange={(e) => set("subcontractors", e.target.value)} /></Field>
            <Field label="Equipment used"><Textarea rows={2} value={form.equipment_used ?? ""} onChange={(e) => set("equipment_used", e.target.value)} /></Field>
            <Field label="Materials delivered"><Textarea rows={2} value={form.materials_delivered ?? ""} onChange={(e) => set("materials_delivered", e.target.value)} /></Field>
            <Field label="Delays / obstructions"><Textarea rows={2} value={form.delays ?? ""} onChange={(e) => set("delays", e.target.value)} /></Field>
            <Field label="Safety notes"><Textarea rows={2} value={form.safety_notes ?? ""} onChange={(e) => set("safety_notes", e.target.value)} /></Field>
            <Field label="Visitors"><Textarea rows={2} value={form.visitors ?? ""} onChange={(e) => set("visitors", e.target.value)} /></Field>
          </div>
          <Field label="Notes"><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
