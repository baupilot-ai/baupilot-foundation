import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  FolderKanban,
  MoreVertical,
  Edit,
  Archive,
  ArchiveRestore,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  archiveProject,
  deleteProject,
  listProjects,
  getCoverSignedUrl,
  type ProjectRow,
} from "@/lib/projects";

export const Route = createFileRoute("/_app/projects/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Projects — BauPilot AI" },
      { name: "description", content: "All construction projects in your workspace." },
    ],
  }),
  component: ProjectsPage,
});

const statusTone: Record<string, "info" | "success" | "warning" | "neutral"> = {
  planning: "info",
  active: "success",
  on_hold: "warning",
  completed: "neutral",
};

function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"active" | "archived">("active");
  const [confirmDelete, setConfirmDelete] = useState<ProjectRow | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await listProjects({ archived: view === "archived" });
      setProjects(rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.current_status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.project_number.toLowerCase().includes(q) ||
        (p.client ?? "").toLowerCase().includes(q) ||
        (p.site_address ?? "").toLowerCase().includes(q)
      );
    });
  }, [projects, search, statusFilter]);

  async function onArchive(p: ProjectRow, archive: boolean) {
    try {
      await archiveProject(p.id, archive);
      toast.success(archive ? "Project archived" : "Project restored");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  async function onDelete() {
    if (!confirmDelete) return;
    try {
      await deleteProject(confirmDelete.id);
      toast.success("Project deleted");
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage all construction projects across your company."
        actions={
          <Button asChild>
            <Link to="/projects/new">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New project</span>
              <span className="sm:hidden">New</span>
            </Link>
          </Button>
        }
      />

      <Card className="border-border/70 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, number, client, address…"
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={view} onValueChange={(v) => setView(v as "active" | "archived")}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <Card className="border-border/70">
          <div className="flex items-center justify-center px-6 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-border/70">
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {view === "archived" ? "No archived projects" : "No projects yet"}
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              {view === "archived"
                ? "Archived projects will appear here."
                : "Create your first construction project to start organizing teams and sites."}
            </p>
            {view === "active" && (
              <Button asChild className="mt-2">
                <Link to="/projects/new">
                  <Plus className="h-4 w-4" />
                  Create project
                </Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onArchive={() => onArchive(p, !p.archived_at)}
              onDeleteRequest={() => setConfirmDelete(p)}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes “{confirmDelete?.name}” and all its data. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProjectCard({
  project,
  onArchive,
  onDeleteRequest,
}: {
  project: ProjectRow;
  onArchive: () => void;
  onDeleteRequest: () => void;
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (project.cover_image_url) {
      getCoverSignedUrl(project.cover_image_url).then(setCoverUrl);
    }
  }, [project.cover_image_url]);

  const tone = statusTone[project.current_status] ?? "neutral";
  const archived = !!project.archived_at;

  return (
    <Card className="group flex flex-col overflow-hidden border-border/70 transition hover:shadow-md">
      <button
        type="button"
        onClick={() => navigate({ to: "/projects/$projectId", params: { projectId: project.id } })}
        className="relative aspect-video w-full overflow-hidden bg-muted text-left"
      >
        {coverUrl ? (
          <img src={coverUrl} alt={project.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
            <FolderKanban className="h-10 w-10" />
          </div>
        )}
        {archived && (
          <div className="absolute left-3 top-3">
            <StatusBadge tone="neutral">Archived</StatusBadge>
          </div>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-mono text-muted-foreground">{project.project_number}</div>
            <Link
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              className="block truncate text-base font-semibold text-foreground hover:underline"
            >
              {project.name}
            </Link>
            {project.client && (
              <div className="truncate text-sm text-muted-foreground">{project.client}</div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/projects/$projectId/edit" params={{ projectId: project.id }}>
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive}>
                {archived ? (
                  <>
                    <ArchiveRestore className="h-4 w-4" />
                    Restore
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    Archive
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDeleteRequest} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <StatusBadge tone={tone}>{labelize(project.current_status)}</StatusBadge>
          {project.construction_phase && <span>· {project.construction_phase}</span>}
          {project.site_address && <span className="truncate">· {project.site_address}</span>}
        </div>
      </div>
    </Card>
  );
}

function labelize(s: string) {
  return s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
