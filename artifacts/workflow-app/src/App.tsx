import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppLayout } from "@/lib/layout";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Requests from "@/pages/requests";
import NewRequest from "@/pages/requests/new";
import RequestDetail from "@/pages/requests/detail";
import Workflows from "@/pages/workflows";
import NewWorkflow from "@/pages/workflows/new";
import WorkflowDetail from "@/pages/workflows/detail";
import Users from "@/pages/users";
import Notifications from "@/pages/notifications";
import AuditLog from "@/pages/audit-log";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (adminOnly && user?.role !== "admin" && user?.role !== "super_admin") return <Redirect to="/dashboard" />;
  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/dashboard" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/dashboard" />} />
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      <Route path="/register" component={() => <PublicRoute component={Register} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/requests/new" component={() => <ProtectedRoute component={NewRequest} />} />
      <Route path="/requests/:id" component={() => <ProtectedRoute component={RequestDetail} />} />
      <Route path="/requests" component={() => <ProtectedRoute component={Requests} />} />
      <Route path="/workflows/new" component={() => <ProtectedRoute component={NewWorkflow} adminOnly />} />
      <Route path="/workflows/:id" component={() => <ProtectedRoute component={WorkflowDetail} adminOnly />} />
      <Route path="/workflows" component={() => <ProtectedRoute component={Workflows} adminOnly />} />
      <Route path="/users" component={() => <ProtectedRoute component={Users} adminOnly />} />
      <Route path="/notifications" component={() => <ProtectedRoute component={Notifications} />} />
      <Route path="/audit-log" component={() => <ProtectedRoute component={AuditLog} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
