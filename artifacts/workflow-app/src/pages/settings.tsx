import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { useUpdateUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/status-badge";
import { getInitials, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { User, Shield, CheckCircle2, Building, Mail, Sparkles } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function Settings() {
  const { user } = useAuth();
  const updateMutation = useUpdateUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      department: user?.department ?? "",
    },
  });

  const onSubmit = (values: ProfileValues) => {
    if (!user) return;
    updateMutation.mutate(
      { userId: user.id, data: { name: values.name, department: values.department } },
      {
        onSuccess: () => {
          toast({ title: "Profile updated" });
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: err.message || "Failed to update profile" });
        },
      }
    );
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-8 font-sans">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Account Settings</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Corporate ID
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-1">Manage your identity details, notification preferences, and active security credentials</p>
      </div>

      {/* Main Settings Card */}
      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-6">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Personal Profile
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            View and edit your enterprise profile attributes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Avatar Banner */}
          <div className="flex items-center gap-5 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
            <Avatar className="h-16 w-16 border-2 border-indigo-500/30 shadow-corporate-btn shrink-0">
              <AvatarFallback className="text-lg font-extrabold bg-gradient-corporate text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-extrabold text-slate-900 dark:text-white text-lg">{user.name}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {user.email}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <RoleBadge role={user.role} />
                {user.department && (
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Building className="h-3 w-3 text-indigo-500" />
                    {user.department}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 dark:bg-slate-950/50 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">Department Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Finance & Procurement" {...field} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 dark:bg-slate-950/50 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-1.5">
                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">Corporate Email (Read-only)</FormLabel>
                <Input value={user.email} disabled className="h-11 rounded-xl border-slate-200 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-xs cursor-not-allowed" />
                <p className="text-[11px] text-slate-400">Email identity is managed via your identity provider SSO</p>
              </div>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-gradient-corporate text-white font-semibold shadow-corporate-btn hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-6 h-11"
              >
                {updateMutation.isPending ? "Updating Profile..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Account Info Card */}
      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-6">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Security & Governance Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400 block font-medium mb-0.5">Account Created</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{formatDate(user.createdAt)}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400 block font-medium mb-1">Access Role</span>
              <RoleBadge role={user.role} />
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 sm:col-span-2 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-medium mb-0.5">Authentication Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Verified Corporate Identity Active
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200">
                ACTIVE
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

