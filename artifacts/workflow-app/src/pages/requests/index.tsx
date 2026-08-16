import { useState } from "react";
import { Link } from "wouter";
import { useListRequests } from "@workspace/api-client-react";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Plus, Search, FileText, Filter, ArrowRight, User } from "lucide-react";

export default function Requests() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  const { data, isLoading } = useListRequests({
    status: status !== "all" ? status : undefined,
    priority: priority !== "all" ? priority : undefined,
    limit: 50,
  });

  const requests = (data as any)?.data ?? [];

  const filtered = requests.filter((r: any) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.submittedBy?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Workflow Requests</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              {filtered.length} Total
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Manage, filter, and review active approval pipeline requests</p>
        </div>
        <Button
          asChild
          className="bg-gradient-corporate text-white font-semibold shadow-corporate-btn hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-5 h-11"
        >
          <Link href="/requests/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Create New Request</span>
          </Link>
        </Button>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by request title or requester..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 dark:bg-slate-950/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold">
              <SelectValue placeholder="Filter Priority" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1">
              <FileText className="h-8 w-8" />
            </div>
            <p className="font-bold text-lg text-slate-900 dark:text-white">No requests found</p>
            <p className="text-xs text-slate-500 max-w-sm">No workflow requests match your search parameters or filter selections.</p>
            <Button
              asChild
              className="bg-gradient-corporate text-white font-semibold rounded-xl px-5 h-10 shadow-corporate-btn hover:-translate-y-0.5 transition-all duration-200 mt-2"
            >
              <Link href="/requests/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Create Request</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((req: any) => (
            <Link key={req.id} href={`/requests/${req.id}`}>
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate-sm hover:shadow-corporate hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden group">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0 border border-slate-200/60 dark:border-slate-700/60 group-hover:bg-gradient-corporate group-hover:text-white transition-colors duration-200">
                        {req.submittedBy?.name ? req.submittedBy.name.substring(0, 2).toUpperCase() : "RQ"}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {req.title}
                          </h3>
                        </div>

                        {req.description && (
                          <p className="text-xs text-slate-500 line-clamp-1">{req.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium pt-0.5">
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <User className="h-3 w-3 text-indigo-500" />
                            {req.submittedBy?.name ?? "Unknown Requester"}
                          </span>
                          <span>·</span>
                          <span>Submitted {formatDate(req.createdAt)}</span>
                          {req.workflowName && (
                            <>
                              <span>·</span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                                {req.workflowName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                      <StatusBadge status={req.status} />
                      <PriorityBadge priority={req.priority} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

