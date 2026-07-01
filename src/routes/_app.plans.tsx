import { createFileRoute } from "@tanstack/react-router";
import { ProjectFocusRedirect } from "@/components/layout/project-focus-redirect";

export const Route = createFileRoute("/_app/plans")({
  ssr: false,
  head: () => ({ meta: [{ title: "Pläne — BauPilot" }] }),
  component: () => <ProjectFocusRedirect hash="plans" headerKey="plans" />,
});
