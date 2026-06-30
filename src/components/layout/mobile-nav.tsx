import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, Users2, Building2, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Team", url: "/team", icon: Users2 },
  { title: "Company", url: "/company", icon: Building2 },
  { title: "Profile", url: "/profile", icon: UserCircle2 },
];

export function MobileNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => {
          const active = isActive(item.url);
          return (
            <li key={item.title}>
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
