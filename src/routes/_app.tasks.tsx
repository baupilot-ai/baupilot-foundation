import { createFileRoute } from "@tanstack/react-router";
import { ProjectFocusRedirect } from "@/components/layout/project-focus-redirect";

export const Route = createFileRoute("/_app/tasks")({
  ssr: false,
  head: () => ({ meta: [{ title: "Aufgaben — BauPilot" }] }),
  component: () => <ProjectFocusRedirect hash="tasks" headerKey="tasks" />,
});
