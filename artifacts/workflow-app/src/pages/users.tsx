import { useState } from "react";
import { useListUsers, useUpdateUser } from "@workspace/api-client-react";
import { RoleBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getInitials, formatDate } from "@/lib/utils";
import { Search, Users as UsersIcon, Pencil, Mail, Building, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Users() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editUser, setEditUser] = useState<any>(null);
  const [editRole, setEditRole] = useState<string>("");
  const [editDept, setEditDept] = useState<string>("");
  const [editActive, setEditActive] = useState<boolean>(true);

  const { data, isLoading } = useListUsers();
  const updateMutation = useUpdateUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const users = Array.isArray(data) ? data : [];

  const filtered = users.filter((u: any) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openEdit = (user: any) => {
    setEditUser(user);
    setEditRole(user.role);
    setEditDept(user.department ?? "");
    setEditActive(user.isActive);
  };

  const handleSave = () => {
    if (!editUser) return;
    updateMutation.mutate(
      { userId: editUser.id, data: { role: editRole as any, department: editDept, isActive: editActive } },
      {
        onSuccess: () => {
          toast({ title: "User updated" });
          setEditUser(null);
          queryClient.invalidateQueries({ queryKey: ["/api/users"] });
        },
        onError: (err: any) => toast({ variant: "destructive", title: err.message || "Failed" }),
      }
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Directory & Access Control</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              {filtered.length} Users
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Manage user permissions, roles, and departmental access rights</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1">
              <UsersIcon className="h-8 w-8" />
            </div>
            <p className="font-bold text-lg text-slate-900 dark:text-white">No directory matches found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((user: any) => (
            <Card key={user.id} className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate-sm hover:shadow-corporate transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-11 w-11 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <AvatarFallback className="text-sm font-extrabold bg-gradient-corporate text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</span>
                        {!user.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {user.email}
                        </span>
                        {user.department && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3 text-indigo-500" />
                              {user.department}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <RoleBadge role={user.role} />
                    <span className="text-xs text-slate-400 font-medium hidden md:block">
                      Joined {formatDate(user.createdAt)}
                    </span>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 shadow-2xs" onClick={() => openEdit(user)}>
                      <Pencil className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="rounded-2xl border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              Edit User Privileges — {editUser?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Access Role</label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department</label>
              <Input value={editDept} onChange={(e) => setEditDept(e.target.value)} placeholder="e.g. Engineering" className="h-11 rounded-xl border-slate-200" />
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="checkbox"
                id="is-active"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="is-active" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">Active User Account</label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditUser(null)} className="rounded-xl h-10 border-slate-200">Cancel</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-gradient-corporate text-white font-semibold rounded-xl h-10 px-5 shadow-corporate-btn">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

