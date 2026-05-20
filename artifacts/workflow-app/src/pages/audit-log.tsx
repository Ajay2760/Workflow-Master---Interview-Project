import { useState } from "react";
import { useListAuditLog } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { Activity, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  created: "bg-green-100 text-green-700",
  updated: "bg-blue-100 text-blue-700",
  deleted: "bg-red-100 text-red-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  submitted: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-gray-100 text-gray-600",
  login: "bg-purple-100 text-purple-700",
  logout: "bg-gray-100 text-gray-600",
  commented: "bg-blue-100 text-blue-700",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground mt-1">Track all system activities and changes</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="font-medium text-muted-foreground">No audit logs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((log: any) => (
            <Card key={log.id} className="border">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium capitalize shrink-0",
                    ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600"
                  )}>
                    {log.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{log.userEmail ?? "System"}</span>
                      <span className="text-xs text-muted-foreground shrink-0 capitalize">{log.resourceType}</span>
                      {log.resourceId && (
                        <span className="text-xs text-muted-foreground shrink-0">#{log.resourceId}</span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{log.details}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
