import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { Sparkles, MessageSquare, FileText, ListChecks, ClipboardList, BarChart3, Search, ShieldAlert, BookOpen, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ai")({
  component: AICenterLayout,
});

type Tab = { to: string; label: string; icon: typeof MessageSquare; exact?: boolean };
const tabs: Tab[] = [
  { to: "/ai", label: "Chat", icon: MessageSquare, exact: true },
  { to: "/ai/daily-report", label: "Bautagesbericht", icon: FileText },
  { to: "/ai/task", label: "Aufgabe", icon: ListChecks },
  { to: "/ai/protocol", label: "Protokoll", icon: ClipboardList },
  { to: "/ai/summary", label: "Zusammenfassung", icon: BarChart3 },
  { to: "/ai/search", label: "Suche", icon: Search },
  { to: "/ai/risk", label: "Risiko", icon: ShieldAlert },
  { to: "/ai/knowledge", label: "Wissen", icon: BookOpen },
  { to: "/ai/settings", label: "Einstellungen", icon: Settings2 },
];

function AICenterLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">AI Center</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Künstliche Intelligenz für Bauunternehmen</p>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1 rounded-lg border bg-card p-1">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.to : pathname === t.to || pathname.startsWith(t.to + "/");
            return (
              <Link
                key={t.to}
                to={t.to as "/ai"}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      <Outlet />
    </div>
  );
}
