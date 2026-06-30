import type { ReactNode } from "react";
import { Logo } from "@/components/branding/logo";
import { ShieldCheck, Users, FolderKanban } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-4 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm">{footer}</div>}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} BauPilot AI. All rights reserved.
        </p>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-hover lg:flex">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.25) 0%, transparent 45%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
              Construction SaaS Platform
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight">
              The modern operating system for construction companies.
            </h2>
            <p className="mt-4 text-base text-primary-foreground/85">
              Manage projects, teams and operations on one secure, multi-tenant platform.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              { icon: FolderKanban, label: "Centralized project workspace" },
              { icon: Users, label: "Role-based access for every team" },
              { icon: ShieldCheck, label: "Enterprise-grade security and reliability" },
            ].map((f) => (
              <li key={f.label} className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-foreground/15 backdrop-blur">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm font-medium">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
