import { Link } from "wouter";
import { useListWorkflowTemplates } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Plus, Workflow, ChevronRight, GitBranch } from "lucide-react";

export default function Workflows() {
  const { data, isLoading } = useListWorkflowTemplates();
  const templates = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflow Templates</h1>
          <p className="text-muted-foreground mt-1">Define multi-step approval workflows</p>
        </div>
        <Button asChild>
          <Link href="/workflows/new">
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <GitBranch className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="font-medium text-muted-foreground">No workflow templates yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first workflow template.</p>
            <Button asChild className="mt-4">
              <Link href="/workflows/new"><Plus className="h-4 w-4 mr-2" />New Workflow</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t: any) => (
            <Link key={t.id} href={`/workflows/${t.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Workflow className="h-5 w-5 text-primary" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{t.name}</h3>
                      <Badge variant={t.isActive ? "default" : "secondary"} className="text-xs">
                        {t.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {t.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>{t.stepsCount ?? 0} steps</span>
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
