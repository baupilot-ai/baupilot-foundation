import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  Home, FileText, AlertOctagon, Layers, CheckSquare,
  MoreHorizontal, UserCircle2, Settings, LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/branding/logo";

const CORE = [
  { key: "today", url: "/dashboard", icon: Home },
  { key: "report", url: "/report", icon: FileText },
  { key: "defects", url: "/defects", icon: AlertOctagon },
  { key: "plans", url: "/plans", icon: Layers },
  { key: "tasks", url: "/tasks", icon: CheckSquare },
  { key: "more", url: "/more", icon: MoreHorizontal },
] as const;

const MORE = [
  { key: "profile", url: "/profile", icon: UserCircle2 },
  { key: "settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-3 py-3.5">
        <div className={collapsed ? "flex justify-center" : ""}>
          {collapsed ? (
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              B
            </div>
          ) : (
            <Logo />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel>BauPilot</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CORE.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url) && (item.key === "today" || pathname === item.url)}
                    tooltip={t(`nav5.${item.key}`)}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold"
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{t(`nav5.${item.key}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="inline-flex items-center gap-1.5"><MoreHorizontal className="h-3 w-3" />{t("common.account")}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSub>
              {MORE.map((item) => (
                <SidebarMenuSubItem key={item.key}>
                  <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(`nav.${item.key}`)}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip={t("common.signOut")}>
              <LogOut />
              <span>{t("common.signOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
