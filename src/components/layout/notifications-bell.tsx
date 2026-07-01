import { useEffect, useState, useCallback } from "react";
import { Bell, Check, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  listMyNotifications,
  countUnread,
  markAsRead,
  markAllAsRead,
  type NotificationEvent,
} from "@/lib/notifications";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/i18n";
import { useTranslation } from "react-i18next";

export function NotificationsBell() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<NotificationEvent[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [list, count] = await Promise.all([listMyNotifications(20), countUnread()]);
      setItems(list);
      setUnread(count);
    } catch {
      // silent — non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    let cancelled = false;
    const channel = supabase
      .channel("notif-bell")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notification_events" },
        () => {
          if (!cancelled) void refresh();
        }
      )
      .subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  async function onMarkOne(id: string) {
    await markAsRead(id);
    await refresh();
  }
  async function onMarkAll() {
    await markAllAsRead();
    await refresh();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground"
          aria-label={t("common.notifications")}
        >
          <Bell className="h-4.5 w-4.5" />
          {unread > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full p-0 px-1 text-[10px]">
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,360px)] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="text-sm font-semibold">{t("common.notifications")}</div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={onMarkAll}
            disabled={unread === 0}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t("common.markAllRead", "Alle gelesen")}
          </Button>
        </div>
        <ScrollArea className="max-h-[60vh]">
          {loading && items.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">…</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <Inbox className="h-6 w-6" />
              {t("common.noNotifications", "Keine Benachrichtigungen")}
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => {
                const isUnread = n.status === "unread";
                return (
                  <li
                    key={n.id}
                    className={`flex gap-2 px-3 py-2.5 text-sm ${isUnread ? "bg-primary/5" : ""}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-foreground">{n.title}</div>
                      {n.message && (
                        <div className="line-clamp-2 text-xs text-muted-foreground">{n.message}</div>
                      )}
                      <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {formatDate(n.created_at, i18n.language, { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    </div>
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => onMarkOne(n.id)}
                        aria-label={t("common.markRead", "Als gelesen markieren")}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
