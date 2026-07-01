import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Home, FileText, AlertOctagon, Layers, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { key: "today", url: "/dashboard", icon: Home },
  { key: "report", url: "/projects", icon: FileText, hash: "daily-reports" },
  { key: "defects", url: "/projects", icon: AlertOctagon, hash: "defects" },
  { key: "plans", url: "/projects", icon: Layers, hash: "plans" },
  { key: "tasks", url: "/projects", icon: CheckSquare, hash: "tasks" },
] as const;

export function MobileNav() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map((item) => {
          const active = isActive(item.url) && (item.key === "today" || pathname === item.url);
          const href = "hash" in item && item.hash ? `${item.url}#${item.hash}` : item.url;
          return (
            <li key={item.key}>
              <Link
                to={href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-1 pb-2 pt-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl transition-colors",
                    active ? "bg-primary/10" : "",
                  )}
                >
                  <item.icon className={cn("h-[22px] w-[22px]", active && "stroke-[2.3]")} />
                </span>
                <span className="truncate">{t(`nav5.${item.key}`)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
