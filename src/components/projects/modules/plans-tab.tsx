import { useEffect, useMemo, useState } from "react";
import { Layers, Plus, Search, Loader2, Eye, Download, History, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  listPlans, uploadPlan, updatePlan, deletePlan, uploadNewPlanRevision, listPlanRevisions,
  listPlanSets, createPlanSet,
  PLAN_DISCIPLINES, PLAN_STATUS, planStatusMeta, getSignedUrl, humanFileSize,
  type ProjectPlan, type PlanSet, type PlanRevision,
} from "@/lib/documents";
import { FileViewer } from "./file-viewer";

export function PlansTab({ projectId }: { projectId: string }) {
  const [plans, setPlans] = useState<ProjectPlan[]>([]);
  const [sets, setSets] = useState<PlanSet[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sort, setSort] = useState<"newest" | "plan_number" | "title">("newest");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [setOpen, setSetOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectPlan | null>(null);
  const [confirmDel, setConfirmDel] = useState<ProjectPlan | null>(null);
  const [viewing, setViewing] = useState<ProjectPlan | null>(null);
  const [revisionFor, setRevisionFor] = useState<ProjectPlan | null>(null);
  const [revisionsFor, setRevisionsFor] = useState<ProjectPlan | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([listPlans(projectId), listPlanSets(projectId)]);
      setPlans(p); setSets(s);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const filtered = useMemo(() => {
    let arr = [...plans];
    if (filterDiscipline !== "all") arr = arr.filter((p) => p.discipline === filterDiscipline);
    if (filterStatus !== "all") arr = arr.filter((p) => p.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((p) =>
        p.plan_number.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.discipline ?? "").toLowerCase().includes(q),
      );
    }
    if (sort === "plan_number") arr.sort((a, b) => a.plan_number.localeCompare(b.plan_number));
    else if (sort === "title") arr.sort((a, b) => a.title.localeCompare(b.title));
    else arr.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
    return arr;
  }, [plans, search, filterDiscipline, filterStatus, sort]);

  async function download(p: ProjectPlan) {
    try {
      const url = await getSignedUrl("project-plans", p.file_url);
      window.open(url, "_blank", "noopener");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plans" className="pl-8" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setSetOpen(true)}><Layers className="h-4 w-4" />New plan set</Button>
          <Button onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4" />Upload plan</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Select value={filterDiscipline} onValueChange={setFilterDiscipline}>
          <SelectTrigger><SelectValue placeholder="Discipline" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All disciplines</SelectItem>
            {PLAN_DISCIPLINES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PLAN_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="plan_number">Plan number</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Layers className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No plans uploaded yet</p>
            <p className="text-xs text-muted-foreground">Upload architectural, structural and MEP drawings.</p>
            <Button onClick={() => setUploadOpen(true)}><Plus className="h-4 w-4" />Upload plan</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const st = planStatusMeta(p.status);
            return (
              <Card key={p.id} className="border-border/70">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-muted-foreground">{p.plan_number}</p>
                      <p className="truncate text-sm font-semibold">{p.title}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">⋯</Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewing(p)}><Eye className="h-4 w-4" />View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => download(p)}><Download className="h-4 w-4" />Download</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRevisionFor(p)}><Upload className="h-4 w-4" />New revision</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRevisionsFor(p)}><History className="h-4 w-4" />Revisions</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setEditing(p)}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setConfirmDel(p)}><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                    {p.discipline && <span className="text-muted-foreground">{p.discipline}</span>}
                    <span className="text-muted-foreground">· Rev {p.revision}</span>
                    <span className="text-muted-foreground">· {humanFileSize(p.file_size)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <UploadPlanDialog open={uploadOpen} onOpenChange={setUploadOpen} projectId={projectId} sets={sets} onSaved={load} />
      <NewSetDialog open={setOpen} onOpenChange={setSetOpen} projectId={projectId} onSaved={load} />
      <EditPlanDialog plan={editing} onClose={() => setEditing(null)} sets={sets} onSaved={load} />
      <NewRevisionDialog plan={revisionFor} onClose={() => setRevisionFor(null)} onSaved={load} />
      <RevisionsDialog plan={revisionsFor} onClose={() => setRevisionsFor(null)} />

      <FileViewer
        open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}
        file={viewing ? { bucket: "project-plans", path: viewing.file_url, name: viewing.file_name, type: viewing.file_type } : null}
        meta={viewing ? [
          { label: "Plan number", value: viewing.plan_number },
          { label: "Discipline", value: viewing.discipline },
          { label: "Status", value: planStatusMeta(viewing.status).label },
          { label: "Revision", value: viewing.revision },
          { label: "Size", value: humanFileSize(viewing.file_size) },
        ] : []}
      />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete plan?</AlertDialogTitle>
            <AlertDialogDescription>"{confirmDel?.plan_number} {confirmDel?.title}" and all its revisions will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deletePlan(confirmDel); toast.success("Deleted"); setConfirmDel(null); load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NewSetDialog({ open, onOpenChange, projectId, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discipline, setDiscipline] = useState<string>("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) { setName(""); setDescription(""); setDiscipline(""); } }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>New plan set</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Discipline</Label>
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{PLAN_DISCIPLINES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!name.trim() || saving} onClick={async () => {
            setSaving(true);
            try { await createPlanSet({ project_id: projectId, name: name.trim(), description, discipline: discipline || undefined }); toast.success("Created"); onOpenChange(false); onSaved(); }
            catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
            finally { setSaving(false); }
          }}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadPlanDialog({
  open, onOpenChange, projectId, sets, onSaved,
}: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string; sets: PlanSet[]; onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [planNumber, setPlanNumber] = useState("");
  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState<string>("");
  const [revision, setRevision] = useState("A");
  const [status, setStatus] = useState("draft");
  const [planSet, setPlanSet] = useState<string>("none");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setFile(null); setPlanNumber(""); setTitle(""); setDiscipline(""); setRevision("A"); setStatus("draft"); setPlanSet("none"); }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { toast.error("Pick a file"); return; }
    if (!planNumber.trim() || !title.trim()) { toast.error("Plan number and title required"); return; }
    setSaving(true);
    try {
      await uploadPlan({
        projectId, file, plan_number: planNumber.trim(), title: title.trim(),
        discipline: discipline || undefined, revision: revision || "A", status,
        plan_set_id: planSet === "none" ? null : planSet,
      });
      toast.success("Plan uploaded");
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Upload plan</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">File *</Label><Input type="file" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label className="text-xs">Plan number *</Label><Input value={planNumber} onChange={(e) => setPlanNumber(e.target.value)} placeholder="A-101" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Revision</Label><Input value={revision} onChange={(e) => setRevision(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label className="text-xs">Discipline</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{PLAN_DISCIPLINES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLAN_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Plan set</Label>
            <Select value={planSet} onValueChange={setPlanSet}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {sets.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Upload</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditPlanDialog({
  plan, onClose, sets, onSaved,
}: { plan: ProjectPlan | null; onClose: () => void; sets: PlanSet[]; onSaved: () => void }) {
  const [planNumber, setPlanNumber] = useState("");
  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState<string>("");
  const [status, setStatus] = useState("draft");
  const [revision, setRevision] = useState("");
  const [planSet, setPlanSet] = useState("none");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setPlanNumber(plan.plan_number); setTitle(plan.title);
      setDiscipline(plan.discipline ?? ""); setStatus(plan.status);
      setRevision(plan.revision); setPlanSet(plan.plan_set_id ?? "none");
    }
  }, [plan]);

  if (!plan) return null;
  return (
    <Dialog open={!!plan} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit plan</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label className="text-xs">Plan number</Label><Input value={planNumber} onChange={(e) => setPlanNumber(e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Revision</Label><Input value={revision} onChange={(e) => setRevision(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label className="text-xs">Discipline</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{PLAN_DISCIPLINES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLAN_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Plan set</Label>
            <Select value={planSet} onValueChange={setPlanSet}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {sets.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={saving} onClick={async () => {
            setSaving(true);
            try {
              await updatePlan(plan.id, {
                plan_number: planNumber, title, discipline: discipline || null,
                status, revision, plan_set_id: planSet === "none" ? null : planSet,
              }, { project_id: plan.project_id });
              toast.success("Saved"); onClose(); onSaved();
            } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
            finally { setSaving(false); }
          }}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewRevisionDialog({ plan, onClose, onSaved }: { plan: ProjectPlan | null; onClose: () => void; onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [revision, setRevision] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (plan) { setFile(null); setRevision(nextRevision(plan.revision)); } }, [plan]);
  if (!plan) return null;
  return (
    <Dialog open={!!plan} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>New revision</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground">Current: Rev {plan.revision}</p>
        <div className="space-y-1.5"><Label className="text-xs">New revision *</Label><Input value={revision} onChange={(e) => setRevision(e.target.value)} /></div>
        <div className="space-y-1.5"><Label className="text-xs">File *</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!file || !revision.trim() || saving} onClick={async () => {
            if (!file) return;
            setSaving(true);
            try { await uploadNewPlanRevision(plan, file, revision.trim()); toast.success("Revision uploaded"); onClose(); onSaved(); }
            catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
            finally { setSaving(false); }
          }}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function nextRevision(curr: string) {
  if (!curr) return "A";
  const m = curr.match(/^([A-Za-z])$/);
  if (m) return String.fromCharCode(m[1].toUpperCase().charCodeAt(0) + 1);
  const n = parseInt(curr, 10);
  if (!isNaN(n)) return String(n + 1);
  return curr + "+";
}

function RevisionsDialog({ plan, onClose }: { plan: ProjectPlan | null; onClose: () => void }) {
  const [revs, setRevs] = useState<PlanRevision[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!plan) return;
    setLoading(true);
    listPlanRevisions(plan.id).then(setRevs).catch(() => {}).finally(() => setLoading(false));
  }, [plan]);
  if (!plan) return null;
  return (
    <Dialog open={!!plan} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Revision history</DialogTitle></DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/5 p-3">
            <div>
              <p className="text-sm font-semibold">Rev {plan.revision} · current</p>
              <p className="truncate text-xs text-muted-foreground">{plan.file_name}</p>
            </div>
            <Button size="sm" variant="outline" onClick={async () => {
              const url = await getSignedUrl("project-plans", plan.file_url);
              window.open(url, "_blank", "noopener");
            }}><Download className="h-4 w-4" /></Button>
          </div>
          {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /> :
            revs.length === 0 ? <p className="text-center text-xs text-muted-foreground">No previous revisions.</p> :
              revs.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-border/70 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Rev {r.revision}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.file_name}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(r.created_at ?? "").toLocaleString()}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={async () => {
                    const url = await getSignedUrl("project-plans", r.file_url);
                    window.open(url, "_blank", "noopener");
                  }}><Download className="h-4 w-4" /></Button>
                </div>
              ))
          }
        </div>
        <DialogFooter><Button variant="ghost" onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
