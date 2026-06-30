import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — BauPilot AI" },
      { name: "description", content: "Create your BauPilot AI workspace." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Workspace created (demo)");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Set up BauPilot AI for your construction company."
      footer={
        <p className="text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="fname">First name</Label>
            <Input id="fname" autoComplete="given-name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lname">Last name</Label>
            <Input id="lname" autoComplete="family-name" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company name</Label>
          <Input id="company" placeholder="Your construction company" required />
        </div>
        <div className="space-y-2">
          <Label>Your role</Label>
          <Select defaultValue="owner">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Company Owner</SelectItem>
              <SelectItem value="pm">Project Manager</SelectItem>
              <SelectItem value="site">Site Manager</SelectItem>
              <SelectItem value="foreman">Foreman</SelectItem>
              <SelectItem value="worker">Worker</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" required />
          <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox id="terms" required className="mt-0.5" />
          <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
            I agree to the{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </Label>
        </div>
        <Button type="submit" className="w-full" size="lg">
          Create workspace
        </Button>
      </form>
    </AuthLayout>
  );
}
