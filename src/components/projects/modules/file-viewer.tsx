import { useEffect, useState } from "react";
import { Download, Loader2, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getSignedUrl } from "@/lib/documents";

export interface ViewerFile {
  bucket: "project-documents" | "project-plans";
  path: string;
  name: string;
  type?: string | null;
  size?: number | null;
}

export function FileViewer({
  file, open, onOpenChange, meta, history,
}: {
  file: ViewerFile | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  meta?: Array<{ label: string; value: string | null | undefined }>;
  history?: React.ReactNode;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !file) { setUrl(null); return; }
    setLoading(true);
    getSignedUrl(file.bucket, file.path).then(setUrl).catch(() => setUrl(null)).finally(() => setLoading(false));
  }, [open, file]);

  if (!file) return null;
  const type = (file.type ?? "").toLowerCase();
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  const isPdf = type.includes("pdf") || ext === "pdf";
  const isImg = type.startsWith("image/") || ["png","jpg","jpeg","gif","webp","svg"].includes(ext);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader><DialogTitle className="truncate">{file.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid place-items-center rounded-lg border border-border/70 bg-muted/30" style={{ minHeight: 320 }}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> :
              !url ? <p className="text-sm text-muted-foreground">Unable to load preview</p> :
              isPdf ? <iframe src={url} title={file.name} className="h-[60vh] w-full rounded-lg" /> :
              isImg ? <img src={url} alt={file.name} className="max-h-[60vh] w-auto rounded-lg" /> :
              (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <FileIcon className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No inline preview for this file type.</p>
                  <Button asChild><a href={url} target="_blank" rel="noreferrer"><Download className="h-4 w-4" />Download</a></Button>
                </div>
              )
            }
          </div>
          {meta && meta.length > 0 && (
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {meta.map((m) => (
                <div key={m.label}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</dt>
                  <dd className="font-medium">{m.value || "—"}</dd>
                </div>
              ))}
            </dl>
          )}
          {history}
        </div>
        <DialogFooter className="gap-2">
          {url && <Button variant="outline" asChild><a href={url} target="_blank" rel="noreferrer"><Download className="h-4 w-4" />Download</a></Button>}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
