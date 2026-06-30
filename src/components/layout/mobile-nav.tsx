import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, FolderKanban, Boxes, Users2, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  const items = [
    { title: t("nav.home"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("nav.projects"), url: "/projects", icon: FolderKanban },
    { title: t("nav.resources"), url: "/resources", icon: Boxes },
    { title: t("nav.team"), url: "/team", icon: Users2 },
    { title: t("nav.profile"), url: "/profile", icon: UserCircle2 },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => {
          const active = isActive(item.url);
          return (
            <li key={item.url}>
              <Link
                to={item.url}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "stroke-[2.4]")} />
                <span className="truncate">{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
