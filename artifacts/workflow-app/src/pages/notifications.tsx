import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";
import { Bell, CheckCheck, Info, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const TYPE_ICON: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={markAllMutation.isPending}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="font-medium text-muted-foreground">No notifications</p>
            <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <Card
              key={n.id}
              className={cn("cursor-pointer transition-colors hover:shadow-sm", !n.isRead && "border-primary/30 bg-primary/5")}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {TYPE_ICON[n.type] ?? TYPE_ICON.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.isRead && "font-medium")}>{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
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
