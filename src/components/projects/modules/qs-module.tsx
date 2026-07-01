import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Plus, Edit, Trash2, Loader2, Copy, ClipboardList, ShieldCheck, ClipboardCheck,
  ListChecks, AlertOctagon, Handshake, Search, Calendar, MapPin, User,
  AlertTriangle, HardHat, Wrench, FileWarning, PenLine,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatDate } from "@/lib/i18n";
import * as qs from "@/lib/quality-safety";

// =========================================================
// Shared primitives
// =========================================================

export function QsStatCard({
  icon: Icon, label, value, tone = "primary",
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; tone?: "primary" | "success" | "warning" | "danger" | "info" }) {
  const toneMap: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning-foreground bg-warning/15",
    danger: "text-destructive bg-destructive/10",
    info: "text-info bg-info/10",
  };
  return (
    <Card className="border-border/70">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function useAsyncList<T>(fn: () => Promise<T[]>, deps: unknown[]) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const reload = async () => {
    setLoading(true);
    try { setItems(await fn()); }
    catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, deps);
  return { items, loading, reload, setItems };
}

function EmptyState({ icon: Icon, title, cta }: { icon: React.ComponentType<{ className?: string }>; title: string; cta?: ReactNode }) {
  return (
    <Card className="border-dashed border-border/70 bg-muted/30">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <Icon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{title}</p>
        {cta}
      </CardContent>
    </Card>
  );
}

