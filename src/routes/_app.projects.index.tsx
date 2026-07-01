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
  AlertCircle,
  Calendar,
  Euro,
  HardHat,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
  CONSTRUCTION_PHASES,
  STATUS_TONE,
  type ProjectRow,
} from "@/lib/projects";
import { formatCurrency, formatDate } from "@/lib/i18n";

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

type SortKey = "updated" | "name" | "finish";

function ProjectsPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [view, setView] = useState<"active" | "archived">("active");
  const [confirmDelete, setConfirmDelete] = useState<ProjectRow | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const rows = await listProjects({ archived: view === "archived" });
      setProjects(rows);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("common.errorTitle");
      setError(msg);
      toast.error(msg);
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
    const list = projects.filter((p) => {
      if (statusFilter !== "all" && p.current_status !== statusFilter) return false;
      if (phaseFilter !== "all" && p.construction_phase !== phaseFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.project_number.toLowerCase().includes(q) ||
        (p.client ?? "").toLowerCase().includes(q) ||
        (p.site_address ?? "").toLowerCase().includes(q)
      );
    });
    const sorted = [...list];
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "finish")
      sorted.sort((a, b) => (a.planned_finish ?? "9999").localeCompare(b.planned_finish ?? "9999"));
    return sorted;
  }, [projects, search, statusFilter, phaseFilter, sort]);

  async function onArchive(p: ProjectRow, archive: boolean) {
    try {
      await archiveProject(p.id, archive);
      toast.success(archive ? t("projects.archived") : t("projects.restored"));
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.failed"));
    }
  }

  async function onDelete() {
    if (!confirmDelete) return;
    try {
      await deleteProject(confirmDelete.id);
      toast.success(t("projects.deleted"));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.failed"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("projects.title")}
        description={t("projects.manageSubtitle")}
        actions={
          <Button asChild>
            <Link to="/projects/new">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("projects.newProject")}</span>
              <span className="sm:hidden">{t("projects.new")}</span>
            </Link>
          </Button>
        }
      />

      <Card className="border-border/70 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_repeat(4,auto)]">
          <div className="relative lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("projects.searchPlaceholder")}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("projects.filters.allStatuses")}</SelectItem>
              <SelectItem value="planned">{t("projects.status.planned")}</SelectItem>
              <SelectItem value="active">{t("projects.status.active")}</SelectItem>
              <SelectItem value="on_hold">{t("projects.status.on_hold")}</SelectItem>
              <SelectItem value="completed">{t("projects.status.completed")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="w-full lg:w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("projects.filters.allPhases")}</SelectItem>
              {CONSTRUCTION_PHASES.map((p) => (
                <SelectItem key={p} value={p}>{t(`projects.phases.${p}`, { defaultValue: p })}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-full lg:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">{t("projects.filters.sortUpdated")}</SelectItem>
              <SelectItem value="name">{t("projects.filters.sortName")}</SelectItem>
              <SelectItem value="finish">{t("projects.filters.sortFinish")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={view} onValueChange={(v) => setView(v as "active" | "archived")}>
            <SelectTrigger className="w-full lg:w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t("projects.filters.viewActive")}</SelectItem>
              <SelectItem value="archived">{t("projects.filters.viewArchived")}</SelectItem>
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
      ) : error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={refresh}>{t("common.tryAgain")}</Button>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-border/70">
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {view === "archived" ? t("projects.emptyArchived") : t("projects.empty")}
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              {view === "archived"
                ? t("projects.emptyArchivedDesc")
                : t("projects.createFirst")}
            </p>
            {view === "active" && (
              <Button asChild className="mt-2">
                <Link to="/projects/new"><Plus className="h-4 w-4" />{t("projects.createProject")}</Link>
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
            <AlertDialogTitle>{t("projects.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("projects.deleteConfirmDesc", { name: confirmDelete?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProjectCard({
  project, onArchive, onDeleteRequest,
}: {
  project: ProjectRow;
  onArchive: () => void;
  onDeleteRequest: () => void;
}) {
  const { t } = useTranslation();
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (project.cover_image_url) getCoverSignedUrl(project.cover_image_url).then(setCoverUrl);
  }, [project.cover_image_url]);

  const tone = STATUS_TONE[project.current_status] ?? "neutral";
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
        <div className="absolute left-3 top-3 flex gap-2">
          <StatusBadge tone={tone}>{t(`projects.status.${project.current_status}`, { defaultValue: project.current_status })}</StatusBadge>
          {archived && <StatusBadge tone="neutral">{t("projects.archivedBadge")}</StatusBadge>}
        </div>
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
            {project.client && <div className="truncate text-sm text-muted-foreground">{project.client}</div>}
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
                  <Edit className="h-4 w-4" />{t("projects.actions.edit")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive}>
                {archived ? <><ArchiveRestore className="h-4 w-4" />{t("projects.actions.restore")}</> : <><Archive className="h-4 w-4" />{t("projects.actions.archive")}</>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDeleteRequest} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4" />{t("projects.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
          {project.construction_phase && (
            <Meta icon={FolderKanban} label={t(`projects.phases.${project.construction_phase}`, { defaultValue: project.construction_phase })} />
          )}
          {project.planned_finish && (
            <Meta icon={Calendar} label={t("projects.card.finish", { date: formatDate(project.planned_finish) })} />
          )}
          {project.site_manager && <Meta icon={User} label={t("projects.card.site", { name: project.site_manager })} />}
          {project.foreman && <Meta icon={HardHat} label={t("projects.card.foreman", { name: project.foreman })} />}
          {project.contract_value != null && (
            <Meta icon={Euro} label={formatCurrency(project.contract_value)} />
          )}
        </div>
      </div>
    </Card>
  );
}

function Meta({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <span className="flex items-center gap-1.5 truncate">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  );
}
