import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  FolderKanban, CalendarDays, ShieldCheck, Boxes, Users, Sparkles,
  Building2, UserCircle2, Settings, ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/_app/more")({
  ssr: false,
  head: () => ({ meta: [{ title: "Mehr — BauPilot" }] }),
  component: MoreScreen,
});

type Item = { to: string; icon: React.ComponentType<{ className?: string }>; key: string };

const WORKSPACE: Item[] = [
  { to: "/projects", icon: FolderKanban, key: "projects" },
];
const MANAGEMENT: Item[] = [
  { to: "/team", icon: Users, key: "team" },
  { to: "/resources", icon: Boxes, key: "resources" },
  { to: "/ai", icon: Sparkles, key: "ai" },
];
const ACCOUNT: Item[] = [
  { to: "/company", icon: Building2, key: "company" },
  { to: "/profile", icon: UserCircle2, key: "profile" },
  { to: "/settings", icon: Settings, key: "settings" },
];

function Section({ title, items }: { title: string; items: Item[] }) {
  const { t } = useTranslation();
  return (
    <section>
      <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </div>
      <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card">
        {items.map((it) => (
          <li key={it.key}>
            <Link
              to={it.to}
              className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50 active:bg-muted"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <it.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-foreground">
                  {t(`more.items.${it.key}`)}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {t(`more.items.${it.key}Desc`)}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MoreScreen() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <PageHeader title={t("more.title")} description={t("more.subtitle")} />
      <Section title={t("more.sections.workspace")} items={WORKSPACE} />
      <Section title={t("more.sections.management")} items={MANAGEMENT} />
      <Section title={t("more.sections.account")} items={ACCOUNT} />
    </div>
  );
}
