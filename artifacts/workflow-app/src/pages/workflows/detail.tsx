import { useRoute, Link } from "wouter";
import { useGetWorkflowTemplate } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Workflow, CheckCircle2, Clock } from "lucide-react";

export default function WorkflowDetail() {
  const [, params] = useRoute("/workflows/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: template, isLoading } = useGetWorkflowTemplate(id);
  const t = template as any;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!t) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Workflow not found.</p>
        <Button asChild className="mt-4"><Link href="/workflows">Back to Workflows</Link></Button>
      </div>
    );
  }

  const steps = t.steps ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/workflows"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{t.name}</h1>
            <Badge variant={t.isActive ? "default" : "secondary"}>
              {t.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          {t.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{t.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{steps.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Steps</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{steps.filter((s: any) => s.isRequired).length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Required</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="text-sm font-semibold mt-0.5">{formatDate(t.createdAt)}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Approval Steps</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No steps configured.</p>
          ) : (
            steps.map((step: any, index: number) => (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-full min-h-4 bg-border mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm capitalize">{step.approverRole?.replace("_", " ")}</span>
                        {step.approverName && (
                          <span className="text-xs text-muted-foreground">({step.approverName})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        {step.isRequired && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />Required
                          </span>
                        )}
                        {step.durationDays && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{step.durationDays} days SLA
                          </span>
                        )}
                      </div>
                    </div>
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