function DeleteConfirm<T extends { id: string }>({
  row, onCancel, onConfirm, titleKey = "common.deleteConfirm", descKey = "common.deleteConfirmDesc",
}: { row: T | null; onCancel: () => void; onConfirm: (row: T) => Promise<void> | void; titleKey?: string; descKey?: string }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  return (
    <AlertDialog open={!!row} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(titleKey)}</AlertDialogTitle>
          <AlertDialogDescription>{t(descKey)}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={busy}
            onClick={async () => {
              if (!row) return;
              setBusy(true);
              try { await onConfirm(row); onCancel(); }
              finally { setBusy(false); }
            }}
          >{t("common.delete")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EnumSelect({
  value, onChange, options, i18nBase, className,
}: { value: string; onChange: (v: string) => void; options: { value: string }[]; i18nBase: string; className?: string }) {
  const { t } = useTranslation();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{t(`${i18nBase}.${o.value}`)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

// =========================================================
// Checklists
// =========================================================

export function ChecklistsTab({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const { items, loading, reload } = useAsyncList(() => qs.listChecklists(projectId), [projectId]);
  const [editing, setEditing] = useState<qs.QChecklist | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetail, setOpenDetail] = useState<qs.QChecklist | null>(null);
  const [del, setDel] = useState<qs.QChecklist | null>(null);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");

  const filtered = items.filter((r) =>
    (statusF === "all" || r.status === statusF) &&
    (!search || r.title.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder={t("common.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("qs.filters.allStatus")}</SelectItem>
              {qs.CHECKLIST_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(`qs.enums.checklistStatus.${s.value}`)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setOpenForm(true); }}><Plus className="h-4 w-4" />{t("qs.checklists.new")}</Button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> :
        filtered.length === 0 ? <EmptyState icon={ClipboardList} title={t("qs.checklists.empty")} /> :
        <div className="grid gap-3">
          {filtered.map((r) => (
            <Card key={r.id} className="border-border/70 cursor-pointer transition hover:border-primary/50" onClick={() => setOpenDetail(r)}>
              <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{r.title}</p>
                  {r.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge tone={qs.toneOf(qs.CHECKLIST_STATUS, r.status)}>{t(`qs.enums.checklistStatus.${r.status}`)}</StatusBadge>
                    <StatusBadge tone="info">{t(`qs.enums.checklistType.${r.checklist_type}`, { defaultValue: r.checklist_type })}</StatusBadge>
                    {r.due_date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(r.due_date)}</span>}
                  </div>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button size="icon" variant="ghost" onClick={async () => { await qs.duplicateChecklist(r.id); toast.success(t("states.duplicated")); reload(); }}><Copy className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpenForm(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDel(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>}

      <ChecklistDialog open={openForm} onOpenChange={setOpenForm} projectId={projectId} editing={editing} onSaved={reload} />
      <ChecklistDetailDialog checklist={openDetail} onOpenChange={(o) => !o && setOpenDetail(null)} projectId={projectId} onChanged={reload} />
      <DeleteConfirm row={del} onCancel={() => setDel(null)} onConfirm={async (r) => { await qs.deleteChecklist(r.id); toast.success(t("states.deleted")); reload(); }} />
    </div>
  );
}

function ChecklistDialog({
  open, onOpenChange, projectId, editing, onSaved,
}: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string; editing: qs.QChecklist | null; onSaved: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<qs.QChecklist>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(editing ?? { status: "draft", checklist_type: "quality" }); }, [open, editing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title?.trim()) { toast.error(t("qs.checklists.titleRequired")); return; }
    setSaving(true);
    try {
      if (editing) await qs.updateChecklist(editing.id, form);
      else await qs.createChecklist({ ...form, project_id: projectId, title: form.title } as never);
      toast.success(t(editing ? "states.updated" : "states.created"));
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? t("qs.checklists.edit") : t("qs.checklists.new")}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.title")} *</Label><Input required value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.description")}</Label><Textarea rows={2} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.type")}</Label>
              <EnumSelect value={form.checklist_type ?? "quality"} onChange={(v) => setForm({ ...form, checklist_type: v })} options={qs.CHECKLIST_TYPES.map((v) => ({ value: v }))} i18nBase="qs.enums.checklistType" />
            </div>
            <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.status")}</Label>
              <EnumSelect value={form.status ?? "draft"} onChange={(v) => setForm({ ...form, status: v })} options={qs.CHECKLIST_STATUS} i18nBase="qs.enums.checklistStatus" />
            </div>
            <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.dueDate")}</Label><Input type="date" value={form.due_date ?? ""} onChange={(e) => setForm({ ...form, due_date: e.target.value || null })} /></div>
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

function ChecklistDetailDialog({
  checklist, onOpenChange, projectId, onChanged,
}: { checklist: qs.QChecklist | null; onOpenChange: (o: boolean) => void; projectId: string; onChanged: () => void }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<qs.QChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  async function load() {
    if (!checklist) return;
    setLoading(true);
    try { setItems(await qs.listChecklistItems(checklist.id)); } finally { setLoading(false); }
  }
  useEffect(() => { if (checklist) load(); else setItems([]); /* eslint-disable-next-line */ }, [checklist?.id]);

  async function addItem() {
    if (!checklist || !newTitle.trim()) return;
    try {
      await qs.createChecklistItem({ project_id: projectId, checklist_id: checklist.id, title: newTitle.trim() } as never);
      setNewTitle(""); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
  }
  async function setResult(item: qs.QChecklistItem, result: string) {
    try { await qs.updateChecklistItem(item.id, { result }); load(); onChanged(); }
    catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
  }
  async function removeItem(id: string) {
    try { await qs.deleteChecklistItem(id); load(); } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
  }

  return (
    <Dialog open={!!checklist} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{checklist?.title}</DialogTitle></DialogHeader>
        {checklist && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={qs.toneOf(qs.CHECKLIST_STATUS, checklist.status)}>{t(`qs.enums.checklistStatus.${checklist.status}`)}</StatusBadge>
              <StatusBadge tone="info">{t(`qs.enums.checklistType.${checklist.checklist_type}`, { defaultValue: checklist.checklist_type })}</StatusBadge>
            </div>
            <div className="flex gap-2">
              <Input placeholder={t("qs.checklists.addItemPlaceholder")} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())} />
              <Button type="button" onClick={addItem}><Plus className="h-4 w-4" />{t("qs.checklists.addItem")}</Button>
            </div>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("qs.checklists.noItems")}</p>
            ) : (
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex flex-col gap-2 rounded-lg border border-border/70 p-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{it.title}</p>
                      {it.comment && <p className="text-xs text-muted-foreground">{it.comment}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={qs.toneOf(qs.CHECKLIST_ITEM_RESULT, it.result)}>{t(`qs.enums.itemResult.${it.result}`)}</StatusBadge>
                      <EnumSelect value={it.result} onChange={(v) => setResult(it, v)} options={qs.CHECKLIST_ITEM_RESULT} i18nBase="qs.enums.itemResult" className="h-8 w-[140px] text-xs" />
                      <Button size="icon" variant="ghost" onClick={() => removeItem(it.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =========================================================
// Generic simple entity tab (list + create/edit dialog)
// =========================================================

type FieldDef = {
  key: string; label: string; type?: "text" | "textarea" | "date" | "time" | "number" | "enum";
  enumOptions?: { value: string }[]; enumI18n?: string; required?: boolean; placeholder?: string;
};

type EntityConfig<T extends { id: string; status?: string | null; title?: string | null }> = {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  newKey: string;
  emptyKey: string;
  list: (pid: string) => Promise<T[]>;
  create: (input: Record<string, unknown>) => Promise<T>;
  update: (id: string, patch: Record<string, unknown>) => Promise<T>;
  del: (id: string) => Promise<void>;
  statusOptions?: { value: string }[];
  statusI18n?: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  card: (r: T, t: (k: string, o?: Record<string, unknown>) => string) => ReactNode;
};

function GenericEntityTab<T extends { id: string; status?: string | null; title?: string | null }>({
  projectId, cfg,
}: { projectId: string; cfg: EntityConfig<T> }) {
  const { t } = useTranslation();
  const { items, loading, reload } = useAsyncList(() => cfg.list(projectId), [projectId]);
  const [editing, setEditing] = useState<T | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [del, setDel] = useState<T | null>(null);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");

  const filtered = items.filter((r) =>
    (statusF === "all" || r.status === statusF) &&
    (!search || (r.title ?? "").toString().toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder={t("common.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {cfg.statusOptions && cfg.statusI18n && (
            <Select value={statusF} onValueChange={setStatusF}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("qs.filters.allStatus")}</SelectItem>
                {cfg.statusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{t(`${cfg.statusI18n}.${s.value}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button onClick={() => { setEditing(null); setOpenForm(true); }}><Plus className="h-4 w-4" />{t(cfg.newKey)}</Button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> :
        filtered.length === 0 ? <EmptyState icon={cfg.icon} title={t(cfg.emptyKey)} /> :
        <div className="grid gap-3">
          {filtered.map((r) => (
            <Card key={r.id} className="border-border/70">
              <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">{cfg.card(r, t)}</div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpenForm(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDel(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>}

      <EntityFormDialog<T> open={openForm} onOpenChange={setOpenForm} projectId={projectId} editing={editing} cfg={cfg} onSaved={reload} />
      <DeleteConfirm row={del} onCancel={() => setDel(null)} onConfirm={async (r) => { await cfg.del(r.id); toast.success(t("states.deleted")); reload(); }} />
    </div>
  );
}

function EntityFormDialog<T extends { id: string }>({
  open, onOpenChange, projectId, editing, cfg, onSaved,
}: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string; editing: T | null; cfg: EntityConfig<T>; onSaved: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm(editing ? { ...(editing as unknown as Record<string, unknown>) } : { ...cfg.defaults });
  }, [open, editing, cfg.defaults]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    for (const f of cfg.fields) {
      if (f.required && !String(form[f.key] ?? "").trim()) {
        toast.error(t("qs.validation.required", { field: t(f.label) }));
        return;
      }
    }
    setSaving(true);
    try {
      if (editing) await cfg.update(editing.id, form);
      else await cfg.create({ ...form, project_id: projectId });
      toast.success(t(editing ? "states.updated" : "states.created"));
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? t("common.edit") : t(cfg.newKey)}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {cfg.fields.map((f) => {
              const val = form[f.key];
              const setVal = (v: unknown) => setForm({ ...form, [f.key]: v });
              const span = f.type === "textarea" ? "sm:col-span-2" : "";
              return (
                <div key={f.key} className={`space-y-1.5 ${span}`}>
                  <Label className="text-xs">{t(f.label)}{f.required && " *"}</Label>
                  {f.type === "textarea" ? (
                    <Textarea rows={3} value={(val as string) ?? ""} onChange={(e) => setVal(e.target.value)} placeholder={f.placeholder} />
                  ) : f.type === "date" ? (
                    <Input type="date" value={(val as string) ?? ""} onChange={(e) => setVal(e.target.value || null)} />
                  ) : f.type === "time" ? (
                    <Input type="time" value={(val as string) ?? ""} onChange={(e) => setVal(e.target.value || null)} />
                  ) : f.type === "number" ? (
                    <Input type="number" value={(val as number | string) ?? ""} onChange={(e) => setVal(e.target.value === "" ? null : Number(e.target.value))} />
                  ) : f.type === "enum" && f.enumOptions && f.enumI18n ? (
                    <EnumSelect value={(val as string) ?? f.enumOptions[0].value} onChange={setVal} options={f.enumOptions} i18nBase={f.enumI18n} />
                  ) : (
                    <Input value={(val as string) ?? ""} onChange={(e) => setVal(e.target.value)} placeholder={f.placeholder} />
                  )}
                </div>
              );
            })}
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

// =========================================================
// Tab configurations
// =========================================================

function RowMeta({ children }: { children: ReactNode }) {
  return <div className="mt-2 flex flex-wrap items-center gap-2">{children}</div>;
}

// ---- Inspections
export function InspectionsTab({ projectId }: { projectId: string }) {
  const cfg: EntityConfig<qs.QInspection> = useMemo(() => ({
    icon: ClipboardCheck,
    titleKey: "qs.inspections.title",
    newKey: "qs.inspections.new",
    emptyKey: "qs.inspections.empty",
    list: qs.listInspections, create: qs.createInspection as never, update: qs.updateInspection as never, del: qs.deleteInspection,
    statusOptions: qs.INSPECTION_STATUS, statusI18n: "qs.enums.inspectionStatus",
    defaults: { status: "scheduled", inspection_type: "quality" },
    fields: [
      { key: "title", label: "qs.fields.title", required: true },
      { key: "inspection_number", label: "qs.fields.number" },
      { key: "inspection_type", label: "qs.fields.type", type: "enum", enumOptions: qs.INSPECTION_TYPES.map((v) => ({ value: v })), enumI18n: "qs.enums.inspectionType" },
      { key: "status", label: "qs.fields.status", type: "enum", enumOptions: qs.INSPECTION_STATUS, enumI18n: "qs.enums.inspectionStatus" },
      { key: "result", label: "qs.fields.result", type: "enum", enumOptions: qs.INSPECTION_RESULT, enumI18n: "qs.enums.inspectionResult" },
      { key: "inspection_date", label: "qs.fields.date", type: "date" },
      { key: "inspector", label: "qs.fields.inspector" },
      { key: "location", label: "qs.fields.location" },
      { key: "description", label: "qs.fields.description", type: "textarea" },
      { key: "notes", label: "qs.fields.notes", type: "textarea" },
    ],
    card: (r, t) => (
      <>
        <p className="font-semibold">{r.title}</p>
        {r.inspection_number && <p className="text-xs text-muted-foreground">#{r.inspection_number}</p>}
        <RowMeta>
          <StatusBadge tone={qs.toneOf(qs.INSPECTION_STATUS, r.status)}>{t(`qs.enums.inspectionStatus.${r.status}`)}</StatusBadge>
          {r.result && <StatusBadge tone={qs.toneOf(qs.INSPECTION_RESULT, r.result)}>{t(`qs.enums.inspectionResult.${r.result}`)}</StatusBadge>}
          <StatusBadge tone="info">{t(`qs.enums.inspectionType.${r.inspection_type}`, { defaultValue: r.inspection_type })}</StatusBadge>
          {r.inspection_date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(r.inspection_date)}</span>}
          {r.inspector && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><User className="h-3 w-3" />{r.inspector}</span>}
          {r.location && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{r.location}</span>}
        </RowMeta>
      </>
    ),
  }), []);
  return <GenericEntityTab<qs.QInspection> projectId={projectId} cfg={cfg} />;
}

// ---- Acceptances
export function AcceptancesTab({ projectId }: { projectId: string }) {
  const cfg: EntityConfig<qs.AcceptanceRecord> = useMemo(() => ({
    icon: Handshake, titleKey: "qs.acceptances.title", newKey: "qs.acceptances.new", emptyKey: "qs.acceptances.empty",
    list: qs.listAcceptances, create: qs.createAcceptance as never, update: qs.updateAcceptance as never, del: qs.deleteAcceptance,
    statusOptions: qs.ACCEPTANCE_STATUS, statusI18n: "qs.enums.acceptanceStatus",
    defaults: { status: "draft", acceptance_type: "custom" },
    fields: [
      { key: "title", label: "qs.fields.title", required: true },
      { key: "acceptance_number", label: "qs.fields.number" },
      { key: "acceptance_type", label: "qs.fields.type", type: "enum", enumOptions: qs.ACCEPTANCE_TYPES.map((v) => ({ value: v })), enumI18n: "qs.enums.acceptanceType" },
      { key: "status", label: "qs.fields.status", type: "enum", enumOptions: qs.ACCEPTANCE_STATUS, enumI18n: "qs.enums.acceptanceStatus" },
      { key: "acceptance_date", label: "qs.fields.date", type: "date" },
      { key: "location", label: "qs.fields.location" },
      { key: "contractor", label: "qs.fields.contractor" },
      { key: "client_contact", label: "qs.fields.clientContact" },
      { key: "description", label: "qs.fields.description", type: "textarea" },
      { key: "notes", label: "qs.fields.notes", type: "textarea" },
    ],
    card: (r, t) => (
      <>
        <p className="font-semibold">{r.title}</p>
        {r.acceptance_number && <p className="text-xs text-muted-foreground">#{r.acceptance_number}</p>}
        <RowMeta>
          <StatusBadge tone={qs.toneOf(qs.ACCEPTANCE_STATUS, r.status)}>{t(`qs.enums.acceptanceStatus.${r.status}`)}</StatusBadge>
          <StatusBadge tone="info">{t(`qs.enums.acceptanceType.${r.acceptance_type}`, { defaultValue: r.acceptance_type })}</StatusBadge>
          {r.acceptance_date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(r.acceptance_date)}</span>}
          {r.contractor && <span className="text-xs text-muted-foreground">{r.contractor}</span>}
        </RowMeta>
      </>
    ),
  }), []);
  return <GenericEntityTab<qs.AcceptanceRecord> projectId={projectId} cfg={cfg} />;
}

// ---- NCR
export function NcrTab({ projectId }: { projectId: string }) {
  const cfg: EntityConfig<qs.NcrReport> = useMemo(() => ({
    icon: FileWarning, titleKey: "qs.ncr.title", newKey: "qs.ncr.new", emptyKey: "qs.ncr.empty",
    list: qs.listNcrs, create: qs.createNcr as never, update: qs.updateNcr as never, del: qs.deleteNcr,
    statusOptions: qs.NCR_STATUS, statusI18n: "qs.enums.ncrStatus",
    defaults: { status: "draft", priority: "medium" },
    fields: [
      { key: "title", label: "qs.fields.title", required: true },
      { key: "ncr_number", label: "qs.fields.number" },
      { key: "status", label: "qs.fields.status", type: "enum", enumOptions: qs.NCR_STATUS, enumI18n: "qs.enums.ncrStatus" },
      { key: "priority", label: "qs.fields.priority", type: "enum", enumOptions: qs.PRIORITY_OPTS, enumI18n: "qs.enums.priority" },
      { key: "location", label: "qs.fields.location" },
      { key: "responsible_person", label: "qs.fields.responsible" },
      { key: "due_date", label: "qs.fields.dueDate", type: "date" },
      { key: "description", label: "qs.fields.description", type: "textarea" },
      { key: "root_cause", label: "qs.fields.rootCause", type: "textarea" },
      { key: "corrective_action", label: "qs.fields.correctiveAction", type: "textarea" },
      { key: "preventive_action", label: "qs.fields.preventiveAction", type: "textarea" },
    ],
    card: (r, t) => (
      <>
        <p className="font-semibold">{r.title}</p>
        {r.ncr_number && <p className="text-xs text-muted-foreground">#{r.ncr_number}</p>}
        <RowMeta>
          <StatusBadge tone={qs.toneOf(qs.NCR_STATUS, r.status)}>{t(`qs.enums.ncrStatus.${r.status}`)}</StatusBadge>
          <StatusBadge tone={qs.toneOf(qs.PRIORITY_OPTS, r.priority)}>{t(`qs.enums.priority.${r.priority}`)}</StatusBadge>
          {r.due_date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(r.due_date)}</span>}
          {r.responsible_person && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><User className="h-3 w-3" />{r.responsible_person}</span>}
        </RowMeta>
      </>
    ),
  }), []);
  return <GenericEntityTab<qs.NcrReport> projectId={projectId} cfg={cfg} />;
}

// ---- Punch Lists (items rendered flat across project)
export function PunchListTab({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [lists, setLists] = useState<qs.PunchList[]>([]);
  const [items, setItems] = useState<qs.PunchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openList, setOpenList] = useState(false);
  const [openItem, setOpenItem] = useState(false);
  const [editingItem, setEditingItem] = useState<qs.PunchListItem | null>(null);
  const [delItem, setDelItem] = useState<qs.PunchListItem | null>(null);
  const [statusF, setStatusF] = useState("all");
  const [prioF, setPrioF] = useState("all");
  const [search, setSearch] = useState("");

  async function reload() {
    setLoading(true);
    try {
      const [ls, its] = await Promise.all([qs.listPunchLists(projectId), qs.listPunchItems(undefined, projectId)]);
      setLists(ls); setItems(its);
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setLoading(false); }
  }
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [projectId]);

  const filtered = items.filter((r) =>
    (statusF === "all" || r.status === statusF) &&
    (prioF === "all" || r.priority === prioF) &&
    (!search || r.title.toLowerCase().includes(search.toLowerCase())),
  );

  const defaultListId = lists[0]?.id;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder={t("common.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("qs.filters.allStatus")}</SelectItem>
              {qs.PUNCH_ITEM_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(`qs.enums.punchStatus.${s.value}`)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={prioF} onValueChange={setPrioF}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("qs.filters.allPriority")}</SelectItem>
              {qs.PRIORITY_OPTS.map((s) => <SelectItem key={s.value} value={s.value}>{t(`qs.enums.priority.${s.value}`)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenList(true)}><Plus className="h-4 w-4" />{t("qs.punch.newList")}</Button>
          <Button onClick={() => { setEditingItem(null); setOpenItem(true); }} disabled={!defaultListId}><Plus className="h-4 w-4" />{t("qs.punch.newItem")}</Button>
        </div>
      </div>

      {!defaultListId && !loading && (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <ListChecks className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm">{t("qs.punch.needList")}</p>
            <Button onClick={() => setOpenList(true)}><Plus className="h-4 w-4" />{t("qs.punch.newList")}</Button>
          </CardContent>
        </Card>
      )}

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> :
        defaultListId && filtered.length === 0 ? <EmptyState icon={ListChecks} title={t("qs.punch.emptyItems")} /> :
        <div className="grid gap-3">
          {filtered.map((r) => {
            const list = lists.find((l) => l.id === r.punch_list_id);
            return (
              <Card key={r.id} className="border-border/70">
                <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{r.title}</p>
                    {list && <p className="text-xs text-muted-foreground">{list.title}</p>}
                    {r.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>}
                    <RowMeta>
                      <StatusBadge tone={qs.toneOf(qs.PUNCH_ITEM_STATUS, r.status)}>{t(`qs.enums.punchStatus.${r.status}`)}</StatusBadge>
                      <StatusBadge tone={qs.toneOf(qs.PRIORITY_OPTS, r.priority)}>{t(`qs.enums.priority.${r.priority}`)}</StatusBadge>
                      {r.due_date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(r.due_date)}</span>}
                      {r.responsible_person && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><User className="h-3 w-3" />{r.responsible_person}</span>}
                      {r.location && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{r.location}</span>}
                    </RowMeta>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditingItem(r); setOpenItem(true); }}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDelItem(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>}

      {/* Create punch list dialog */}
      <PunchListCreateDialog open={openList} onOpenChange={setOpenList} projectId={projectId} onSaved={reload} />

      {/* Punch item form */}
      <PunchItemDialog
        open={openItem} onOpenChange={setOpenItem} projectId={projectId} editing={editingItem}
        lists={lists} defaultListId={defaultListId ?? ""} onSaved={reload}
      />

      <DeleteConfirm row={delItem} onCancel={() => setDelItem(null)} onConfirm={async (r) => { await qs.deletePunchItem(r.id); toast.success(t("states.deleted")); reload(); }} />
    </div>
  );
}

function PunchListCreateDialog({
  open, onOpenChange, projectId, onSaved,
}: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string; onSaved: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState<{ title: string; description?: string; location?: string }>({ title: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm({ title: "" }); }, [open]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error(t("qs.validation.required", { field: t("qs.fields.title") })); return; }
    setSaving(true);
    try {
      await qs.createPunchList({ ...form, project_id: projectId } as never);
      toast.success(t("states.created")); onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setSaving(false); }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{t("qs.punch.newList")}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.title")} *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.location")}</Label><Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.description")}</Label><Textarea rows={2} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PunchItemDialog({
  open, onOpenChange, projectId, editing, lists, defaultListId, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; projectId: string; editing: qs.PunchListItem | null;
  lists: qs.PunchList[]; defaultListId: string; onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<qs.PunchListItem>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm(editing ?? { status: "open", priority: "medium", punch_list_id: defaultListId } as never);
  }, [open, editing, defaultListId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title?.trim()) { toast.error(t("qs.validation.required", { field: t("qs.fields.title") })); return; }
    if (!form.punch_list_id) { toast.error(t("qs.punch.needList")); return; }
    setSaving(true);
    try {
      if (editing) await qs.updatePunchItem(editing.id, form);
      else await qs.createPunchItem({ ...form, project_id: projectId, title: form.title, punch_list_id: form.punch_list_id } as never);
      toast.success(t(editing ? "states.updated" : "states.created"));
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setSaving(false); }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? t("common.edit") : t("qs.punch.newItem")}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5"><Label className="text-xs">{t("qs.fields.title")} *</Label><Input required value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("qs.punch.list")}</Label>
              <Select value={form.punch_list_id ?? ""} onValueChange={(v) => setForm({ ...form, punch_list_id: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{lists.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.status")}</Label>
              <EnumSelect value={form.status ?? "open"} onChange={(v) => setForm({ ...form, status: v })} options={qs.PUNCH_ITEM_STATUS} i18nBase="qs.enums.punchStatus" />
            </div>
            <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.priority")}</Label>
              <EnumSelect value={form.priority ?? "medium"} onChange={(v) => setForm({ ...form, priority: v })} options={qs.PRIORITY_OPTS} i18nBase="qs.enums.priority" />
            </div>
            <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.location")}</Label><Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.responsible")}</Label><Input value={form.responsible_person ?? ""} onChange={(e) => setForm({ ...form, responsible_person: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("qs.fields.dueDate")}</Label><Input type="date" value={form.due_date ?? ""} onChange={(e) => setForm({ ...form, due_date: e.target.value || null })} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label className="text-xs">{t("qs.fields.description")}</Label><Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label className="text-xs">{t("qs.fields.comment")}</Label><Textarea rows={2} value={form.comment ?? ""} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></div>
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

// ---- Safety Inspections
export function SafetyInspectionsTab({ projectId }: { projectId: string }) {
  const cfg: EntityConfig<qs.SafetyInspection> = useMemo(() => ({
    icon: ShieldCheck, titleKey: "qs.safetyInspections.title", newKey: "qs.safetyInspections.new", emptyKey: "qs.safetyInspections.empty",
    list: qs.listSafetyInspections, create: qs.createSafetyInspection as never, update: qs.updateSafetyInspection as never, del: qs.deleteSafetyInspection,
    statusOptions: qs.INSPECTION_STATUS, statusI18n: "qs.enums.inspectionStatus",
    defaults: { status: "scheduled" },
    fields: [
      { key: "title", label: "qs.fields.title", required: true },
      { key: "inspection_number", label: "qs.fields.number" },
      { key: "status", label: "qs.fields.status", type: "enum", enumOptions: qs.INSPECTION_STATUS, enumI18n: "qs.enums.inspectionStatus" },
      { key: "result", label: "qs.fields.result", type: "enum", enumOptions: qs.INSPECTION_RESULT, enumI18n: "qs.enums.inspectionResult" },
      { key: "inspection_date", label: "qs.fields.date", type: "date" },
      { key: "inspector", label: "qs.fields.inspector" },
      { key: "location", label: "qs.fields.location" },
      { key: "description", label: "qs.fields.description", type: "textarea" },
      { key: "notes", label: "qs.fields.notes", type: "textarea" },
    ],
    card: (r, t) => (
      <>
        <p className="font-semibold">{r.title}</p>
        <RowMeta>
          <StatusBadge tone={qs.toneOf(qs.INSPECTION_STATUS, r.status)}>{t(`qs.enums.inspectionStatus.${r.status}`)}</StatusBadge>
          {r.result && <StatusBadge tone={qs.toneOf(qs.INSPECTION_RESULT, r.result)}>{t(`qs.enums.inspectionResult.${r.result}`)}</StatusBadge>}
          {r.inspection_date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(r.inspection_date)}</span>}
          {r.inspector && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><User className="h-3 w-3" />{r.inspector}</span>}
        </RowMeta>
      </>
    ),
  }), []);
  return <GenericEntityTab<qs.SafetyInspection> projectId={projectId} cfg={cfg} />;
}

// ---- Toolbox Talks
export function ToolboxTalksTab({ projectId }: { projectId: string }) {
  const cfg: EntityConfig<qs.ToolboxTalk> = useMemo(() => ({
    icon: HardHat, titleKey: "qs.toolbox.title", newKey: "qs.toolbox.new", emptyKey: "qs.toolbox.empty",
    list: qs.listToolboxTalks, create: qs.createToolboxTalk as never, update: qs.updateToolboxTalk as never, del: qs.deleteToolboxTalk,
    defaults: {},
    fields: [
      { key: "title", label: "qs.fields.title", required: true },
      { key: "topic", label: "qs.fields.topic", type: "enum", enumOptions: qs.TOOLBOX_TOPICS.map((v) => ({ value: v })), enumI18n: "qs.enums.toolboxTopic" },
      { key: "date", label: "qs.fields.date", type: "date" },
      { key: "trainer", label: "qs.fields.trainer" },
      { key: "participants_count", label: "qs.fields.participants", type: "number" },
      { key: "notes", label: "qs.fields.notes", type: "textarea" },
    ],
    card: (r, t) => (
      <>
        <p className="font-semibold">{r.title}</p>
        <RowMeta>
          {r.topic && <StatusBadge tone="info">{t(`qs.enums.toolboxTopic.${r.topic}`, { defaultValue: r.topic })}</StatusBadge>}
          {r.date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(r.date)}</span>}
          {r.trainer && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><User className="h-3 w-3" />{r.trainer}</span>}
          {r.participants_count != null && <span className="text-xs text-muted-foreground">{t("qs.fields.participants")}: {r.participants_count}</span>}
        </RowMeta>
      </>
    ),
  }), []);
  return <GenericEntityTab<qs.ToolboxTalk> projectId={projectId} cfg={cfg} />;
}

// ---- Safety Observations
export function SafetyObservationsTab({ projectId }: { projectId: string }) {
  const cfg: EntityConfig<qs.SafetyObservation> = useMemo(() => ({
    icon: AlertTriangle, titleKey: "qs.observations.title", newKey: "qs.observations.new", emptyKey: "qs.observations.empty",
    list: qs.listObservations, create: qs.createObservation as never, update: qs.updateObservation as never, del: qs.deleteObservation,
    statusOptions: qs.OBSERVATION_STATUS, statusI18n: "qs.enums.observationStatus",
    defaults: { status: "open", severity: "medium", observation_type: "unsafe_condition" },
    fields: [
      { key: "title", label: "qs.fields.title", required: true },
      { key: "observation_type", label: "qs.fields.type", type: "enum", enumOptions: qs.OBSERVATION_TYPES.map((v) => ({ value: v })), enumI18n: "qs.enums.observationType" },
      { key: "severity", label: "qs.fields.severity", type: "enum", enumOptions: qs.SEVERITY_OPTS, enumI18n: "qs.enums.severity" },
      { key: "status", label: "qs.fields.status", type: "enum", enumOptions: qs.OBSERVATION_STATUS, enumI18n: "qs.enums.observationStatus" },
      { key: "location", label: "qs.fields.location" },
      { key: "responsible_person", label: "qs.fields.responsible" },
      { key: "due_date", label: "qs.fields.dueDate", type: "date" },
      { key: "description", label: "qs.fields.description", type: "textarea" },
    ],
    card: (r, t) => (
      <>
        <p className="font-semibold">{r.title}</p>
        <RowMeta>
          <StatusBadge tone={qs.toneOf(qs.OBSERVATION_STATUS, r.status)}>{t(`qs.enums.observationStatus.${r.status}`)}</StatusBadge>
          <StatusBadge tone={qs.toneOf(qs.SEVERITY_OPTS, r.severity)}>{t(`qs.enums.severity.${r.severity}`)}</StatusBadge>
          <StatusBadge tone="info">{t(`qs.enums.observationType.${r.observation_type}`, { defaultValue: r.observation_type })}</StatusBadge>
          {r.location && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{r.location}</span>}
        </RowMeta>
      </>
    ),
  }), []);
  return <GenericEntityTab<qs.SafetyObservation> projectId={projectId} cfg={cfg} />;
}

// ---- Accident Reports
export function AccidentReportsTab({ projectId }: { projectId: string }) {
  const cfg: EntityConfig<qs.AccidentReport> = useMemo(() => ({
    icon: AlertOctagon, titleKey: "qs.accidents.title", newKey: "qs.accidents.new", emptyKey: "qs.accidents.empty",
    list: qs.listAccidents, create: qs.createAccident as never, update: qs.updateAccident as never, del: qs.deleteAccident,
    statusOptions: qs.ACCIDENT_STATUS, statusI18n: "qs.enums.accidentStatus",
    defaults: { status: "draft", severity: "minor" },
    fields: [
      { key: "accident_number", label: "qs.fields.number" },
      { key: "status", label: "qs.fields.status", type: "enum", enumOptions: qs.ACCIDENT_STATUS, enumI18n: "qs.enums.accidentStatus" },
      { key: "severity", label: "qs.fields.severity", type: "enum", enumOptions: qs.ACCIDENT_SEVERITY, enumI18n: "qs.enums.accidentSeverity" },
      { key: "accident_date", label: "qs.fields.date", type: "date" },
      { key: "accident_time", label: "qs.fields.time", type: "time" },
      { key: "location", label: "qs.fields.location" },
      { key: "injured_person", label: "qs.fields.injuredPerson" },
      { key: "witnesses", label: "qs.fields.witnesses" },
      { key: "description", label: "qs.fields.description", type: "textarea" },
      { key: "immediate_action", label: "qs.fields.immediateAction", type: "textarea" },
      { key: "corrective_action", label: "qs.fields.correctiveAction", type: "textarea" },
    ],
    card: (r, t) => (
      <>
        <p className="font-semibold">{r.accident_number ? `#${r.accident_number}` : t("qs.accidents.title")}{r.location ? ` — ${r.location}` : ""}</p>
        {r.injured_person && <p className="text-xs text-muted-foreground">{t("qs.fields.injuredPerson")}: {r.injured_person}</p>}
        <RowMeta>
          <StatusBadge tone={qs.toneOf(qs.ACCIDENT_STATUS, r.status)}>{t(`qs.enums.accidentStatus.${r.status}`)}</StatusBadge>
          <StatusBadge tone={qs.toneOf(qs.ACCIDENT_SEVERITY, r.severity)}>{t(`qs.enums.accidentSeverity.${r.severity}`)}</StatusBadge>
          {r.accident_date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(r.accident_date)}{r.accident_time ? ` ${r.accident_time.slice(0, 5)}` : ""}</span>}
        </RowMeta>
      </>
    ),
  }), []);
  // Override title fallback: use accident_number as title for search
  return <GenericEntityTab<qs.AccidentReport & { title?: string }> projectId={projectId} cfg={cfg as never} />;
}

// ---- Corrective Actions
export function CorrectiveActionsTab({ projectId }: { projectId: string }) {
  const cfg: EntityConfig<qs.CorrectiveAction> = useMemo(() => ({
    icon: Wrench, titleKey: "qs.corrective.title", newKey: "qs.corrective.new", emptyKey: "qs.corrective.empty",
    list: qs.listCorrectiveActions, create: qs.createCorrectiveAction as never, update: qs.updateCorrectiveAction as never, del: qs.deleteCorrectiveAction,
    statusOptions: qs.CORRECTIVE_STATUS, statusI18n: "qs.enums.correctiveStatus",
    defaults: { status: "open", priority: "medium" },
    fields: [
      { key: "title", label: "qs.fields.title", required: true },
      { key: "status", label: "qs.fields.status", type: "enum", enumOptions: qs.CORRECTIVE_STATUS, enumI18n: "qs.enums.correctiveStatus" },
      { key: "priority", label: "qs.fields.priority", type: "enum", enumOptions: qs.PRIORITY_OPTS, enumI18n: "qs.enums.priority" },
      { key: "responsible_person", label: "qs.fields.responsible" },
      { key: "due_date", label: "qs.fields.dueDate", type: "date" },
      { key: "completion_date", label: "qs.fields.completionDate", type: "date" },
      { key: "source_type", label: "qs.fields.sourceType" },
      { key: "description", label: "qs.fields.description", type: "textarea" },
    ],
    card: (r, t) => (
      <>
        <p className="font-semibold">{r.title}</p>
        <RowMeta>
          <StatusBadge tone={qs.toneOf(qs.CORRECTIVE_STATUS, r.status)}>{t(`qs.enums.correctiveStatus.${r.status}`)}</StatusBadge>
          <StatusBadge tone={qs.toneOf(qs.PRIORITY_OPTS, r.priority)}>{t(`qs.enums.priority.${r.priority}`)}</StatusBadge>
          {r.due_date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(r.due_date)}</span>}
          {r.responsible_person && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><User className="h-3 w-3" />{r.responsible_person}</span>}
        </RowMeta>
      </>
    ),
  }), []);
  return <GenericEntityTab<qs.CorrectiveAction> projectId={projectId} cfg={cfg} />;
}

// =========================================================
// Dashboards
// =========================================================

export function QualityTab({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof qs.getQualityStats>> | null>(null);
  useEffect(() => { qs.getQualityStats(projectId).then(setStats).catch(() => setStats(null)); }, [projectId]);

  if (!stats) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QsStatCard icon={ClipboardList} label={t("qs.stats.openChecklists")} value={stats.openChecklists} tone="info" />
        <QsStatCard icon={AlertTriangle} label={t("qs.stats.failedItems")} value={stats.failedItems} tone="danger" />
        <QsStatCard icon={ClipboardCheck} label={t("qs.stats.upcomingInspections")} value={stats.upcomingInspections} tone="info" />
        <QsStatCard icon={ClipboardCheck} label={t("qs.stats.completedInspections")} value={stats.completedInspections} tone="success" />
        <QsStatCard icon={FileWarning} label={t("qs.stats.openNcrs")} value={stats.openNcrs} tone="warning" />
        <QsStatCard icon={ListChecks} label={t("qs.stats.openPunchItems")} value={stats.openPunchItems} tone="warning" />
        <QsStatCard icon={Handshake} label={t("qs.stats.pendingAcceptances")} value={stats.pendingAcceptances} tone="info" />
        <QsStatCard icon={ClipboardCheck} label={t("qs.stats.qualityScore")} value={stats.qualityScore != null ? `${stats.qualityScore}%` : "—"} tone="success" />
      </div>
      <Card className="border-border/70">
        <CardHeader><CardTitle className="text-base">{t("qs.quality.description")}</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">{t("qs.quality.hint")}</CardContent>
      </Card>
    </div>
  );
}

export function SafetyTab({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof qs.getSafetyStats>> | null>(null);
  useEffect(() => { qs.getSafetyStats(projectId).then(setStats).catch(() => setStats(null)); }, [projectId]);

  return (
    <div className="space-y-4">
      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QsStatCard icon={AlertTriangle} label={t("qs.stats.openObservations")} value={stats.openObservations} tone="warning" />
          <QsStatCard icon={AlertOctagon} label={t("qs.stats.accidentsThisMonth")} value={stats.accidentsThisMonth} tone="danger" />
          <QsStatCard icon={AlertTriangle} label={t("qs.stats.nearMisses")} value={stats.nearMisses} tone="warning" />
          <QsStatCard icon={HardHat} label={t("qs.stats.upcomingToolbox")} value={stats.upcomingToolbox} tone="info" />
          <QsStatCard icon={Wrench} label={t("qs.stats.openCorrectiveActions")} value={stats.openCorrectiveActions} tone="warning" />
          <QsStatCard icon={ShieldCheck} label={t("qs.stats.safetyScore")} value={stats.safetyScore != null ? `${stats.safetyScore}%` : "—"} tone="success" />
        </div>
      ) : <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}

      <Tabs defaultValue="observations" className="space-y-3">
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="observations"><AlertTriangle className="h-4 w-4" />{t("qs.observations.title")}</TabsTrigger>
            <TabsTrigger value="toolbox"><HardHat className="h-4 w-4" />{t("qs.toolbox.title")}</TabsTrigger>
            <TabsTrigger value="safetyInspections"><ShieldCheck className="h-4 w-4" />{t("qs.safetyInspections.title")}</TabsTrigger>
            <TabsTrigger value="accidents"><AlertOctagon className="h-4 w-4" />{t("qs.accidents.title")}</TabsTrigger>
            <TabsTrigger value="corrective"><Wrench className="h-4 w-4" />{t("qs.corrective.title")}</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="observations"><SafetyObservationsTab projectId={projectId} /></TabsContent>
        <TabsContent value="toolbox"><ToolboxTalksTab projectId={projectId} /></TabsContent>
        <TabsContent value="safetyInspections"><SafetyInspectionsTab projectId={projectId} /></TabsContent>
        <TabsContent value="accidents"><AccidentReportsTab projectId={projectId} /></TabsContent>
        <TabsContent value="corrective"><CorrectiveActionsTab projectId={projectId} /></TabsContent>
      </Tabs>
    </div>
  );
}

// Signature icon export unused reference cleanup: keep PenLine referenced to avoid unused-import if strict
void PenLine;
