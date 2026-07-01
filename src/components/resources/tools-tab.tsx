import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, QrCode, Search, Wrench, Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import {
  listTools, createTool, updateTool, deleteTool, assignTool,
  TOOL_CATEGORIES, TOOL_STATUS, statusMeta, generateQR, type Tool,
} from "@/lib/resources";
import { listProjects, type ProjectRow } from "@/lib/projects";

export function ToolsTab() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Tool[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tool | null>(null);
  const [confirmDel, setConfirmDel] = useState<Tool | null>(null);
  const [assigning, setAssigning] = useState<Tool | null>(null);

  async function load() {
    setLoading(true);
    try {
      setItems(await listTools());
      setProjects(await listProjects({ archived: false }));
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const filtered = items.filter((i) => {
    if (status && i.status !== status) return false;
    if (category && i.category !== category) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !(i.tool_number ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("resources.search.tools")} className="pl-8" />
          </div>
          <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder={t("resources.filters.status")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("resources.filters.allStatus")}</SelectItem>
              {TOOL_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.label)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("resources.filters.category")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("resources.filters.allCategories")}</SelectItem>
              {TOOL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{t(`resources.toolCategories.${c}`, c)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("resources.actions.newTool")}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Settings2 className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">{t("resources.empty.tools")}</p>
            <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("resources.actions.addTool")}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => {
            const sm = statusMeta(TOOL_STATUS, it.status);
            const proj = projects.find((p) => p.id === it.current_project_id);
            return (
              <Card key={it.id} className="border-border/70">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] text-muted-foreground">{it.tool_number ?? "—"}</div>
                      <h3 className="font-semibold truncate">{it.name}</h3>
                      {it.category && <p className="text-xs text-muted-foreground">{t(`resources.toolCategories.${it.category}`, it.category)}</p>}
                    </div>
                    <StatusBadge tone={sm.tone}>{t(sm.label, sm.label)}</StatusBadge>
                  </div>
                  <dl className="space-y-1 text-xs">
                    {proj && <div className="flex justify-between"><dt className="text-muted-foreground">{t("resources.fields.project")}</dt><dd>{proj.name}</dd></div>}
                    {it.responsible_person && <div className="flex justify-between"><dt className="text-muted-foreground">{t("resources.fields.holder")}</dt><dd>{it.responsible_person}</dd></div>}
                    {it.qr_code && <div className="flex justify-between"><dt className="text-muted-foreground">{t("resources.fields.qr")}</dt><dd className="font-mono">{it.qr_code}</dd></div>}
                  </dl>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setAssigning(it)}><Wrench className="h-3.5 w-3.5" />{t("resources.actions.assign")}</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(it); setOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDel(it)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ToolDialog open={open} onOpenChange={setOpen} editing={editing} projects={projects} onSaved={load} />
      <AssignToolDialog tool={assigning} projects={projects} onClose={() => setAssigning(null)} onSaved={load} />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t("resources.dialogs.deleteTool")}</AlertDialogTitle><AlertDialogDescription>{t("resources.dialogs.cannotBeUndone")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
              if (!confirmDel) return;
              try { await deleteTool(confirmDel.id); toast.success(t("states.deleted")); setConfirmDel(null); load(); }
              catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
            }}>{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}

function ToolDialog({
  open, onOpenChange, editing, projects, onSaved,
}: { open: boolean; onOpenChange: (v: boolean) => void; editing: Tool | null; projects: ProjectRow[]; onSaved: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<Tool>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(editing ?? { status: "available", qr_code: generateQR("TOOL") });
  }, [open, editing]);

  function set<K extends keyof Tool>(k: K, v: Tool[K] | null) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error(t("states.nameRequired")); return; }
    setSaving(true);
    try {
      if (editing) await updateTool(editing.id, form);
      else await createTool(form as never);
      toast.success(t("states.saved")); onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{editing ? t("resources.dialogs.editTool") : t("resources.dialogs.newTool")}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`${t("resources.fields.name")} *`}><Input required value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label={t("resources.fields.toolNumber")}><Input value={form.tool_number ?? ""} onChange={(e) => set("tool_number", e.target.value)} /></Field>
            <Field label={t("resources.fields.category")}>
              <Select value={form.category ?? ""} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue placeholder={t("resources.empty.select")} /></SelectTrigger>
                <SelectContent>{TOOL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{t(`resources.toolCategories.${c}`, c)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={t("resources.fields.status")}>
              <Select value={form.status ?? "available"} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TOOL_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.label)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={t("resources.fields.manufacturer")}><Input value={form.manufacturer ?? ""} onChange={(e) => set("manufacturer", e.target.value)} /></Field>
            <Field label={t("resources.fields.model")}><Input value={form.model ?? ""} onChange={(e) => set("model", e.target.value)} /></Field>
            <Field label={t("resources.fields.serialNumber")}><Input value={form.serial_number ?? ""} onChange={(e) => set("serial_number", e.target.value)} /></Field>
            <Field label={t("resources.fields.currentProject")}>
              <Select value={form.current_project_id ?? "none"} onValueChange={(v) => set("current_project_id", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder={t("resources.empty.unassigned")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("resources.empty.unassigned")}</SelectItem>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("resources.fields.holderLocation")}><Input value={form.responsible_person ?? ""} onChange={(e) => set("responsible_person", e.target.value)} /></Field>
            <Field label={t("resources.fields.qrCode")}>
              <div className="flex gap-2">
                <Input className="font-mono" value={form.qr_code ?? ""} onChange={(e) => set("qr_code", e.target.value)} />
                <Button type="button" variant="outline" size="icon" onClick={() => set("qr_code", generateQR("TOOL"))}><QrCode className="h-4 w-4" /></Button>
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

function AssignToolDialog({ tool, projects, onClose, onSaved }: { tool: Tool | null; projects: ProjectRow[]; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const [projectId, setProjectId] = useState("");
  const [person, setPerson] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tool) { setProjectId(tool.current_project_id ?? ""); setPerson(tool.responsible_person ?? ""); }
  }, [tool]);

  if (!tool) return null;
  return (
    <Dialog open={!!tool} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("resources.dialogs.assignTool", { name: tool.name })}</DialogTitle></DialogHeader>
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
          <Field label={t("resources.fields.assignedTo")}><Input value={person} onChange={(e) => setPerson(e.target.value)} /></Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t("common.cancel")}</Button>
          <Button disabled={saving} onClick={async () => {
            setSaving(true);
            try { await assignTool(tool.id, projectId || null, person || null); toast.success(t("states.saved")); onClose(); onSaved(); }
            catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); } finally { setSaving(false); }
          }}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
