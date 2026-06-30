import { useEffect, useState } from "react";
import { Loader2, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { listActivity, type ActivityEntry } from "@/lib/site-modules";
import { toast } from "sonner";

const LABEL: Record<string, string> = {
  project: "Project", daily_report: "Daily report", task: "Task", defect: "Defect", photo: "Photo",
};
const ACTION_LABEL: Record<string, string> = {
  created: "Created", updated: "Updated", status_changed: "Status changed", uploaded: "Uploaded", archived: "Archived",
};

export function ActivityTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setItems(await listActivity(projectId)); }
      catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
      finally { setLoading(false); }
    })();
  }, [projectId]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  if (items.length === 0) {
    return (
      <Card className="border-dashed border-border/70 bg-muted/30">
        <CardContent className="flex flex-col items-center gap-2 px-6 py-16 text-center">
          <History className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No activity yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">Actions on this project will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70">
      <CardContent className="p-4">
        <ul className="space-y-4">
          {items.map((a) => (
            <li key={a.id} className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    {LABEL[a.entity_type] ?? a.entity_type} — {ACTION_LABEL[a.action] ?? a.action}
                  </p>
                  <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                </div>
                {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
