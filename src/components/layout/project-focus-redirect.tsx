import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FolderPlus, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

type FocusProject = { id: string; name: string; site_address: string | null };

/**
 * Auto-redirects to the newest active project's tab, otherwise renders a picker.
 * Used by the 4 bottom-nav shortcuts: Bericht, Mängel, Pläne, Aufgaben.
 */
export function ProjectFocusRedirect({
  hash,
  headerKey,
}: {
  hash: "daily-reports" | "defects" | "plans" | "tasks";
  headerKey: "report" | "defects" | "plans" | "tasks";
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<FocusProject[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("id,name,site_address,current_status,archived_at,updated_at")
        .is("archived_at", null)
        .order("updated_at", { ascending: false });
      if (cancelled) return;
      const list = ((data ?? []) as unknown) as Array<FocusProject & { current_status: string }>;
      const active = list.filter((p) => p.current_status === "active");
      const pick = active[0] ?? list[0];
      if (pick) {
        navigate({
          to: "/projects/$projectId",
          params: { projectId: pick.id },
          hash,
          replace: true,
        });
        return;
      }
      setProjects(list);
    })();
    return () => { cancelled = true; };
  }, [navigate, hash]);

  if (projects === null) {
    return (
      <div className="mx-auto flex max-w-md items-center justify-center py-16 text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-10">
        <PageHeader title={t(`nav5.${headerKey}`)} />
        <div className="rounded-2xl border border-dashed border-border/70 bg-card p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <FolderPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">{t("picker.noActiveProject")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("picker.createFirst")}</p>
          <Button asChild className="mt-5">
            <Link to="/projects/new">{t("common.create")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-4">
      <PageHeader title={t("picker.chooseProject")} description={t("picker.chooseProjectDesc")} />
      <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card">
        {projects.map((p) => (
          <li key={p.id}>
            <Link
              to="/projects/$projectId"
              params={{ projectId: p.id }}
              hash={hash}
              className="flex items-center gap-3 px-4 py-4 hover:bg-muted/50 active:bg-muted"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-foreground">{p.name}</span>
                {p.address_city && (
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{p.address_city}</span>
                )}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
