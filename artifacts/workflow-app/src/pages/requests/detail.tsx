import { useState } from "react";
import { useRoute, Link } from "wouter";
import {
  useGetRequest,
  useListComments,
  useApproveRequest,
  useRejectRequest,
  useCreateComment,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDateTime, getInitials, timeAgo } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, XCircle, MessageSquare, Send, ShieldAlert, Check, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function RequestDetail() {
  const [, params] = useRoute("/requests/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useGetRequest(id);
  const { data: commentsData } = useListComments(id);
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();
  const addCommentMutation = useCreateComment();

  const [comment, setComment] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);

  const req = request as any;
  const comments = Array.isArray(commentsData) ? commentsData : [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/requests/${id}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/requests/${id}/comments`] });
  };

  const handleApprove = () => {
    approveMutation.mutate(
      { requestId: id, data: { comment: "" } },
      {
        onSuccess: () => { toast({ title: "Request approved" }); invalidate(); },
        onError: (err: any) => toast({ variant: "destructive", title: err.message || "Failed" }),
      }
    );
  };

  const handleReject = () => {
    rejectMutation.mutate(
      { requestId: id, data: { comment: rejectNote } },
      {
        onSuccess: () => {
          toast({ title: "Request rejected" });
          setShowReject(false);
          invalidate();
        },
        onError: (err: any) => toast({ variant: "destructive", title: err.message || "Failed" }),
      }
    );
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    addCommentMutation.mutate(
      { requestId: id, data: { text: comment } },
      {
        onSuccess: () => {
          setComment("");
          toast({ title: "Comment added" });
          invalidate();
        },
        onError: (err: any) => toast({ variant: "destructive", title: err.message || "Failed" }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
        <div className="h-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!req) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16 font-sans">
        <p className="text-slate-500">Workflow Request not found.</p>
        <Button asChild className="mt-4 bg-gradient-corporate text-white font-semibold rounded-xl"><Link href="/requests">Back to Requests</Link></Button>
      </div>
    );
  }

  const steps = req.approvalSteps ?? [];
  const canApprove = req.status === "pending" || req.status === "in_review";
  const isApprover = user?.role === "manager" || user?.role === "admin" || user?.role === "super_admin";
  const approvedStepsCount = steps.filter((s: any) => s.status === "approved").length;
  const progressPercent = steps.length > 0 ? Math.round((approvedStepsCount / steps.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 shadow-2xs shrink-0">
            <Link href="/requests"><ArrowLeft className="h-4 w-4 text-slate-600" /></Link>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{req.title}</h1>
              <StatusBadge status={req.status} />
              <PriorityBadge priority={req.priority} />
            </div>
            <p className="text-xs text-slate-500">
              Submitted by <span className="font-semibold text-slate-700 dark:text-slate-300">{req.submittedBy?.name ?? "Unknown"}</span> · {formatDateTime(req.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {req.description && (
            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
              <CardHeader className="p-6 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Request Description & Context</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">{req.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Required Callout Box */}
          {isApprover && canApprove && req.submittedBy?.id !== user?.id && (
            <Card className="border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/90 to-violet-50/90 dark:from-indigo-950/40 dark:to-violet-950/40 rounded-2xl shadow-corporate-sm">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Your Approval Action Required
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                {!showReject ? (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 shadow-sm transition-all"
                      onClick={handleApprove}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve Request
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 rounded-xl h-11 font-semibold shadow-sm transition-all"
                      onClick={() => setShowReject(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Reason for rejection (optional context for submitter)..."
                      className="min-h-[90px] rounded-xl border-slate-200 bg-white dark:bg-slate-900"
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                    />
                    <div className="flex gap-3">
                      <Button
                        variant="destructive"
                        className="flex-1 rounded-xl h-10 font-semibold"
                        onClick={handleReject}
                        disabled={rejectMutation.isPending}
                      >
                        Confirm Rejection
                      </Button>
                      <Button variant="outline" className="rounded-xl h-10 border-slate-200" onClick={() => setShowReject(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline Approval Steps */}
          {steps.length > 0 && (
            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
              <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Approval Workflow Stages</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {steps.map((step: any, index: number) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-extrabold ${
                        step.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200" :
                        step.status === "rejected" ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200" :
                        step.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200" :
                        "bg-slate-100 text-slate-400 dark:bg-slate-800"
                      }`}>
                        {step.status === "approved" ? <Check className="h-4 w-4" /> :
                         step.status === "rejected" ? <XCircle className="h-4 w-4" /> :
                         <span>{index + 1}</span>}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-0.5 h-full min-h-6 bg-slate-200 dark:bg-slate-800 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{step.approver?.name ?? `Stage ${index + 1}`}</p>
                          <p className="text-xs text-slate-500 capitalize">{step.approverRole?.replace("_", " ")} Role</p>
                          {step.comment && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 italic p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                              "{step.comment}"
                            </p>
                          )}
                          {step.decidedAt && (
                            <p className="text-[11px] text-slate-400 mt-1">{formatDateTime(step.decidedAt)}</p>
                          )}
                        </div>
                        <StatusBadge status={step.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Audit Comments & Discussion ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="h-9 w-9 shrink-0 border border-slate-200 dark:border-slate-700">
                    <AvatarFallback className="text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      {getInitials(c.user?.name ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{c.user?.name ?? "Unknown"}</span>
                      <span className="text-[11px] text-slate-400">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No discussion comments recorded yet.</p>
              )}

              <Separator className="bg-slate-100 dark:bg-slate-800" />
              <div className="flex gap-3 items-end pt-2">
                <Textarea
                  placeholder="Add a comment to the request audit trail..."
                  className="min-h-[85px] flex-1 rounded-xl border-slate-200 dark:border-slate-800 text-xs"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button
                  size="icon"
                  onClick={handleComment}
                  disabled={!comment.trim() || addCommentMutation.isPending}
                  className="h-11 w-11 rounded-xl bg-gradient-corporate text-white shrink-0 shadow-corporate-btn"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info & Metadata */}
        <div className="space-y-6">
          <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
            <CardHeader className="p-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Metadata Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              {req.workflowName && (
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Workflow</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{req.workflowName}</p>
                </div>
              )}
              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Status</p>
                <div className="mt-1"><StatusBadge status={req.status} /></div>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Priority</p>
                <div className="mt-1"><PriorityBadge priority={req.priority} /></div>
              </div>
              {req.amount != null && (
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Financial Impact</p>
                  <p className="font-extrabold text-indigo-600 dark:text-indigo-400 text-lg mt-0.5">
                    ${Number(req.amount).toLocaleString()} USD
                  </p>
                </div>
              )}
              {req.dueDate && (
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Target Due Date</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{formatDateTime(req.dueDate)}</p>
                </div>
              )}
              {req.completedAt && (
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Completed At</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{formatDateTime(req.completedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Overview Card */}
          {steps.length > 0 && (
            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
              <CardHeader className="p-6 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Workflow Completion</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{approvedStepsCount} of {steps.length} Approved</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className="h-full bg-gradient-corporate rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

