import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Home, FileText, AlertOctagon, Layers, CheckSquare, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { key: "today", url: "/dashboard", icon: Home },
  { key: "report", url: "/report", icon: FileText },
  { key: "defects", url: "/defects", icon: AlertOctagon },
  { key: "plans", url: "/plans", icon: Layers },
  { key: "tasks", url: "/tasks", icon: CheckSquare },
  { key: "more", url: "/more", icon: MoreHorizontal },
] as const;

export function MobileNav() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-6">
        {ITEMS.map((item) => {
          const active = isActive(item.url);
          return (
            <li key={item.key}>
              <Link
                to={item.url}
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
