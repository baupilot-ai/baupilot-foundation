import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ProjectWizard } from "@/components/projects/project-wizard";
import { createProject } from "@/lib/projects";

export const Route = createFileRoute("/_app/projects/new")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "New project — BauPilot AI" },
      { name: "description", content: "Create a new construction project." },
    ],
  }),
  component: NewProjectPage,
});

function NewProjectPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link to="/projects">
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
      </Button>

      <PageHeader
        title="New project"
        description="Set up a new construction project in your workspace."
      />

      <ProjectWizard
        onCancel={() => navigate({ to: "/projects" })}
        onSubmit={async (input) => {
          const row = await createProject(input);
          toast.success("Project created");
          navigate({ to: "/projects/$projectId", params: { projectId: row.id } });
        }}
      />
    </div>
  );
}
