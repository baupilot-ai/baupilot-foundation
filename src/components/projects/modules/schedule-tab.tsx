import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Loader2, Calendar, User, ListChecks } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/i18n";
import {
  listScheduleActivities, createScheduleActivity, updateScheduleActivity, deleteScheduleActivity,
  SCHEDULE_STATUS, type ScheduleActivity,
} from "@/lib/planning";

type SortKey = "start" | "finish" | "number";

export function ScheduleTab({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<ScheduleActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleActivity | null>(null);
  const [confirmDel, setConfirmDel] = useState<ScheduleActivity | null>(null);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [respF, setRespF] = useState("all");
  const [sort, setSort] = useState<SortKey>("start");

  async function load() {
    setLoading(true);
    try { setItems(await listScheduleActivities(projectId)); }
    catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const responsibles = useMemo(
    () => Array.from(new Set(items.map((i) => i.responsible_person).filter(Boolean))) as string[],
    [items],
  );
  const filtered = useMemo(() => {
    let f = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter((a) => a.activity_name.toLowerCase().includes(q) || (a.activity_number ?? "").toLowerCase().includes(q));
    }
    if (statusF !== "all") f = f.filter((a) => a.status === statusF);
    if (respF !== "all") f = f.filter((a) => a.responsible_person === respF);
    f = [...f].sort((a, b) => {
      if (sort === "number") return (a.activity_number ?? "").localeCompare(b.activity_number ?? "");
      if (sort === "finish") return (a.finish_date ?? "").localeCompare(b.finish_date ?? "");
      return (a.start_date ?? "").localeCompare(b.start_date ?? "");
    });
    return f;
  }, [items, search, statusF, respF, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Input placeholder={t("planning.common.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-[200px]" />
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("planning.common.allStatus")}</SelectItem>
              {SCHEDULE_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.labelKey)}</SelectItem>)}
            </SelectContent>
          </Select>
          {responsibles.length > 0 && (
            <Select value={respF} onValueChange={setRespF}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("planning.common.allResponsible")}</SelectItem>
                {responsibles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="start">{t("planning.schedule.sort.start")}</SelectItem>
              <SelectItem value="finish">{t("planning.schedule.sort.finish")}</SelectItem>
              <SelectItem value="number">{t("planning.schedule.sort.number")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("planning.schedule.new")}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <EmptyCard onCreate={() => { setEditing(null); setOpen(true); }} label={t("planning.schedule.new")} />
      ) : (
        <div className="grid gap-3">
          {filtered.map((a) => {
            const s = SCHEDULE_STATUS.find((x) => x.value === a.status);
            return (
              <Card key={a.id} className="border-border/70">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {a.activity_number && <span className="font-mono text-xs text-muted-foreground">{a.activity_number}</span>}
                        <p className="font-semibold">{a.activity_name}</p>
                      </div>
                      {a.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {s && <StatusBadge tone={s.tone}>{t(s.labelKey)}</StatusBadge>}
                        {a.start_date && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(a.start_date)} — {a.finish_date ? formatDate(a.finish_date) : "—"}</span>}
                        {a.duration_days != null && <span>{a.duration_days}d</span>}
                        {a.responsible_person && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{a.responsible_person}</span>}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${a.progress_percent ?? 0}%` }} />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">{a.progress_percent ?? 0}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Select value={a.status} onValueChange={async (v) => {
                        try { await updateScheduleActivity(a.id, { status: v }, projectId); toast.success(t("planning.common.updated")); load(); }
                        catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
                      }}>
                        <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{SCHEDULE_STATUS.map((x) => <SelectItem key={x.value} value={x.value}>{t(x.labelKey)}</SelectItem>)}</SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setConfirmDel(a)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ActivityDialog open={open} onOpenChange={setOpen} projectId={projectId} editing={editing} onSaved={load} />
      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("planning.common.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("planning.common.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deleteScheduleActivity(confirmDel.id); toast.success(t("planning.common.deleted")); setConfirmDel(null); load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
              }}>{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyCard({ onCreate, label }: { onCreate: () => void; label: string }) {
  const { t } = useTranslation();
  return (
    <Card className="border-dashed border-border/70 bg-muted/30">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <ListChecks className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t("planning.common.empty")}</p>
        <Button onClick={onCreate}><Plus className="h-4 w-4" />{label}</Button>
      </CardContent>
    </Card>
  );
}

function ActivityDialog({
  open, onOpenChange, projectId, editing, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; projectId: string;
  editing: ScheduleActivity | null; onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<ScheduleActivity>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm(editing ?? { status: "not_started", progress_percent: 0 });
  }, [open, editing]);

  const duration = useMemo(() => {
    if (!form.start_date || !form.finish_date) return null;
    const a = new Date(form.start_date).getTime();
    const b = new Date(form.finish_date).getTime();
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    return Math.max(1, Math.round((b - a) / 86400000) + 1);
  }, [form.start_date, form.finish_date]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.activity_name?.trim()) { toast.error(t("planning.common.failed")); return; }
    setSaving(true);
    try {
      const payload = { ...form, project_id: projectId, activity_name: form.activity_name } as Parameters<typeof createScheduleActivity>[0];
      if (editing) { await updateScheduleActivity(editing.id, form, projectId); toast.success(t("planning.common.updated")); }
      else { await createScheduleActivity(payload); toast.success(t("planning.common.created")); }
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? t("planning.schedule.edit") : t("planning.schedule.new")}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.schedule.activityNumber")}</Label>
              <Input value={form.activity_number ?? ""} onChange={(e) => setForm({ ...form, activity_number: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.common.responsible")}</Label>
              <Input value={form.responsible_person ?? ""} onChange={(e) => setForm({ ...form, responsible_person: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">{t("planning.schedule.activityName")} *</Label>
            <Input required value={form.activity_name ?? ""} onChange={(e) => setForm({ ...form, activity_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">{t("planning.common.description")}</Label>
            <Textarea rows={2} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.schedule.startDate")}</Label>
              <Input type="date" value={form.start_date ?? ""} onChange={(e) => setForm({ ...form, start_date: e.target.value || null })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.schedule.finishDate")}</Label>
              <Input type="date" value={form.finish_date ?? ""} onChange={(e) => setForm({ ...form, finish_date: e.target.value || null })} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.schedule.duration")}</Label>
              <Input value={duration ?? form.duration_days ?? ""} readOnly /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.schedule.progress")}</Label>
              <Input type="number" min={0} max={100} value={form.progress_percent ?? 0} onChange={(e) => setForm({ ...form, progress_percent: Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.common.status")}</Label>
              <Select value={form.status ?? "not_started"} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SCHEDULE_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.labelKey)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
