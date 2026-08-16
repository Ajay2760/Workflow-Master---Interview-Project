import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";
import { Bell, CheckCheck, Info, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const TYPE_ICON: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-sky-500" />,
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  error: <XCircle className="h-4 w-4 text-rose-500" />,
};

export default function Notifications() {
  const { data, isLoading } = useListNotifications({ limit: 50 });
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const notifications = Array.isArray(data) ? data : [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
  };

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate(
      { notificationId: id },
      { onSuccess: invalidate, onError: (err: any) => toast({ variant: "destructive", title: err.message }) }
    );
  };

  const handleMarkAll = () => {
    markAllMutation.mutate(undefined, {
      onSuccess: () => { toast({ title: "All notifications marked as read" }); invalidate(); },
      onError: (err: any) => toast({ variant: "destructive", title: err.message }),
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Activity Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">Real-time alerts, approval requests, and workflow status updates</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={markAllMutation.isPending}
            className="rounded-xl border-slate-200 shadow-2xs text-slate-700 font-semibold h-10 px-4"
          >
            <CheckCheck className="h-4 w-4 mr-2 text-indigo-600" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1">
              <Bell className="h-8 w-8" />
            </div>
            <p className="font-bold text-lg text-slate-900 dark:text-white">You're completely caught up!</p>
            <p className="text-xs text-slate-500">No unread notifications or pending actions required right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n: any) => (
            <Card
              key={n.id}
              className={cn(
                "cursor-pointer transition-all duration-200 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-corporate-sm",
                !n.isRead && "border-indigo-200 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/20"
              )}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/50">
                    {TYPE_ICON[n.type] ?? TYPE_ICON.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs leading-relaxed text-slate-900 dark:text-white", !n.isRead ? "font-bold" : "font-normal text-slate-600 dark:text-slate-400")}>
                      {n.message}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 shrink-0 mt-2 shadow-2xs" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

