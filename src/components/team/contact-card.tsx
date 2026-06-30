import { Phone, Mail, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  title: string;
  subtitle?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: { label: string; tone: "info" | "neutral" | "warning" | "success" | "danger" | "primary" } | null;
  badges?: { label: string; tone: "info" | "neutral" | "warning" | "success" | "danger" | "primary" }[];
  rating?: number | null;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
  extraActions?: React.ReactNode;
}

export function ContactCard({
  title, subtitle, email, phone, status, badges, rating,
  onEdit, onDelete, deleteLabel = "Delete", extraActions,
}: Props) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold">{title}</div>
            {subtitle && <div className="truncate text-sm text-muted-foreground">{subtitle}</div>}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
              {badges?.map((b, i) => <StatusBadge key={i} tone={b.tone} dot={false}>{b.label}</StatusBadge>)}
              {rating != null && rating > 0 && (
                <span className="text-xs text-warning">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>
              )}
            </div>
          </div>
          {(onEdit || onDelete || extraActions) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>}
                {extraActions}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4" />{deleteLabel}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {(phone || email) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {phone && (
              <Button asChild variant="outline" size="sm">
                <a href={`tel:${phone}`}><Phone className="h-4 w-4" />{phone}</a>
              </Button>
            )}
            {email && (
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${email}`}><Mail className="h-4 w-4" />Email</a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
