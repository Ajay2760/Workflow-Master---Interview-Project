import { Link } from "wouter";
import {
  useGetDashboardStats,
  useListRequests,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, timeAgo } from "@/lib/utils";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStats();
  const { data: requestsData, isLoading: reqLoading } = useListRequests({ limit: 6 });

  const isLoading = statsLoading || reqLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const stats = statsData as any;
  const recentRequests = (requestsData as any)?.data ?? [];
  const pendingApprovals: any[] = [];

  const statCards = [
    {
      title: "Total Requests",
      value: stats?.totalRequests ?? 0,
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      title: "Pending",
      value: stats?.pendingRequests ?? 0,
      icon: <Clock className="h-5 w-5 text-yellow-600" />,
      bg: "bg-yellow-50",
    },
    {
      title: "Approved",
      value: stats?.approvedRequests ?? 0,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      bg: "bg-green-50",
    },
    {
      title: "Rejected",
      value: stats?.rejectedRequests ?? 0,
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your workflows today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                <div className={`p-2 rounded-lg ${card.bg}`}>{card.icon}</div>
              </div>
              <p className="text-3xl font-bold mt-3">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {Array.isArray(pendingApprovals) && pendingApprovals.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              Pending Your Approval ({pendingApprovals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingApprovals.slice(0, 5).map((req: any) => (
              <Link key={req.id} href={`/requests/${req.id}`}>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200 hover:border-yellow-300 cursor-pointer transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{req.title}</span>
                    <span className="text-xs text-muted-foreground">
                      by {req.submittedBy?.name ?? "Unknown"} · {timeAgo(req.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={req.priority} />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Requests</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/requests">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No requests yet</p>
            ) : (
              recentRequests.map((req: any) => (
                <Link key={req.id} href={`/requests/${req.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-medium text-sm truncate">{req.title}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(req.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/requests/new">
                <FileText className="h-4 w-4 mr-2" />
                Submit New Request
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/requests">
                <Clock className="h-4 w-4 mr-2" />
                View My Requests
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/notifications">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Check Notifications
              </Link>
            </Button>
            {(user?.role === "admin" || user?.role === "super_admin") && (
              <>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/users">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Manage Users
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/workflows">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Manage Workflows
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
