import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Users2,
  UserCircle2,
  Settings,
  LogOut,
  HelpCircle,
  Boxes,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/branding/logo";
import { usePermissions } from "@/hooks/use-permissions";
import { type Permission } from "@/lib/security/permissions";

export function AppSidebar() {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const mainItems: Array<{ title: string; url: string; icon: typeof LayoutDashboard; permission: Permission }> = [
    { title: t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard, permission: "dashboard.read" },
    { title: t("nav.projects"), url: "/projects", icon: FolderKanban, permission: "projects.read" },
    { title: t("nav.resources"), url: "/resources", icon: Boxes, permission: "resources.read" },
    { title: t("nav.team"), url: "/team", icon: Users2, permission: "team.read" },
    { title: t("nav.company"), url: "/company", icon: Building2, permission: "company.read" },
  ].filter((item) => can(item.permission));
  const accountItems: Array<{ title: string; url: string; icon: typeof LayoutDashboard; permission?: Permission }> = [
    { title: t("nav.profile"), url: "/profile", icon: UserCircle2 },
    { title: t("nav.settings"), url: "/settings", icon: Settings, permission: "settings.read" },
  ].filter((item) => !item.permission || can(item.permission));
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
          <SidebarGroupLabel>{t("nav.workspace")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold"
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("common.account")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold"
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t("common.help")}>
              <HelpCircle />
              <span>{t("common.help")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
