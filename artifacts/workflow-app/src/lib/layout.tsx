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
import {
  LayoutDashboard,
  FileText,
  Workflow,
  Users,
  Bell,
  Activity,
  Settings,
  LogOut,
  Plus
} from "lucide-react";
import { useLogout } from "@workspace/api-client-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
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

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background w-full">
        <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <div className="h-6 w-6 rounded-md bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground">
                <Workflow className="h-4 w-4" />
              </div>
              <span>OpsFlow</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard">
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Requests">
                      <Link href="/requests">
                        <FileText className="h-4 w-4" />
                        <span>Requests</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {isAdminOrSuperAdmin && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Workflows">
                          <Link href="/workflows">
                            <Workflow className="h-4 w-4" />
                            <span>Workflows</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Users">
                          <Link href="/users">
                            <Users className="h-4 w-4" />
                            <span>Users</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Notifications">
                      <Link href="/notifications">
                        <Bell className="h-4 w-4" />
                        <span>Notifications</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Audit Log">
                      <Link href="/audit-log">
                        <Activity className="h-4 w-4" />
                        <span>Audit Log</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Settings">
                      <Link href="/settings">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-sidebar-foreground/70 capitalize">{user.role.replace("_", " ")}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-14 flex items-center px-4 border-b bg-background shrink-0 gap-4">
            <SidebarTrigger />
            <div className="flex-1" />
            <Button asChild size="sm">
              <Link href="/requests/new">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Link>
            </Button>
          </header>
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
