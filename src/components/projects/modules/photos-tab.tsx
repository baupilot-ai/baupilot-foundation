import { useEffect, useState } from "react";
import { Camera, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  listPhotos, uploadProjectPhoto, createPhoto, deletePhoto, getPhotoUrl,
  PHOTO_CATEGORIES, type ProjectPhoto,
} from "@/lib/site-modules";
import { supabase } from "@/integrations/supabase/client";

export function PhotosTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ProjectPhoto[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<ProjectPhoto | null>(null);
  const [filterCat, setFilterCat] = useState("all");

  async function load() {
    setLoading(true);
    try {
      const data = await listPhotos(projectId);
      setItems(data);
      const entries = await Promise.all(data.map(async (p) => [p.id, await getPhotoUrl(p.photo_url)] as const));
      setUrls(Object.fromEntries(entries.filter(([, u]) => u)) as Record<string, string>);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const filtered = filterCat === "all" ? items : items.filter((p) => p.category === filterCat);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {PHOTO_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Upload photo</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Camera className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No photos yet</p>
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Upload photo</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden border-border/70">
              <div className="relative aspect-square bg-muted">
                {urls[p.id] ? (
                  <img src={urls[p.id]} alt={p.title ?? ""} className="h-full w-full object-cover" />
                ) : <div className="grid h-full place-items-center"><Camera className="h-6 w-6 text-muted-foreground" /></div>}
                <Button size="icon" variant="secondary" className="absolute right-1 top-1 h-7 w-7" onClick={() => setConfirmDel(p)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium">{p.title || "Untitled"}</p>
                <p className="text-[10px] text-muted-foreground">{p.category}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <UploadDialog open={open} onOpenChange={setOpen} projectId={projectId} onSaved={load} />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete photo?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deletePhoto(confirmDel.id, confirmDel.photo_url); toast.success("Deleted"); setConfirmDel(null); load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UploadDialog({
  open, onOpenChange, projectId, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; projectId: string; onSaved: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setFile(null); setTitle(""); setDescription(""); setCategory("General"); } }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { toast.error("Select a photo"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from("profiles").select("company_id").eq("id", user!.id).maybeSingle();
      if (!prof?.company_id) throw new Error("Company missing");
      const path = await uploadProjectPhoto(prof.company_id, file);
      await createPhoto({ project_id: projectId, photo_url: path, title, description, category } as never);
      toast.success("Uploaded");
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Upload photo</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">Photo *</Label><Input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PHOTO_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
