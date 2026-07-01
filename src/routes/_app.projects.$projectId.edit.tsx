import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ProjectWizard } from "@/components/projects/project-wizard";
import { getProject, updateProject, type ProjectRow } from "@/lib/projects";

export const Route = createFileRoute("/_app/projects/$projectId/edit")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Edit project — BauPilot AI" }],
  }),
  component: EditProjectPage,
});

function EditProjectPage() {
  const { projectId } = useParams({ from: "/_app/projects/$projectId/edit" });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProject(projectId)
      .then(setProject)
      .catch((e) => toast.error(e instanceof Error ? e.message : t("common.errorTitle")))
      .finally(() => setLoading(false));
  }, [projectId, t]);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link to="/projects/$projectId" params={{ projectId }}>
          <ArrowLeft className="h-4 w-4" />
          {t("projects.backToProject")}
        </Link>
      </Button>

      <PageHeader title={t("projects.editProject")} description={t("projects.editDescription")} />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !project ? (
        <p className="text-muted-foreground">{t("projects.notFound")}</p>
      ) : (
        <ProjectWizard
          initial={project}
          submitLabel={t("wizard.buttons.saveChanges")}
          onCancel={() => navigate({ to: "/projects/$projectId", params: { projectId } })}
          onSubmit={async (input) => {
            await updateProject(project.id, input);
            toast.success(t("projects.updated"));
            navigate({ to: "/projects/$projectId", params: { projectId } });
          }}
        />
      )}
    </div>
  );
}
