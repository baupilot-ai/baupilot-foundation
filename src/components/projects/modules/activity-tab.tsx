import { useEffect, useMemo, useState } from "react";
import { Filter, History, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  formatAuditAction,
  formatAuditEntity,
  listAuditEvents,
  type AuditAction,
  type AuditEvent,
} from "@/lib/audit-log";
import { toast } from "sonner";

const ACTIONS: Array<AuditAction | "all"> = [
  "all",
  "created",
  "updated",
  "status_changed",
  "uploaded",
  "archived",
  "restored",
  "deleted",
];

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  created: "default",
  uploaded: "default",
  status_changed: "secondary",
  updated: "outline",
  archived: "secondary",
  restored: "secondary",
  deleted: "destructive",
};

export function ActivityTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<AuditAction | "all">("all");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setItems(await listAuditEvents({ projectId, action, search: query, limit: 150 }));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load activity");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, action, query]);

  const entityTypes = useMemo(() => Array.from(new Set(items.map((a) => a.entity_type))).sort(), [items]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/70">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activity..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {ACTIONS.map((a) => (
              <Button
                key={a}
                size="sm"
                variant={action === a ? "default" : "outline"}
                onClick={() => setAction(a)}
              >
                {a === "all" ? "All" : formatAuditAction(a)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <History className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No activity yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Project actions will appear here after users create, update, upload or delete data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/70">
          <CardContent className="p-4">
            <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {entityTypes.map((type) => (
                <span key={type} className="rounded-md border px-2 py-1">
                  {formatAuditEntity(type)}
                </span>
              ))}
            </div>
            <ul className="space-y-4">
              {items.map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{formatAuditEntity(a.entity_type)}</p>
                        <Badge variant={ACTION_VARIANT[a.action] ?? "outline"}>{formatAuditAction(a.action)}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleString()}
                      </span>
                    </div>
                    {a.summary && <p className="text-sm text-muted-foreground">{a.summary}</p>}
                    {a.changed_fields.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Changed: {a.changed_fields.slice(0, 8).join(", ")}
                        {a.changed_fields.length > 8 ? " …" : ""}
                      </p>
                    )}
                    {a.actor_id && <p className="text-xs text-muted-foreground">Actor: {a.actor_id}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
