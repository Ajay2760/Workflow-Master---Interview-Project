import { Link } from "wouter";
import {
  useGetDashboardStats,
  useListRequests,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { StatusBadge, PriorityBadge, RoleBadge } from "@/components/shared/status-badge";
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
  Plus,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStats();
  const { data: requestsData, isLoading: reqLoading } = useListRequests({ limit: 6 });

  const isLoading = statsLoading || reqLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = statsData as any;
  const recentRequests = (requestsData as any)?.data ?? [];
  const pendingApprovals = recentRequests.filter(
    (req: any) => req?.status === "pending",
  );

  const statCards = [
    {
      title: "Total Workflows",
      value: stats?.totalRequests ?? 0,
      subtext: "Across all departments",
      link: "/requests",
      icon: <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      gradient: "from-indigo-500/10 to-indigo-600/5",
      border: "border-indigo-200/80 dark:border-indigo-900/50",
      accent: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Pending Approval",
      value: stats?.pendingRequests ?? 0,
      subtext: "Action required",
      link: "/requests",
      icon: <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      gradient: "from-amber-500/10 to-amber-600/5",
      border: "border-amber-200/80 dark:border-amber-900/50",
      accent: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Approved",
      value: stats?.approvedRequests ?? 0,
      subtext: "Completed successfully",
      link: "/requests",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      gradient: "from-emerald-500/10 to-emerald-600/5",
      border: "border-emerald-200/80 dark:border-emerald-900/50",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Rejected",
      value: stats?.rejectedRequests ?? 0,
      subtext: "Requires revision",
      link: "/requests",
      icon: <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
      gradient: "from-rose-500/10 to-rose-600/5",
      border: "border-rose-200/80 dark:border-rose-900/50",
      accent: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <RoleBadge role={user?.role || "employee"} />
          </div>
          <p className="text-slate-500 text-sm">
            Operational Overview & Action items for <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.department || "Enterprise Ops"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            asChild
            className="bg-gradient-corporate text-white font-semibold shadow-corporate-btn hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-5 h-11"
          >
            <Link href="/requests/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Request</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <Link key={card.title} href={card.link} className="block h-full">
            <Card
              className={`h-full border ${card.border} bg-white dark:bg-slate-900 shadow-corporate-sm hover:shadow-corporate hover:-translate-y-1 transition-all duration-200 rounded-2xl overflow-hidden relative group`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${card.gradient} rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {card.title}
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-2xs">
                    {card.icon}
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {card.value}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">{card.subtext}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending Approvals Alert Banner (Conditional) */}
      {Array.isArray(pendingApprovals) && pendingApprovals.length > 0 && (
        <Card className="border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
              Pending Action Required ({pendingApprovals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingApprovals.slice(0, 5).map((req: any) => (
              <Link key={req.id} href={`/requests/${req.id}`}>
                <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/60 hover:border-amber-400 cursor-pointer transition-all shadow-2xs hover:shadow-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">{req.title}</span>
                    <span className="text-xs text-slate-500">
                      by {req.submittedBy?.name ?? "Unknown"} · {timeAgo(req.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={req.priority} />
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Grid: Recent Requests & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests Section (Span 2) */}
        <Card className="lg:col-span-2 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
          <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Recent Workflow Requests
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Latest approval submissions & stage statuses</p>
            </div>
            <Button asChild variant="outline" size="sm" className="text-xs font-semibold rounded-lg h-9 border-slate-200">
              <Link href="/requests" className="flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-2">
            {recentRequests.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-500">No requests found</p>
                <p className="text-xs text-slate-400">Click below to initiate a new request workflow</p>
              </div>
            ) : (
              recentRequests.map((req: any) => (
                <Link key={req.id} href={`/requests/${req.id}`}>
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-all duration-150">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                        {req.title ? req.title.substring(0, 2).toUpperCase() : "REQ"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {req.title}
                        </span>
                        <span className="text-xs text-slate-400">
                          {req.workflow?.name || "Standard Workflow"} · {formatDate(req.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Shortcut Panel (Span 1) */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate flex flex-col">
          <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Quick Actions
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Common workflow operations & links</p>
          </CardHeader>

          <CardContent className="p-6 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              <Button
                asChild
                className="w-full justify-start h-11 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-all font-medium text-xs group"
                variant="ghost"
              >
                <Link href="/requests/new" className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-slate-900 dark:text-white">Submit New Request</span>
                    <span className="text-[10px] text-slate-400">Start approval flow</span>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                className="w-full justify-start h-11 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-all font-medium text-xs group"
                variant="ghost"
              >
                <Link href="/requests" className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-slate-900 dark:text-white">View Active Requests</span>
                    <span className="text-[10px] text-slate-400">Track current status</span>
                  </div>
                </Link>
              </Button>

              {(user?.role === "admin" || user?.role === "super_admin") && (
                <>
                  <Button
                    asChild
                    className="w-full justify-start h-11 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-all font-medium text-xs group"
                    variant="ghost"
                  >
                    <Link href="/workflows" className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/60 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-slate-900 dark:text-white">Workflow Configurator</span>
                        <span className="text-[10px] text-slate-400">Edit multi-step logic</span>
                      </div>
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* System Status Footnote */}
            <div className="mt-6 p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Approval Engine</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">100% Operational</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

