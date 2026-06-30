import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Loader2, Calendar, User, Flag, CheckCircle2 } from "lucide-react";
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
  listMilestones, createMilestone, updateMilestone, deleteMilestone,
  MILESTONE_STATUS, type Milestone,
} from "@/lib/planning";

export function MilestonesTab({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [confirmDel, setConfirmDel] = useState<Milestone | null>(null);
  const [statusF, setStatusF] = useState("all");

  async function load() {
    setLoading(true);
    try { setItems(await listMilestones(projectId)); }
    catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const filtered = useMemo(
    () => (statusF === "all" ? items : items.filter((m) => m.status === statusF)),
    [items, statusF],
  );

  async function markCompleted(m: Milestone) {
    try {
      await updateMilestone(m.id, { status: "completed", actual_date: new Date().toISOString().slice(0, 10) }, projectId);
      toast.success(t("planning.common.updated"));
      load();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("planning.common.allStatus")}</SelectItem>
            {MILESTONE_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.labelKey)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("planning.milestones.new")}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Flag className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">{t("planning.common.empty")}</p>
            <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("planning.milestones.new")}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((m) => {
            const s = MILESTONE_STATUS.find((x) => x.value === m.status);
            return (
              <Card key={m.id} className="border-border/70">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <Flag className="mt-1 h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="font-semibold">{m.name}</p>
                          {m.description && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {s && <StatusBadge tone={s.tone}>{t(s.labelKey)}</StatusBadge>}
                        {m.planned_date && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(m.planned_date)}</span>}
                        {m.actual_date && <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" />{formatDate(m.actual_date)}</span>}
                        {m.responsible_person && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{m.responsible_person}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {m.status !== "completed" && (
                        <Button size="sm" variant="outline" onClick={() => markCompleted(m)}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setConfirmDel(m)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <MilestoneDialog open={open} onOpenChange={setOpen} projectId={projectId} editing={editing} onSaved={load} />
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
                try { await deleteMilestone(confirmDel.id); toast.success(t("planning.common.deleted")); setConfirmDel(null); load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
              }}>{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MilestoneDialog({
  open, onOpenChange, projectId, editing, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; projectId: string;
  editing: Milestone | null; onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<Milestone>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(editing ?? { status: "planned" }); }, [open, editing]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) { toast.error(t("planning.common.failed")); return; }
    setSaving(true);
    try {
      if (editing) { await updateMilestone(editing.id, form, projectId); toast.success(t("planning.common.updated")); }
      else { await createMilestone({ ...form, project_id: projectId, name: form.name } as Parameters<typeof createMilestone>[0]); toast.success(t("planning.common.created")); }
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? t("planning.milestones.edit") : t("planning.milestones.new")}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">{t("planning.common.name")} *</Label>
            <Input required value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">{t("planning.common.description")}</Label>
            <Textarea rows={2} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.milestones.plannedDate")}</Label>
              <Input type="date" value={form.planned_date ?? ""} onChange={(e) => setForm({ ...form, planned_date: e.target.value || null })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.milestones.actualDate")}</Label>
              <Input type="date" value={form.actual_date ?? ""} onChange={(e) => setForm({ ...form, actual_date: e.target.value || null })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.common.responsible")}</Label>
              <Input value={form.responsible_person ?? ""} onChange={(e) => setForm({ ...form, responsible_person: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.common.status")}</Label>
              <Select value={form.status ?? "planned"} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MILESTONE_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.labelKey)}</SelectItem>)}</SelectContent>
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
