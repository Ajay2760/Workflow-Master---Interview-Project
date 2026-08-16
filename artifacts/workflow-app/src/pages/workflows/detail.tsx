import { useRoute, Link } from "wouter";
import { useGetWorkflowTemplate } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Workflow, CheckCircle2, Clock, ShieldCheck, Layers, Calendar } from "lucide-react";

export default function WorkflowDetail() {
  const [, params] = useRoute("/workflows/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: template, isLoading } = useGetWorkflowTemplate(id);
  const t = template as any;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 font-sans">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          <div className="h-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          <div className="h-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!t) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 font-sans">
        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Workflow className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workflow Template Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">The requested workflow definition does not exist or was removed.</p>
        <Button asChild className="mt-6 bg-gradient-corporate text-white rounded-xl shadow-corporate-btn"><Link href="/workflows">Back to Templates</Link></Button>
      </div>
    );
  }

  const steps = t.steps ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate">
        <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 shadow-2xs shrink-0">
          <Link href="/workflows"><ArrowLeft className="h-4 w-4 text-slate-600" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t.name}</h1>
            <Badge className={t.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 rounded-full px-3 py-0.5 font-bold" : "bg-slate-100 text-slate-600 rounded-full px-3 py-0.5 font-bold"}>
              {t.isActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </div>
          {t.description && (
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{t.description}</p>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{steps.length}</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">Approval Stages</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{steps.filter((s: any) => s.isRequired).length}</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">Mandatory Gates</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Date Created</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formatDate(t.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sequential Steps Card */}
      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-6">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Workflow className="h-4 w-4 text-indigo-600" />
            Approval Pipeline Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {steps.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No approval stages configured for this template.</p>
          ) : (
            steps.map((step: any, index: number) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-gradient-corporate text-white flex items-center justify-center shrink-0 text-xs font-extrabold shadow-corporate-btn">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-full min-h-6 bg-slate-200 dark:bg-slate-800 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">{step.approverRole?.replace("_", " ")}</span>
                        {step.approverName && (
                          <span className="text-xs font-medium text-slate-500">({step.approverName})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        {step.isRequired && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" />Required Gatekeeper
                          </span>
                        )}
                        {step.durationDays && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-indigo-500" />SLA: {step.durationDays} Days Max
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-100">
                      STAGE #{index + 1}
                    </span>
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

