import { useEffect, useState } from "react";
import { CheckSquare, Plus, Trash2, Edit, Loader2, Calendar, User } from "lucide-react";
import { toast } from "sonner";

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
  listTasks, createTask, updateTask, deleteTask,
  TASK_STATUS, PRIORITY, type Task,
} from "@/lib/site-modules";

export function TasksTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Task | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Task | null>(null);
  const [statusF, setStatusF] = useState("all");
  const [prioF, setPrioF] = useState("all");
  const [sort, setSort] = useState<"due" | "created">("due");

  async function load() {
    setLoading(true);
    try { setItems(await listTasks(projectId)); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  let filtered = items;
  if (statusF !== "all") filtered = filtered.filter((t) => t.status === statusF);
  if (prioF !== "all") filtered = filtered.filter((t) => t.priority === prioF);
  if (sort === "due") {
    filtered = [...filtered].sort((a, b) => {
      if (!a.due_date) return 1; if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
  }

  async function changeStatus(t: Task, status: string) {
    try {
      await updateTask(t.id, { status }, { project_id: projectId });
      toast.success("Status updated"); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {TASK_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={prioF} onValueChange={setPrioF}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priority</SelectItem>
              {PRIORITY.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as "due" | "created")}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="due">Due date</SelectItem>
              <SelectItem value="created">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> New task</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <CheckSquare className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No tasks yet</p>
            <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Create task</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((t) => {
            const s = TASK_STATUS.find((x) => x.value === t.status);
            const p = PRIORITY.find((x) => x.value === t.priority);
            return (
              <Card key={t.id} className="border-border/70">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{t.title}</p>
                      {t.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {s && <StatusBadge tone={s.tone}>{s.label}</StatusBadge>}
                        {p && <StatusBadge tone={p.tone}>{p.label}</StatusBadge>}
                        {t.assigned_to && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><User className="h-3 w-3" />{t.assigned_to}</span>}
                        {t.due_date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{new Date(t.due_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Select value={t.status} onValueChange={(v) => changeStatus(t, v)}>
                        <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{TASK_STATUS.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setConfirmDel(t)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <TaskDialog open={open} onOpenChange={setOpen} projectId={projectId} editing={editing} onSaved={load} />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deleteTask(confirmDel.id); toast.success("Deleted"); setConfirmDel(null); load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TaskDialog({
  open, onOpenChange, projectId, editing, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; projectId: string;
  editing: Task | null; onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Task>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm(editing ?? { status: "open", priority: "medium" });
  }, [open, editing]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title?.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      if (editing) { await updateTask(editing.id, form, { project_id: projectId }); toast.success("Updated"); }
      else { await createTask({ ...form, project_id: projectId, title: form.title } as never); toast.success("Created"); }
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">Title *</Label><Input required value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs">Status</Label>
              <Select value={form.status ?? "open"} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TASK_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Priority</Label>
              <Select value={form.priority ?? "medium"} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITY.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Assigned to</Label><Input value={form.assigned_to ?? ""} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Due date</Label><Input type="date" value={form.due_date ?? ""} onChange={(e) => setForm({ ...form, due_date: e.target.value || null })} /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
