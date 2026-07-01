import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText, Camera, AlertOctagon, Layers, CheckSquare,
  MapPin, Cloud, CloudRain, CloudSnow, Sun, CloudSun, CloudFog, CloudLightning,
  ArrowRight, Wind, Droplets,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, profileDisplayName } from "@/hooks/use-profile";
import { useDailyReportWeather, type ProjectLocation } from "@/hooks/use-daily-report-weather";
import { getAppLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Heute — BauPilot" },
      { name: "description", content: "Der Morgen des Poliers auf einen Blick." },
    ],
  }),
  component: HeuteScreen,
});

// --- helpers -----------------------------------------------------------------

function greetingKey(d: Date): "morning" | "afternoon" | "evening" | "night" {
  const h = d.getHours();
  if (h < 5) return "night";
  if (h < 11) return "morning";
  if (h < 17) return "afternoon";
  if (h < 22) return "evening";
  return "night";
}

function weatherIcon(condition: string | null) {
  const c = (condition ?? "").toLowerCase();
  if (c.includes("gewitter") || c.includes("thunder")) return CloudLightning;
  if (c.includes("schnee") || c.includes("snow")) return CloudSnow;
  if (c.includes("regen") || c.includes("rain") || c.includes("niesel")) return CloudRain;
  if (c.includes("nebel") || c.includes("fog")) return CloudFog;
  if (c.includes("bewölkt") || c.includes("cloud")) return c.includes("leicht") || c.includes("part") ? CloudSun : Cloud;
  return Sun;
}

interface HomeProject {
  id: string;
  name: string;
  address_street: string | null;
  address_city: string | null;
  location_lat: number | null;
  location_lng: number | null;
}

function useHomeContext() {
  const [project, setProject] = useState<HomeProject | null>(null);
  const [openTasks, setOpenTasks] = useState(0);
  const [openDefects, setOpenDefects] = useState(0);
  const [reportToday, setReportToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: proj } = await supabase
        .from("projects")
        .select("id,name,address_street,address_city,location_lat,location_lng,current_status,archived_at,updated_at")
        .is("archived_at", null)
        .eq("current_status", "active")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      const p = proj as HomeProject | null;
      setProject(p);

      const today = new Date().toISOString().slice(0, 10);
      const projectFilter = p ? { column: "project_id", value: p.id } : null;

      const [tk, df, dr] = await Promise.all([
        projectFilter
          ? supabase.from("tasks").select("id", { count: "exact", head: true }).eq(projectFilter.column, projectFilter.value).neq("status", "done")
          : supabase.from("tasks").select("id", { count: "exact", head: true }).neq("status", "done"),
        projectFilter
          ? supabase.from("defects").select("id", { count: "exact", head: true }).eq(projectFilter.column, projectFilter.value).not("status", "in", '("accepted","rejected","fixed")')
          : supabase.from("defects").select("id", { count: "exact", head: true }).not("status", "in", '("accepted","rejected","fixed")'),
        p
          ? supabase.from("daily_reports").select("id", { count: "exact", head: true }).eq("project_id", p.id).eq("report_date", today)
          : Promise.resolve({ count: 0 } as { count: number | null }),
      ]);

      if (cancelled) return;
      setOpenTasks(tk.count ?? 0);
      setOpenDefects(df.count ?? 0);
      setReportToday((dr.count ?? 0) > 0);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { project, openTasks, openDefects, reportToday, loading };
}

// --- screen ------------------------------------------------------------------

