import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Edit, Archive, ArchiveRestore, Trash2, Loader2, MapPin, Calendar, Euro, FolderKanban } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
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
  getCoverSignedUrl,
  getProject,
  type ProjectRow,
} from "@/lib/projects";

export const Route = createFileRoute("/_app/projects/$projectId")({
  ssr: false,
  component: ProjectDetail,
});

const statusTone: Record<string, "info" | "success" | "warning" | "neutral"> = {
  planning: "info",
  active: "success",
  on_hold: "warning",
  completed: "neutral",
};

function ProjectDetail() {
  const { projectId } = useParams({ from: "/_app/projects/$projectId" });
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getProject(projectId)
      .then((p) => {
        setProject(p);
        if (p?.cover_image_url) getCoverSignedUrl(p.cover_image_url).then(setCoverUrl);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/projects">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Card className="border-border/70 p-8 text-center">
          <p className="text-muted-foreground">Project not found.</p>
        </Card>
      </div>
    );
  }

  async function onArchive() {
    if (!project) return;
    await archiveProject(project.id, !project.archived_at);
    toast.success(project.archived_at ? "Restored" : "Archived");
    const fresh = await getProject(project.id);
    setProject(fresh);
  }

  async function onDelete() {
    if (!project) return;
    await deleteProject(project.id);
    toast.success("Deleted");
    navigate({ to: "/projects" });
  }

  const tone = statusTone[project.current_status] ?? "neutral";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link to="/projects">
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
      </Button>

      <Card className="overflow-hidden border-border/70">
        <div className="relative aspect-[3/1] w-full bg-muted sm:aspect-[4/1]">
          {coverUrl ? (
            <img src={coverUrl} alt={project.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
              <FolderKanban className="h-12 w-12" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="min-w-0">
            <div className="font-mono text-xs text-muted-foreground">{project.project_number}</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{project.name}</h1>
            {project.client && <p className="text-muted-foreground">{project.client}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge tone={tone}>{labelize(project.current_status)}</StatusBadge>
              {project.archived_at && <StatusBadge tone="neutral">Archived</StatusBadge>}
              {project.construction_phase && (
                <span className="text-sm text-muted-foreground">· {project.construction_phase}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/projects/$projectId/edit" params={{ projectId: project.id }}>
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" onClick={onArchive}>
              {project.archived_at ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              {project.archived_at ? "Restore" : "Archive"}
            </Button>
            <Button variant="outline" onClick={() => setConfirmDelete(true)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.description && <p className="text-sm leading-relaxed">{project.description}</p>}
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Detail icon={MapPin} label="Site address" value={project.site_address} />
              <Detail
                label="GPS"
                value={
                  project.gps_lat != null && project.gps_lng != null
                    ? `${project.gps_lat}, ${project.gps_lng}`
                    : null
                }
              />
              <Detail label="Type" value={project.project_type} />
              <Detail label="Category" value={project.building_category} />
              <Detail icon={Calendar} label="Planned start" value={project.planned_start} />
              <Detail icon={Calendar} label="Planned finish" value={project.planned_finish} />
              <Detail
                icon={Euro}
                label="Contract value"
                value={project.contract_value != null ? `€ ${project.contract_value.toLocaleString()}` : null}
              />
            </dl>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <Detail label="Project manager" value={project.project_manager} />
              <Detail label="Site manager" value={project.site_manager} />
              <Detail label="Foreman" value={project.foreman} />
              <Detail label="Safety manager" value={project.safety_manager} />
            </dl>
          </CardContent>
        </Card>

        <Card className="border-border/70 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">External contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Detail label="Client contact" value={project.client_contact} />
              <Detail label="Architect" value={project.architect} />
              <Detail label="Structural engineer" value={project.structural_engineer} />
              <Detail label="MEP engineer" value={project.mep_engineer} />
            </dl>
          </CardContent>
        </Card>

        {project.notes && (
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{project.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes “{project.name}”. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Detail({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}

function labelize(s: string) {
  return s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
