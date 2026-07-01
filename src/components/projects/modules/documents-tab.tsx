import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Search, Loader2, Eye, Download, History, Pencil, Trash2, Upload, Folder, FolderPlus } from "lucide-react";
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
  listDocuments, uploadDocument, updateDocument, deleteDocument,
  submitDocumentForReview, approveDocument, rejectDocument, archiveDocument,
  uploadNewDocumentVersion, listDocumentVersions, getSignedUrl,
  listFolders, createFolder, renameFolder, deleteFolder,
  DOCUMENT_CATEGORIES, DOCUMENT_STATUS, categoryLabel, docStatusMeta,
  humanFileSize,
  type ProjectDocument, type DocumentFolder, type DocumentVersion,
} from "@/lib/documents";
import { FileViewer, type ViewerFile } from "./file-viewer";
import { usePermissions } from "@/hooks/use-permissions";
import { Send, CheckCircle2, XCircle, Archive } from "lucide-react";

export function DocumentsTab({ projectId }: { projectId: string }) {
  const { can } = usePermissions();
  const [docs, setDocs] = useState<ProjectDocument[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFolder, setFilterFolder] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "name" | "category">("newest");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectDocument | null>(null);
  const [confirmDel, setConfirmDel] = useState<ProjectDocument | null>(null);
  const [viewing, setViewing] = useState<ProjectDocument | null>(null);
  const [newVersionFor, setNewVersionFor] = useState<ProjectDocument | null>(null);
  const [versionsFor, setVersionsFor] = useState<ProjectDocument | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [d, f] = await Promise.all([listDocuments(projectId), listFolders(projectId)]);
      setDocs(d); setFolders(f);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const filtered = useMemo(() => {
    let arr = [...docs];
    if (filterCategory !== "all") arr = arr.filter((d) => d.category === filterCategory);
    if (filterStatus !== "all") arr = arr.filter((d) => d.status === filterStatus);
    if (filterFolder === "none") arr = arr.filter((d) => !d.folder_id);
    else if (filterFolder !== "all") arr = arr.filter((d) => d.folder_id === filterFolder);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((d) => d.title.toLowerCase().includes(q) || d.file_name.toLowerCase().includes(q));
    }
    if (sort === "name") arr.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "category") arr.sort((a, b) => (a.category ?? "").localeCompare(b.category ?? ""));
    else arr.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
    return arr;
  }, [docs, search, filterCategory, filterStatus, filterFolder, sort]);

  async function download(d: ProjectDocument) {
    try {
      const url = await getSignedUrl("project-documents", d.file_url);
      window.open(url, "_blank", "noopener");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents" className="pl-8" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setFolderOpen(true)}><FolderPlus className="h-4 w-4" />New folder</Button>
          <Button onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4" />Upload</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {DOCUMENT_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {DOCUMENT_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterFolder} onValueChange={setFilterFolder}>
          <SelectTrigger><SelectValue placeholder="Folder" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All folders</SelectItem>
            <SelectItem value="none">No folder</SelectItem>
            {folders.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Folder chips */}
      {folders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {folders.map((f) => (
            <FolderChip key={f.id} folder={f} onRename={load} onDeleted={load} />
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No documents yet</p>
            <p className="text-xs text-muted-foreground">Upload contracts, invoices, certificates and reports for this project.</p>
            <Button onClick={() => setUploadOpen(true)}><Plus className="h-4 w-4" />Upload document</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => {
            const st = docStatusMeta(d.status);
            return (
              <Card key={d.id} className="border-border/70">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{d.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{d.file_name}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">⋯</Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewing(d)}><Eye className="h-4 w-4" />View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => download(d)}><Download className="h-4 w-4" />Download</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setNewVersionFor(d)}><Upload className="h-4 w-4" />New version</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setVersionsFor(d)}><History className="h-4 w-4" />Versions</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {can("documents.upload") && (d.status === "draft" || d.status === "rejected") && (
                          <DropdownMenuItem onClick={async () => {
                            try { await submitDocumentForReview(d); toast.success("Zur Prüfung gesendet"); load(); }
                            catch (e) { toast.error((e as Error).message); }
                          }}><Send className="h-4 w-4" />Zur Prüfung senden</DropdownMenuItem>
                        )}
                        {can("documents.approve") && d.status === "review" && (
                          <>
                            <DropdownMenuItem onClick={async () => {
                              try { await approveDocument(d); toast.success("Freigegeben"); load(); }
                              catch (e) { toast.error((e as Error).message); }
                            }}><CheckCircle2 className="h-4 w-4" />Freigeben</DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                              const reason = window.prompt("Grund der Ablehnung?") ?? "";
                              if (!reason) return;
                              try { await rejectDocument(d, reason); toast.success("Abgelehnt"); load(); }
                              catch (e) { toast.error((e as Error).message); }
                            }}><XCircle className="h-4 w-4" />Ablehnen</DropdownMenuItem>
                          </>
                        )}
                        {can("documents.archive") && d.status !== "archived" && (
                          <DropdownMenuItem onClick={async () => {
                            try { await archiveDocument(d); toast.success("Archiviert"); load(); }
                            catch (e) { toast.error((e as Error).message); }
                          }}><Archive className="h-4 w-4" />Archivieren</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setEditing(d)}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
                        {can("documents.delete") && (
                          <DropdownMenuItem className="text-destructive" onClick={() => setConfirmDel(d)}><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                    <span className="text-muted-foreground">{categoryLabel(d.category)}</span>
                    <span className="text-muted-foreground">· v{d.version}</span>
                    <span className="text-muted-foreground">· {humanFileSize(d.file_size)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {d.created_at ? new Date(d.created_at).toLocaleDateString() : ""}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <UploadDialog
        open={uploadOpen} onOpenChange={setUploadOpen}
        projectId={projectId} folders={folders} onSaved={load}
      />
      <NewFolderDialog open={folderOpen} onOpenChange={setFolderOpen} projectId={projectId} onSaved={load} />
      <EditDialog doc={editing} onClose={() => setEditing(null)} folders={folders} onSaved={load} />
      <NewVersionDialog doc={newVersionFor} onClose={() => setNewVersionFor(null)} onSaved={load} />
      <VersionsDialog doc={versionsFor} onClose={() => setVersionsFor(null)} />

      <FileViewer
        open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}
        file={viewing ? { bucket: "project-documents", path: viewing.file_url, name: viewing.file_name, type: viewing.file_type } : null}
        meta={viewing ? [
          { label: "Category", value: categoryLabel(viewing.category) },
          { label: "Status", value: docStatusMeta(viewing.status).label },
          { label: "Version", value: `v${viewing.version}` },
          { label: "Size", value: humanFileSize(viewing.file_size) },
        ] : []}
      />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>"{confirmDel?.title}" and all its versions will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deleteDocument(confirmDel); toast.success("Deleted"); setConfirmDel(null); load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FolderChip({ folder, onRename, onDeleted }: { folder: DocumentFolder; onRename: () => void; onDeleted: () => void }) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(folder.name);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7"><Folder className="h-3.5 w-3.5" />{folder.name}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => { setName(folder.name); setRenaming(true); }}><Pencil className="h-4 w-4" />Rename</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={async () => {
            try { await deleteFolder(folder.id); toast.success("Folder deleted"); onDeleted(); }
            catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
          }}><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Rename folder</DialogTitle></DialogHeader>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenaming(false)}>Cancel</Button>
            <Button onClick={async () => {
              try { await renameFolder(folder.id, name.trim()); toast.success("Renamed"); setRenaming(false); onRename(); }
              catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function NewFolderDialog({ open, onOpenChange, projectId, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setName(""); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>New folder</DialogTitle></DialogHeader>
        <Input placeholder="Folder name" value={name} onChange={(e) => setName(e.target.value)} />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!name.trim() || saving} onClick={async () => {
            setSaving(true);
            try { await createFolder(projectId, name.trim()); toast.success("Folder created"); onOpenChange(false); onSaved(); }
            catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
            finally { setSaving(false); }
          }}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadDialog({
  open, onOpenChange, projectId, folders, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; projectId: string; folders: DocumentFolder[]; onSaved: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [status, setStatus] = useState("active");
  const [folder, setFolder] = useState<string>("none");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFile(null); setTitle(""); setDescription(""); setCategory("other"); setStatus("active"); setFolder("none");
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { toast.error("Pick a file"); return; }
    setSaving(true);
    try {
      await uploadDocument({
        projectId, file,
        title: title.trim() || file.name,
        description: description.trim() || undefined,
        category, status,
        folder_id: folder === "none" ? null : folder,
      });
      toast.success("Uploaded");
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Upload document</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">File *</Label><Input type="file" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={file?.name ?? ""} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DOCUMENT_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DOCUMENT_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Folder</Label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Upload</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  doc, onClose, folders, onSaved,
}: { doc: ProjectDocument | null; onClose: () => void; folders: DocumentFolder[]; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [status, setStatus] = useState("active");
  const [folder, setFolder] = useState<string>("none");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doc) {
      setTitle(doc.title); setDescription(doc.description ?? ""); setCategory(doc.category);
      setStatus(doc.status); setFolder(doc.folder_id ?? "none");
    }
  }, [doc]);

  if (!doc) return null;
  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit document</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DOCUMENT_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DOCUMENT_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Folder</Label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={saving} onClick={async () => {
            setSaving(true);
            try {
              await updateDocument(doc.id, {
                title, description: description || null, category, status,
                folder_id: folder === "none" ? null : folder,
              });
              toast.success("Saved"); onClose(); onSaved();
            } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
            finally { setSaving(false); }
          }}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewVersionDialog({ doc, onClose, onSaved }: { doc: ProjectDocument | null; onClose: () => void; onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (doc) setFile(null); }, [doc]);
  if (!doc) return null;
  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Upload new version</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground">Current: v{doc.version} — {doc.file_name}</p>
        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!file || saving} onClick={async () => {
            if (!file) return;
            setSaving(true);
            try { await uploadNewDocumentVersion(doc, file); toast.success("New version uploaded"); onClose(); onSaved(); }
            catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
            finally { setSaving(false); }
          }}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VersionsDialog({ doc, onClose }: { doc: ProjectDocument | null; onClose: () => void }) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!doc) return;
    setLoading(true);
    listDocumentVersions(doc.id).then(setVersions).catch(() => {}).finally(() => setLoading(false));
  }, [doc]);
  if (!doc) return null;
  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Version history</DialogTitle></DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/5 p-3">
            <div>
              <p className="text-sm font-semibold">v{doc.version} · current</p>
              <p className="truncate text-xs text-muted-foreground">{doc.file_name}</p>
            </div>
            <Button size="sm" variant="outline" onClick={async () => {
              const url = await getSignedUrl("project-documents", doc.file_url);
              window.open(url, "_blank", "noopener");
            }}><Download className="h-4 w-4" /></Button>
          </div>
          {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /> :
            versions.length === 0 ? <p className="text-center text-xs text-muted-foreground">No previous versions.</p> :
              versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-border/70 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">v{v.version}</p>
                    <p className="truncate text-xs text-muted-foreground">{v.file_name}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(v.created_at ?? "").toLocaleString()}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={async () => {
                    const url = await getSignedUrl("project-documents", v.file_url);
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
