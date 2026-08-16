import { useState } from "react";
import { useListAuditLog } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { Activity, Search, ShieldCheck, User, Clock, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  created: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800",
  updated: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-800",
  deleted: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/80 dark:border-rose-800",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800",
  rejected: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/80 dark:border-rose-800",
  submitted: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/80 dark:border-amber-800",
  cancelled: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200",
  login: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400 border-violet-200/80 dark:border-violet-800",
  logout: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200",
  commented: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200/80 dark:border-sky-800",
};

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useListAuditLog({ limit: 100 });
  const logs = (data as any)?.data ?? [];

  const filtered = logs.filter((log: any) =>
    (log.userEmail ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (log.action ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (log.resourceType ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (log.details ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Security & Audit Log</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              {filtered.length} Events
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Immutable record of governance decisions, user activities, and API events</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>SOC2 Compliant Audit Trail</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search audit trail by user, event action, or payload..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1">
              <Activity className="h-8 w-8" />
            </div>
            <p className="font-bold text-lg text-slate-900 dark:text-white">No audit records match search</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((log: any) => (
            <Card key={log.id} className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-2xs hover:shadow-corporate-sm transition-all duration-150 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide capitalize shrink-0 border",
                      ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {log.action}
                    </span>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" />
                          {log.userEmail ?? "System Automated"}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700 text-xs">·</span>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 capitalize bg-indigo-50/50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
                          {log.resourceType}
                        </span>
                        {log.resourceId && (
                          <span className="text-xs text-slate-400 font-mono">
                            #{log.resourceId}
                          </span>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-xs text-slate-500 font-normal truncate max-w-xl">{log.details}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium shrink-0">
                    <Clock className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
                    <span>{formatDateTime(log.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

