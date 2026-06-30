import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Edit, Archive, ArchiveRestore, Trash2, Loader2, MapPin, Calendar, Euro,
  FolderKanban, History, Users, Wallet, CalendarDays, CheckSquare, AlertOctagon, Camera, FileText, Layers, UserSquare,
  Hammer, Package, Truck, BarChart3, Flag, Bell, CalendarRange,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  archiveProject, deleteProject, getCoverSignedUrl, getProject, updateProjectStatus,
  STATUS_OPTIONS, STATUS_TONE, statusLabel,
  type ProjectRow, type ProjectStatus,
} from "@/lib/projects";
import { DailyReportsTab } from "@/components/projects/modules/daily-reports-tab";
import { TasksTab } from "@/components/projects/modules/tasks-tab";
import { DefectsTab } from "@/components/projects/modules/defects-tab";
import { PhotosTab } from "@/components/projects/modules/photos-tab";
import { ActivityTab } from "@/components/projects/modules/activity-tab";
import { DocumentsTab } from "@/components/projects/modules/documents-tab";
import { PlansTab } from "@/components/projects/modules/plans-tab";
import { ProjectTeamTab } from "@/components/projects/modules/project-team-tab";
import { ProjectContactsTab } from "@/components/projects/modules/project-contacts-tab";
import { ProjectMaterialsTab } from "@/components/projects/modules/project-materials-tab";
import { EquipmentTab } from "@/components/resources/equipment-tab";
import { DeliveriesTab } from "@/components/resources/deliveries-tab";
import { ProjectQuickStats } from "@/components/projects/modules/quick-stats";
import { ScheduleTab } from "@/components/projects/modules/schedule-tab";
import { MilestonesTab } from "@/components/projects/modules/milestones-tab";
import { CalendarTab } from "@/components/projects/modules/calendar-tab";
import { GanttTab } from "@/components/projects/modules/gantt-tab";
import { NotificationsTab } from "@/components/projects/modules/notifications-tab";
import { ProjectPlanningCards } from "@/components/projects/modules/planning-cards";

export const Route = createFileRoute("/_app/projects/$projectId/")({
  ssr: false,
  component: ProjectDetail,
});

