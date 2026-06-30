import { Bell, Search, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useProfile, profileDisplayName, profileInitials } from "@/hooks/use-profile";

export function Topbar() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { profile } = useProfile();
  const email = user?.email ?? "";
  const name = profileDisplayName(profile, email);
  const initials = profileInitials(profile, email);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-card/70 sm:gap-3 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="hidden h-5 w-px bg-border sm:block" />

      <div className="relative ml-auto hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects, people…"
          className="h-9 border-transparent bg-muted/60 pl-9 focus-visible:border-input focus-visible:bg-background"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="ml-auto md:ml-0 h-9 w-9 text-muted-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight sm:block">
              <div className="max-w-[160px] truncate text-xs font-semibold text-foreground">{name || "Account"}</div>
              <div className="max-w-[160px] truncate text-[10px] text-muted-foreground">{email}</div>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/company">Company</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
