import { useEffect, useState } from "react";
import { AlertOctagon, Plus, Trash2, Edit, Loader2, Calendar, User, MapPin, Image as ImageIcon } from "lucide-react";
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
  listDefects, createDefect, updateDefect, deleteDefect, uploadDefectPhoto, getDefectPhotoUrl,
  DEFECT_STATUS, PRIORITY, type Defect,
} from "@/lib/site-modules";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/i18n";

export function DefectsTab({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Defect | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Defect | null>(null);
  const [statusF, setStatusF] = useState("all");
  const [prioF, setPrioF] = useState("all");
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const data = await listDefects(projectId);
      setItems(data);
      const entries = await Promise.all(
        data.filter((d) => d.photo_url).map(async (d) => [d.id, await getDefectPhotoUrl(d.photo_url!)] as const)
      );
      setThumbs(Object.fromEntries(entries.filter(([, u]) => u)) as Record<string, string>);
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  let filtered = items;
  if (statusF !== "all") filtered = filtered.filter((t) => t.status === statusF);
  if (prioF !== "all") filtered = filtered.filter((t) => t.priority === prioF);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("defects.filters.allStatus")}</SelectItem>
              {DEFECT_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(`enums.defectStatus.${s.value}`, s.label)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={prioF} onValueChange={setPrioF}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("defects.filters.allPriority")}</SelectItem>
              {PRIORITY.map((s) => <SelectItem key={s.value} value={s.value}>{t(`enums.priority.${s.value}`, s.label)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> {t("defects.new")}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <AlertOctagon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">{t("defects.empty")}</p>
            <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("defects.log")}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((d) => {
            const s = DEFECT_STATUS.find((x) => x.value === d.status);
            const p = PRIORITY.find((x) => x.value === d.priority);
            return (
              <Card key={d.id} className="border-border/70">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {thumbs[d.id] ? (
                      <img src={thumbs[d.id]} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
                    ) : d.photo_url ? (
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-muted"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{d.title}</p>
                      {d.location && <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{d.location}</p>}
                      {d.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {s && <StatusBadge tone={s.tone}>{t(`enums.defectStatus.${s.value}`, s.label)}</StatusBadge>}
                        {p && <StatusBadge tone={p.tone}>{t(`enums.priority.${p.value}`, p.label)}</StatusBadge>}
                        {d.responsible_person && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><User className="h-3 w-3" />{d.responsible_person}</span>}
                        {d.due_date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(d.due_date)}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="icon" variant="ghost" aria-label={t("common.edit")} onClick={() => { setEditing(d); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" aria-label={t("common.delete")} onClick={() => setConfirmDel(d)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DefectDialog open={open} onOpenChange={setOpen} projectId={projectId} editing={editing} onSaved={load} />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("defects.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("defects.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deleteDefect(confirmDel.id); toast.success(t("states.deleted")); setConfirmDel(null); load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
              }}
            >{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DefectDialog({
  open, onOpenChange, projectId, editing, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; projectId: string;
  editing: Defect | null; onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<Defect>>({});
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) { setForm(editing ?? { status: "open", priority: "medium" }); setFile(null); }
  }, [open, editing]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title?.trim()) { toast.error(t("defects.titleRequired")); return; }
    setSaving(true);
    try {
      let photo_url = form.photo_url ?? null;
      if (file) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: prof } = await supabase.from("profiles").select("company_id").eq("id", user!.id).maybeSingle();
        if (!prof?.company_id) throw new Error("Company missing");
        photo_url = await uploadDefectPhoto(prof.company_id, file);
      }
      const payload = { ...form, photo_url };
      if (editing) { await updateDefect(editing.id, payload, { project_id: projectId }); toast.success(t("states.updated")); }
      else { await createDefect({ ...payload, project_id: projectId, title: form.title } as never); toast.success(t("states.created")); }
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? t("defects.edit") : t("defects.new")}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">{t("defects.fields.title")} *</Label><Input required value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">{t("defects.fields.location")}</Label><Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={t("defects.fields.locationPlaceholder")} /></div>
          <div className="space-y-1.5"><Label className="text-xs">{t("defects.fields.description")}</Label><Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs">{t("defects.fields.status")}</Label>
              <Select value={form.status ?? "open"} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DEFECT_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(`enums.defectStatus.${s.value}`, s.label)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">{t("defects.fields.priority")}</Label>
              <Select value={form.priority ?? "medium"} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITY.map((s) => <SelectItem key={s.value} value={s.value}>{t(`enums.priority.${s.value}`, s.label)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">{t("defects.fields.responsible")}</Label><Input value={form.responsible_person ?? ""} onChange={(e) => setForm({ ...form, responsible_person: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("defects.fields.dueDate")}</Label><Input type="date" value={form.due_date ?? ""} onChange={(e) => setForm({ ...form, due_date: e.target.value || null })} /></div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("defects.fields.photo")}</Label>
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
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