function ProjectDetail() {
  const { projectId } = useParams({ from: "/_app/projects/$projectId/" });
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function load() {
    const p = await getProject(projectId);
    setProject(p);
    if (p?.cover_image_url) getCoverSignedUrl(p.cover_image_url).then(setCoverUrl);
    else setCoverUrl(null);
  }

  useEffect(() => {
    setLoading(true);
    load()
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Link to="/projects"><ArrowLeft className="h-4 w-4" />Back</Link>
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
    await load();
  }

  async function onDelete() {
    if (!project) return;
    await deleteProject(project.id);
    toast.success("Deleted");
    navigate({ to: "/projects" });
  }

  async function onStatusChange(status: ProjectStatus) {
    if (!project) return;
    try {
      await updateProjectStatus(project.id, status);
      toast.success("Status updated");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  const tone = STATUS_TONE[project.current_status] ?? "neutral";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link to="/projects"><ArrowLeft className="h-4 w-4" />Back to projects</Link>
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
              <StatusBadge tone={tone}>{statusLabel(project.current_status)}</StatusBadge>
              {project.archived_at && <StatusBadge tone="neutral">Archived</StatusBadge>}
              {project.construction_phase && (
                <span className="text-sm text-muted-foreground">· {project.construction_phase}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="w-full sm:w-auto">
              <Select value={project.current_status} onValueChange={(v) => onStatusChange(v as ProjectStatus)}>
                <SelectTrigger className="w-full sm:w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button asChild>
              <Link to="/projects/$projectId/edit" params={{ projectId: project.id }}>
                <Edit className="h-4 w-4" />Edit
              </Link>
            </Button>
            <Button variant="outline" onClick={onArchive}>
              {project.archived_at ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              {project.archived_at ? "Restore" : "Archive"}
            </Button>
            <Button variant="outline" onClick={() => setConfirmDelete(true)} className="text-destructive">
              <Trash2 className="h-4 w-4" />Delete
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="overview"><FolderKanban className="h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="daily"><CalendarDays className="h-4 w-4" />Daily Reports</TabsTrigger>
            <TabsTrigger value="tasks"><CheckSquare className="h-4 w-4" />Tasks</TabsTrigger>
            <TabsTrigger value="defects"><AlertOctagon className="h-4 w-4" />Defects</TabsTrigger>
            <TabsTrigger value="photos"><Camera className="h-4 w-4" />Photos</TabsTrigger>
            <TabsTrigger value="documents"><FileText className="h-4 w-4" />Documents</TabsTrigger>
            <TabsTrigger value="plans"><Layers className="h-4 w-4" />Plans</TabsTrigger>
            <TabsTrigger value="team"><Users className="h-4 w-4" />Team</TabsTrigger>
            <TabsTrigger value="contacts"><UserSquare className="h-4 w-4" />Contacts</TabsTrigger>
            <TabsTrigger value="equipment"><Hammer className="h-4 w-4" />Equipment</TabsTrigger>
            <TabsTrigger value="materials"><Package className="h-4 w-4" />Materials</TabsTrigger>
            <TabsTrigger value="deliveries"><Truck className="h-4 w-4" />Deliveries</TabsTrigger>
            <TabsTrigger value="calendar"><CalendarRange className="h-4 w-4" />Calendar</TabsTrigger>
            <TabsTrigger value="schedule"><BarChart3 className="h-4 w-4" />Schedule</TabsTrigger>
            <TabsTrigger value="milestones"><Flag className="h-4 w-4" />Milestones</TabsTrigger>
            <TabsTrigger value="gantt"><BarChart3 className="h-4 w-4" />Gantt</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="h-4 w-4" />Notifications</TabsTrigger>
            <TabsTrigger value="timeline"><Calendar className="h-4 w-4" />Timeline</TabsTrigger>
            <TabsTrigger value="financials"><Wallet className="h-4 w-4" />Financials</TabsTrigger>
            <TabsTrigger value="activity"><History className="h-4 w-4" />Activity</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <ProjectQuickStats projectId={project.id} />
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-border/70 lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Project information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {project.description && <p className="text-sm leading-relaxed">{project.description}</p>}
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  <Detail icon={MapPin} label="Site address" value={project.site_address} />
                  <Detail label="GPS" value={project.gps_lat != null && project.gps_lng != null ? `${project.gps_lat}, ${project.gps_lng}` : null} />
                  <Detail label="Type" value={project.project_type} />
                  <Detail label="Category" value={project.building_category} />
                  <Detail label="Phase" value={project.construction_phase} />
                  <Detail label="Status" value={statusLabel(project.current_status)} />
                </dl>
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardHeader><CardTitle className="text-base">Key dates</CardTitle></CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <Detail icon={Calendar} label="Planned start" value={project.planned_start} />
                  <Detail icon={Calendar} label="Planned finish" value={project.planned_finish} />
                  <Detail icon={Calendar} label="Actual start" value={project.actual_start} />
                  <Detail icon={Calendar} label="Actual finish" value={project.actual_finish} />
                </dl>
              </CardContent>
            </Card>
            {project.notes && (
              <Card className="border-border/70 lg:col-span-3">
                <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{project.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="daily"><DailyReportsTab projectId={project.id} /></TabsContent>
        <TabsContent value="tasks"><TasksTab projectId={project.id} /></TabsContent>
        <TabsContent value="defects"><DefectsTab projectId={project.id} /></TabsContent>
        <TabsContent value="photos"><PhotosTab projectId={project.id} /></TabsContent>
        <TabsContent value="documents"><DocumentsTab projectId={project.id} /></TabsContent>
        <TabsContent value="plans"><PlansTab projectId={project.id} /></TabsContent>



        <TabsContent value="team"><ProjectTeamTab projectId={project.id} /></TabsContent>
        <TabsContent value="contacts"><ProjectContactsTab projectId={project.id} /></TabsContent>
        <TabsContent value="equipment"><EquipmentTab projectId={project.id} /></TabsContent>
        <TabsContent value="materials"><ProjectMaterialsTab projectId={project.id} /></TabsContent>
        <TabsContent value="deliveries"><DeliveriesTab projectId={project.id} /></TabsContent>



        <TabsContent value="timeline" className="space-y-4">
          <Card className="border-border/70">
            <CardHeader><CardTitle className="text-base">Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <Detail icon={Calendar} label="Planned start" value={project.planned_start} />
                <Detail icon={Calendar} label="Planned finish" value={project.planned_finish} />
                <Detail icon={Calendar} label="Actual start" value={project.actual_start} />
                <Detail icon={Calendar} label="Actual finish" value={project.actual_finish} />
              </dl>
              <TimelineSummary project={project} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <Card className="border-border/70">
            <CardHeader><CardTitle className="text-base">Contract</CardTitle></CardHeader>
            <CardContent>
              <Detail
                icon={Euro}
                label="Contract value"
                value={project.contract_value != null ? `€ ${project.contract_value.toLocaleString()}` : null}
              />
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Costs", desc: "Track committed and actual costs once budgets are introduced." },
              { title: "Invoices", desc: "Issued and received invoices will appear here." },
              { title: "Change orders", desc: "Variations and approvals against the contract." },
            ].map((c) => (
              <Card key={c.title} className="border-dashed border-border/70 bg-muted/30">
                <CardHeader><CardTitle className="text-sm">{c.title}</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">{c.desc}</CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity"><ActivityTab projectId={project.id} /></TabsContent>
      </Tabs>

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
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TimelineSummary({ project }: { project: ProjectRow }) {
  const now = new Date();
  const finish = project.planned_finish ? new Date(project.planned_finish) : null;
  const start = project.planned_start ? new Date(project.planned_start) : null;
  let daysRemaining: number | null = null;
  let totalDays: number | null = null;
  if (finish) daysRemaining = Math.ceil((finish.getTime() - now.getTime()) / 86400000);
  if (start && finish) totalDays = Math.ceil((finish.getTime() - start.getTime()) / 86400000);

  let indicator: { tone: "info" | "success" | "warning" | "neutral"; label: string } = {
    tone: "neutral",
    label: "No schedule data",
  };
  if (project.current_status === "completed") indicator = { tone: "success", label: "Completed" };
  else if (daysRemaining != null) {
    if (daysRemaining < 0) indicator = { tone: "warning", label: `${Math.abs(daysRemaining)} days overdue` };
    else if (daysRemaining <= 14) indicator = { tone: "warning", label: `${daysRemaining} days remaining` };
    else indicator = { tone: "info", label: `${daysRemaining} days remaining` };
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-muted/40 p-4 text-sm">
      <StatusBadge tone={indicator.tone}>{indicator.label}</StatusBadge>
      {totalDays != null && (
        <span className="text-muted-foreground">Total planned duration: {totalDays} days</span>
      )}
    </div>
  );
}


function Detail({
  label, value, icon: Icon,
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
