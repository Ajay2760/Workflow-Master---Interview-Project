import { Link } from "wouter";
import { useListWorkflowTemplates } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Plus, Workflow, ChevronRight, GitBranch, Layers, CheckCircle2, PauseCircle } from "lucide-react";

export default function Workflows() {
  const { data, isLoading } = useListWorkflowTemplates();
  const templates = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Workflow Templates</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              {templates.length} Templates
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Configure multi-step approval routing and automated decision matrices</p>
        </div>
        <Button
          asChild
          className="bg-gradient-corporate text-white font-semibold shadow-corporate-btn hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-5 h-11"
        >
          <Link href="/workflows/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Create New Template</span>
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1">
              <GitBranch className="h-8 w-8" />
            </div>
            <p className="font-bold text-lg text-slate-900 dark:text-white">No workflow templates defined</p>
            <p className="text-xs text-slate-500 max-w-sm">Establish enterprise routing rules to automate approvals across your team.</p>
            <Button
              asChild
              className="bg-gradient-corporate text-white font-semibold rounded-xl px-5 h-10 shadow-corporate-btn hover:-translate-y-0.5 transition-all duration-200 mt-2"
            >
              <Link href="/workflows/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Build First Workflow</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t: any) => (
            <Link key={t.id} href={`/workflows/${t.id}`}>
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate-sm hover:shadow-corporate hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-corporate p-0.5 text-white shadow-corporate-btn shrink-0">
                      <div className="h-full w-full bg-indigo-600 dark:bg-indigo-900 rounded-[10px] flex items-center justify-center">
                        <Workflow className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                        t.isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {t.isActive ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active Pipeline</span>
                          </>
                        ) : (
                          <>
                            <PauseCircle className="h-3 w-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {t.name}
                    </h3>
                    {t.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{t.description}</p>
                    )}

                    <div className="flex items-center gap-4 pt-3 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                        <Layers className="h-3.5 w-3.5 text-indigo-500" />
                        {t.stepsCount ?? 0} Approval Steps
                      </span>
                      <span>·</span>
                      <span>Created {formatDate(t.createdAt)}</span>
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

