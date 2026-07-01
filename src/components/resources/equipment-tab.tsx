import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, QrCode, Wrench, Search, Hammer, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
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
  listEquipment, createEquipment, updateEquipment, deleteEquipment, assignEquipment,
  EQUIPMENT_CATEGORIES, EQUIPMENT_STATUS, statusMeta, generateQR,
  type Equipment,
} from "@/lib/resources";
import { listProjects, type ProjectRow } from "@/lib/projects";

export function EquipmentTab({ projectId }: { projectId?: string } = {}) {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<Equipment[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [confirmDel, setConfirmDel] = useState<Equipment | null>(null);
  const [assigning, setAssigning] = useState<Equipment | null>(null);
  const locale = i18n.language?.startsWith("de") ? "de-DE" : "en-US";

  async function load() {
    setLoading(true);
    try {
      const eq = await listEquipment(projectId ? { projectId } : undefined);
      setItems(eq);
      if (!projectId) setProjects(await listProjects({ archived: false }));
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failedLoad")); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const filtered = items.filter((i) => {
    if (statusFilter && i.status !== statusFilter) return false;
    if (categoryFilter && i.category !== categoryFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!i.name.toLowerCase().includes(s) && !(i.equipment_number ?? "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("resources.search.equipment")} className="pl-8" />
          </div>
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder={t("resources.filters.status")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("resources.filters.allStatus")}</SelectItem>
              {EQUIPMENT_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.label)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoryFilter || "all"} onValueChange={(v) => setCategoryFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("resources.filters.category")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("resources.filters.allCategories")}</SelectItem>
              {EQUIPMENT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{t(`resources.equipmentCategories.${c}`, c)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" />{t("resources.actions.newEquipment")}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState onCreate={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((eq) => {
            const sm = statusMeta(EQUIPMENT_STATUS, eq.status);
            const proj = projects.find((p) => p.id === eq.current_project_id);
            return (
              <Card key={eq.id} className="border-border/70">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] text-muted-foreground">{eq.equipment_number ?? "—"}</div>
                      <h3 className="font-semibold truncate">{eq.name}</h3>
                      {eq.category && <p className="text-xs text-muted-foreground">{t(`resources.equipmentCategories.${eq.category}`, eq.category)}</p>}
                    </div>
                    <StatusBadge tone={sm.tone}>{t(sm.label, sm.label)}</StatusBadge>
                  </div>
                  <dl className="space-y-1 text-xs">
                    {proj && <Row label={t("resources.fields.project")} value={proj.name} />}
                    {eq.responsible_person && <Row label={t("resources.fields.responsible")} value={eq.responsible_person} />}
                    {eq.maintenance_due_date && <Row label={t("resources.fields.maintenance")} value={new Date(eq.maintenance_due_date).toLocaleDateString(locale)} />}
                    {eq.inspection_due_date && <Row label={t("resources.fields.inspection")} value={new Date(eq.inspection_due_date).toLocaleDateString(locale)} />}
                    {eq.qr_code && <Row label={t("resources.fields.qr")} value={eq.qr_code} mono />}
                  </dl>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {!projectId && (
                      <Button size="sm" variant="outline" onClick={() => setAssigning(eq)}>
                        <Wrench className="h-3.5 w-3.5" />{t("resources.actions.assign")}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(eq); setOpen(true); }}>
                      <Edit className="h-3.5 w-3.5" />{t("common.edit")}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDel(eq)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <EquipmentDialog
        open={open} onOpenChange={setOpen}
        editing={editing} projects={projects}
        defaultProjectId={projectId}
        onSaved={load}
      />

      <AssignDialog
        equipment={assigning}
        projects={projects}
        onClose={() => setAssigning(null)}
        onSaved={load}
      />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("resources.dialogs.deleteEquipment")}</AlertDialogTitle>
            <AlertDialogDescription>{t("resources.dialogs.cannotBeUndone")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deleteEquipment(confirmDel.id); toast.success(t("states.deleted")); setConfirmDel(null); load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
              }}
            >{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono" : ""}>{value}</dd>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();
  return (
    <Card className="border-dashed border-border/70 bg-muted/30">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <Hammer className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t("resources.empty.equipment")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("resources.empty.equipmentDesc")}</p>
        <Button onClick={onCreate}><Plus className="h-4 w-4" />{t("resources.actions.addEquipment")}</Button>
      </CardContent>
    </Card>
  );
}

function EquipmentDialog({
  open, onOpenChange, editing, projects, defaultProjectId, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  editing: Equipment | null; projects: ProjectRow[];
  defaultProjectId?: string; onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<Equipment>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editing ?? {
        status: "available",
        qr_code: generateQR("EQ"),
        current_project_id: defaultProjectId ?? null,
      });
    }
  }, [open, editing, defaultProjectId]);

  function set<K extends keyof Equipment>(k: K, v: Equipment[K] | null) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error(t("states.nameRequired")); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateEquipment(editing.id, form);
        toast.success(t("states.updated"));
      } else {
        await createEquipment(form as never);
        toast.success(t("states.created"));
      }
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{editing ? t("resources.dialogs.editEquipment") : t("resources.dialogs.newEquipment")}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`${t("resources.fields.name")} *`}><Input required value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label={t("resources.fields.equipmentNumber")}><Input value={form.equipment_number ?? ""} onChange={(e) => set("equipment_number", e.target.value)} /></Field>
            <Field label={t("resources.fields.category")}>
              <Select value={form.category ?? ""} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue placeholder={t("resources.empty.select")} /></SelectTrigger>
                <SelectContent>{EQUIPMENT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{t(`resources.equipmentCategories.${c}`, c)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={t("resources.fields.status")}>
              <Select value={form.status ?? "available"} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EQUIPMENT_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.label)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={t("resources.fields.manufacturer")}><Input value={form.manufacturer ?? ""} onChange={(e) => set("manufacturer", e.target.value)} /></Field>
            <Field label={t("resources.fields.model")}><Input value={form.model ?? ""} onChange={(e) => set("model", e.target.value)} /></Field>
            <Field label={t("resources.fields.serialNumber")}><Input value={form.serial_number ?? ""} onChange={(e) => set("serial_number", e.target.value)} /></Field>
            <Field label={t("resources.fields.purchaseDate")}><Input type="date" value={form.purchase_date ?? ""} onChange={(e) => set("purchase_date", e.target.value)} /></Field>
            <Field label={t("resources.fields.currentProject")}>
              <Select value={form.current_project_id ?? "none"} onValueChange={(v) => set("current_project_id", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder={t("resources.empty.unassigned")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("resources.empty.unassigned")}</SelectItem>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("resources.fields.currentLocation")}><Input value={form.current_location ?? ""} onChange={(e) => set("current_location", e.target.value)} /></Field>
            <Field label={t("resources.fields.responsiblePerson")}><Input value={form.responsible_person ?? ""} onChange={(e) => set("responsible_person", e.target.value)} /></Field>
            <Field label={t("resources.fields.maintenanceDue")}><Input type="date" value={form.maintenance_due_date ?? ""} onChange={(e) => set("maintenance_due_date", e.target.value)} /></Field>
            <Field label={t("resources.fields.inspectionDue")}><Input type="date" value={form.inspection_due_date ?? ""} onChange={(e) => set("inspection_due_date", e.target.value)} /></Field>
            <Field label={t("resources.fields.qrCode")}>
              <div className="flex gap-2">
                <Input value={form.qr_code ?? ""} onChange={(e) => set("qr_code", e.target.value)} className="font-mono" />
                <Button type="button" variant="outline" size="icon" onClick={() => set("qr_code", generateQR("EQ"))}>
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </Field>
          </div>
          <Field label={t("resources.fields.notes")}><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({
  equipment, projects, onClose, onSaved,
}: {
  equipment: Equipment | null; projects: ProjectRow[];
  onClose: () => void; onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [projectId, setProjectId] = useState<string>("");
  const [person, setPerson] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (equipment) {
      setProjectId(equipment.current_project_id ?? "");
      setPerson(equipment.responsible_person ?? "");
    }
  }, [equipment]);

  if (!equipment) return null;

  async function submit() {
    if (!equipment) return;
    setSaving(true);
    try {
      await assignEquipment(equipment.id, projectId || null, person || null);
      toast.success(t("states.saved"));
      onClose(); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={!!equipment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("resources.dialogs.assignEquipment", { name: equipment.name })}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label={t("resources.fields.project")}>
            <Select value={projectId || "none"} onValueChange={(v) => setProjectId(v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("resources.empty.unassigned")}</SelectItem>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("resources.fields.responsiblePerson")}><Input value={person} onChange={(e) => setPerson(e.target.value)} /></Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t("common.cancel")}</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}<Truck className="h-4 w-4" />{t("resources.actions.saveAssignment")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
