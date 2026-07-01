import { createFileRoute } from "@tanstack/react-router";
import { ProjectFocusRedirect } from "@/components/layout/project-focus-redirect";

export const Route = createFileRoute("/_app/defects")({
  ssr: false,
  head: () => ({ meta: [{ title: "Mängel — BauPilot" }] }),
  component: () => <ProjectFocusRedirect hash="defects" headerKey="defects" />,
});