function HeuteScreen() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const firstName = (profileDisplayName(profile) || "").split(" ")[0];
  const { project, openTasks, openDefects, reportToday, loading } = useHomeContext();

  const now = useMemo(() => new Date(), []);
  const lang = getAppLanguage();
  const locale = lang === "de" ? "de-DE" : "en-US";
  const weekday = now.toLocaleDateString(locale, { weekday: "long" });
  const dateLong = now.toLocaleDateString(locale, { day: "2-digit", month: "long" });

  const location: ProjectLocation = { lat: project?.location_lat, lng: project?.location_lng };
  const { data: weather, loading: weatherLoading, load: loadWeather } = useDailyReportWeather(
    now.toISOString().slice(0, 10),
    location,
  );

  useEffect(() => {
    if (!loading) void loadWeather(now.toISOString().slice(0, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, project?.id]);

  const WIcon = weatherIcon(weather?.condition ?? null);
  const greetLine = firstName
    ? t("heute.greetingName", { greeting: t(`heute.${greetingKey(now)}`), name: firstName })
    : t(`heute.${greetingKey(now)}`);

  const projectTarget = project ? { to: "/projects/$projectId", params: { projectId: project.id } } : { to: "/projects" };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-4">
      {/* Hero */}
      <section className="surface-hero rounded-2xl border border-border/60 p-6 shadow-sm sm:p-8">
        <div className="text-[13px] font-medium uppercase tracking-[0.14em] text-primary/80">
          {weekday}, {dateLong}
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {greetLine}
        </h1>

        {/* Weather + Project row */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Weather */}
          <div className="rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                <WIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                {weatherLoading ? (
                  <div className="text-sm text-muted-foreground">{t("heute.loadingWeather")}</div>
                ) : weather ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold tracking-tight text-foreground">
                        {weather.noonTemp != null ? Math.round(weather.noonTemp) : "–"}°
                      </span>
                      <span className="truncate text-sm text-muted-foreground">{weather.condition}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      {weather.windSpeed != null && (
                        <span className="inline-flex items-center gap-1"><Wind className="h-3 w-3" />{Math.round(weather.windSpeed)} km/h</span>
                      )}
                      {weather.precipitationMm != null && (
                        <span className="inline-flex items-center gap-1"><Droplets className="h-3 w-3" />{weather.precipitationMm} mm</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">{t("heute.noWeather")}</div>
                )}
              </div>
            </div>
          </div>

          {/* Project */}
          <Link
            {...(projectTarget as { to: string })}
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur transition-colors hover:border-primary/40"
          >
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("heute.project")}</div>
              <div className="mt-0.5 truncate text-base font-semibold text-foreground">
                {project?.name ?? t("heute.noProject")}
              </div>
              {(project?.address_street || project?.address_city) && (
                <div className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {[project?.address_street, project?.address_city].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Today status pill row */}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <StatusPill
            tone={reportToday ? "success" : "warning"}
            label={reportToday ? t("heute.reportSubmitted") : t("heute.reportMissing")}
          />
          <StatusPill tone={openTasks > 0 ? "info" : "neutral"} label={`${openTasks} ${t("heute.openTasks")}`} />
          <StatusPill tone={openDefects > 0 ? "danger" : "neutral"} label={`${openDefects} ${t("heute.openDefects")}`} />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t("heute.quickActions")}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <QuickAction
            to={project ? `/projects/${project.id}` : "/projects"}
            hash={project ? "daily-reports" : undefined}
            icon={FileText}
            label={t("heute.actions.dailyReport")}
            emphasis={!reportToday}
          />
          <QuickAction
            to={project ? `/projects/${project.id}` : "/projects"}
            hash={project ? "photos" : undefined}
            icon={Camera}
            label={t("heute.actions.photo")}
          />
          <QuickAction
            to={project ? `/projects/${project.id}` : "/projects"}
            hash={project ? "defects" : undefined}
            icon={AlertOctagon}
            label={t("heute.actions.defect")}
          />
          <QuickAction
            to={project ? `/projects/${project.id}` : "/projects"}
            hash={project ? "plans" : undefined}
            icon={Layers}
            label={t("heute.actions.plan")}
          />
          <QuickAction
            to={project ? `/projects/${project.id}` : "/projects"}
            hash={project ? "tasks" : undefined}
            icon={CheckSquare}
            label={t("heute.actions.task")}
            className="col-span-2 sm:col-span-1"
          />
        </div>
      </section>

      {/* Continue action */}
      {project && (
        <div className="pt-2">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/projects/$projectId" params={{ projectId: project.id }}>
              {project.name}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

// --- small pieces ------------------------------------------------------------

function StatusPill({ tone, label }: { tone: "success" | "warning" | "danger" | "info" | "neutral"; label: string }) {
  const map: Record<string, string> = {
    success: "bg-success/10 text-success ring-success/20",
    warning: "bg-warning/15 text-warning-foreground ring-warning/30",
    danger: "bg-destructive/10 text-destructive ring-destructive/20",
    info: "bg-info/10 text-info ring-info/20",
    neutral: "bg-muted text-muted-foreground ring-border",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", map[tone])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function QuickAction({
  to, hash, icon: Icon, label, emphasis, className,
}: {
  to: string;
  hash?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  emphasis?: boolean;
  className?: string;
}) {
  const href = hash ? `${to}#${hash}` : to;
  return (
    <a
      href={href}
      className={cn(
        "card-interactive group relative flex min-h-[112px] flex-col justify-between rounded-2xl border p-4 text-left",
        emphasis
          ? "border-primary/40 bg-primary text-primary-foreground shadow-[var(--shadow-primary)]"
          : "border-border/60 bg-card text-foreground",
        className,
      )}
    >
      <div
        className={cn(
          "grid h-10 w-10 place-items-center rounded-xl",
          emphasis ? "bg-primary-foreground/15 text-primary-foreground" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-[15px] font-semibold leading-tight">{label}</span>
        <ArrowRight
          className={cn(
            "h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5",
            emphasis ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        />
      </div>
    </a>
  );
}
