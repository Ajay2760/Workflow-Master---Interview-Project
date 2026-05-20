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
import { ArrowLeft, CheckCircle2, XCircle, MessageSquare, Send } from "lucide-react";
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
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!req) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Request not found.</p>
        <Button asChild className="mt-4"><Link href="/requests">Back to Requests</Link></Button>
      </div>
    );
  }

  const steps = req.approvalSteps ?? [];
  const canApprove = req.status === "pending" || req.status === "in_review";
  const isApprover = user?.role === "manager" || user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/requests"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold">{req.title}</h1>
            <StatusBadge status={req.status} />
            <PriorityBadge priority={req.priority} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Submitted by {req.submittedBy?.name ?? "Unknown"} · {formatDateTime(req.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {req.description && (
            <Card>
              <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{req.description}</p>
              </CardContent>
            </Card>
          )}

          {isApprover && canApprove && req.submittedBy?.id !== user?.id && (
            <Card className="border-blue-200 bg-blue-50/40">
              <CardHeader><CardTitle className="text-base text-blue-800">Your Action Required</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {!showReject ? (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => setShowReject(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Reason for rejection (optional)..."
                      className="min-h-[80px]"
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                    />
                    <div className="flex gap-3">
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleReject}
                        disabled={rejectMutation.isPending}
                      >
                        Confirm Rejection
                      </Button>
                      <Button variant="outline" onClick={() => setShowReject(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {steps.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Approval Steps</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {steps.map((step: any, index: number) => (
                  <div key={step.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        step.status === "approved" ? "bg-green-100 text-green-700" :
                        step.status === "rejected" ? "bg-red-100 text-red-700" :
                        step.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {step.status === "approved" ? <CheckCircle2 className="h-4 w-4" /> :
                         step.status === "rejected" ? <XCircle className="h-4 w-4" /> :
                         <span>{index + 1}</span>}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-0.5 h-full min-h-4 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{step.approver?.name ?? `Step ${index + 1}`}</p>
                          <p className="text-xs text-muted-foreground capitalize">{step.approverRole?.replace("_", " ")}</p>
                          {step.comment && (
                            <p className="text-xs text-muted-foreground mt-1 italic">"{step.comment}"</p>
                          )}
                          {step.decidedAt && (
                            <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(step.decidedAt)}</p>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">{getInitials(c.user?.name ?? "?")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.user?.name ?? "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{c.text}</p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
              )}

              <Separator />
              <div className="flex gap-3 items-end">
                <Textarea
                  placeholder="Add a comment..."
                  className="min-h-[80px] flex-1"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button size="icon" onClick={handleComment} disabled={!comment.trim() || addCommentMutation.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {req.workflowName && (
                <div><p className="text-xs text-muted-foreground">Workflow</p><p className="font-medium">{req.workflowName}</p></div>
              )}
              <div><p className="text-xs text-muted-foreground">Status</p><div className="mt-0.5"><StatusBadge status={req.status} /></div></div>
              <div><p className="text-xs text-muted-foreground">Priority</p><div className="mt-0.5"><PriorityBadge priority={req.priority} /></div></div>
              {req.amount != null && (
                <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-medium">${Number(req.amount).toLocaleString()}</p></div>
              )}
              {req.dueDate && (
                <div><p className="text-xs text-muted-foreground">Due Date</p><p className="font-medium">{formatDateTime(req.dueDate)}</p></div>
              )}
              {req.completedAt && (
                <div><p className="text-xs text-muted-foreground">Completed</p><p className="font-medium">{formatDateTime(req.completedAt)}</p></div>
              )}
            </CardContent>
          </Card>

          {steps.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{steps.filter((s: any) => s.status === "approved").length} of {steps.length} approved</span>
                    <span>{Math.round((steps.filter((s: any) => s.status === "approved").length / steps.length) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(steps.filter((s: any) => s.status === "approved").length / steps.length) * 100}%` }}
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
