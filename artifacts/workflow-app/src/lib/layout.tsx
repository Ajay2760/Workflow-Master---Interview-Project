import React from "react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "./auth";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/shared/status-badge";
import {
  LayoutDashboard,
  FileText,
  Workflow,
  Users,
  Bell,
  Activity,
  Settings,
  LogOut,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLogout } from "@workspace/api-client-react";

function SidebarNavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <Link href={href} className={className} onClick={() => setOpenMobile(false)}>
      {children}
    </Link>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        logout();
        setLocation("/login");
      }
    });
  };

  if (!user) return <>{children}</>;

  const isAdminOrSuperAdmin = user.role === "admin" || user.role === "super_admin";

  const isActive = (path: string) => location === path || location.startsWith(path + "/");

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background text-foreground w-full font-sans antialiased">
        <Sidebar className="border-r border-sidebar-border/60 bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-5 pb-3">
            <SidebarNavLink href="/dashboard" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] group-hover:scale-105 transition-transform duration-200">
                <Workflow className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight text-slate-100">
                  <span>Workflow</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Pro
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Enterprise Workflows</span>
              </div>
            </SidebarNavLink>
          </SidebarHeader>

          <SidebarContent className="px-2 py-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] font-bold tracking-wider uppercase text-slate-400/80 px-3 mb-1">
                Main Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/dashboard")}
                      className={`px-3 py-2.5 rounded-lg transition-all duration-150 ${
                        isActive("/dashboard")
                          ? "bg-indigo-600/15 text-indigo-300 font-semibold border-l-2 border-indigo-500"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <SidebarNavLink href="/dashboard" className="flex items-center gap-3">
                        <LayoutDashboard className={`h-4 w-4 ${isActive("/dashboard") ? "text-indigo-400" : "text-slate-400"}`} />
                        <span>Dashboard</span>
                      </SidebarNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/requests")}
                      className={`px-3 py-2.5 rounded-lg transition-all duration-150 ${
                        isActive("/requests")
                          ? "bg-indigo-600/15 text-indigo-300 font-semibold border-l-2 border-indigo-500"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <SidebarNavLink href="/requests" className="flex items-center gap-3">
                        <FileText className={`h-4 w-4 ${isActive("/requests") ? "text-indigo-400" : "text-slate-400"}`} />
                        <span>Requests</span>
                      </SidebarNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {isAdminOrSuperAdmin && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/workflows")}
                          className={`px-3 py-2.5 rounded-lg transition-all duration-150 ${
                            isActive("/workflows")
                              ? "bg-indigo-600/15 text-indigo-300 font-semibold border-l-2 border-indigo-500"
                              : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                          }`}
                        >
                          <SidebarNavLink href="/workflows" className="flex items-center gap-3">
                            <Workflow className={`h-4 w-4 ${isActive("/workflows") ? "text-indigo-400" : "text-slate-400"}`} />
                            <span>Workflows</span>
                          </SidebarNavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/users")}
                          className={`px-3 py-2.5 rounded-lg transition-all duration-150 ${
                            isActive("/users")
                              ? "bg-indigo-600/15 text-indigo-300 font-semibold border-l-2 border-indigo-500"
                              : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                          }`}
                        >
                          <SidebarNavLink href="/users" className="flex items-center gap-3">
                            <Users className={`h-4 w-4 ${isActive("/users") ? "text-indigo-400" : "text-slate-400"}`} />
                            <span>Users & Roles</span>
                          </SidebarNavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/notifications")}
                      className={`px-3 py-2.5 rounded-lg transition-all duration-150 ${
                        isActive("/notifications")
                          ? "bg-indigo-600/15 text-indigo-300 font-semibold border-l-2 border-indigo-500"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <SidebarNavLink href="/notifications" className="flex items-center gap-3">
                        <Bell className={`h-4 w-4 ${isActive("/notifications") ? "text-indigo-400" : "text-slate-400"}`} />
                        <span>Notifications</span>
                      </SidebarNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/audit-log")}
                      className={`px-3 py-2.5 rounded-lg transition-all duration-150 ${
                        isActive("/audit-log")
                          ? "bg-indigo-600/15 text-indigo-300 font-semibold border-l-2 border-indigo-500"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <SidebarNavLink href="/audit-log" className="flex items-center gap-3">
                        <Activity className={`h-4 w-4 ${isActive("/audit-log") ? "text-indigo-400" : "text-slate-400"}`} />
                        <span>Audit Trail</span>
                      </SidebarNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupLabel className="text-[11px] font-bold tracking-wider uppercase text-slate-400/80 px-3 mb-1">
                Account Settings
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/settings")}
                      className={`px-3 py-2.5 rounded-lg transition-all duration-150 ${
                        isActive("/settings")
                          ? "bg-indigo-600/15 text-indigo-300 font-semibold border-l-2 border-indigo-500"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <SidebarNavLink href="/settings" className="flex items-center gap-3">
                        <Settings className={`h-4 w-4 ${isActive("/settings") ? "text-indigo-400" : "text-slate-400"}`} />
                        <span>Settings</span>
                      </SidebarNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {user.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-100 truncate">{user.name}</span>
                  <div className="mt-0.5">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
          <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0 sticky top-0 z-10 shadow-xs">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-slate-600 hover:text-slate-900 dark:text-slate-300" />
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Enterprise Security Active</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                asChild
                className="bg-gradient-corporate text-white hover:opacity-95 shadow-corporate-btn hover:-translate-y-0.5 transition-all duration-200 rounded-full px-4 text-xs font-semibold"
              >
                <Link href="/requests/new" className="flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span>New Request</span>
                </Link>
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

