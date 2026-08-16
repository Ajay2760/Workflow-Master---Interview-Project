import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateWorkflowTemplate, useListUsers } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, GripVertical, Layers, GitCommit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const stepSchema = z.object({
  stepOrder: z.number(),
  approverId: z.coerce.number().optional(),
  approverRole: z.string().min(1, "Role is required"),
  isRequired: z.boolean(),
  durationDays: z.coerce.number().min(1).optional(),
});

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  isActive: z.boolean(),
  steps: z.array(stepSchema).min(1, "At least one step is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewWorkflow() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: usersData } = useListUsers({ limit: 100 });
  const createMutation = useCreateWorkflowTemplate();

  const users = Array.isArray(usersData) ? usersData : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      steps: [{ stepOrder: 1, approverRole: "manager", isRequired: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "steps" });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(
      {
        data: {
          name: values.name,
          description: values.description,
          isActive: values.isActive,
          steps: values.steps.map((s, i) => ({
            stepOrder: i + 1,
            approverRole: s.approverRole as any,
            approverId: s.approverId || undefined,
            isRequired: s.isRequired,
            durationDays: s.durationDays,
          })),
        },
      },
      {
        onSuccess: (res: any) => {
          toast({ title: "Workflow created" });
          setLocation(`/workflows/${res.id}`);
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: err.message || "Failed to create workflow" });
        },
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-corporate">
        <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 shadow-2xs shrink-0">
          <Link href="/workflows"><ArrowLeft className="h-4 w-4 text-slate-600" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Design Workflow Template</h1>
          <p className="text-slate-500 text-sm mt-0.5">Define multi-stage approval sequences and escalation parameters</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* General Information Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-6">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitCommit className="h-4 w-4 text-indigo-600" />
                Pipeline Specification
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">Template Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Capital Expenditure & Purchase Order Approval" {...field} className="h-11 rounded-xl border-slate-200 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">Governance Scope & Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Outline organizational trigger conditions, spending limits, or compliance mandates..." className="min-h-[90px] rounded-xl border-slate-200 text-xs leading-relaxed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div>
                      <FormLabel className="!mt-0 text-xs font-bold text-slate-900 dark:text-white">Active Template Status</FormLabel>
                      <p className="text-[11px] text-slate-400">Enable immediately for new incoming enterprise request submissions</p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sequential Steps Builder Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                Approval Stage Sequence ({fields.length})
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ stepOrder: fields.length + 1, approverRole: "manager", isRequired: true })}
                className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold h-9 px-3"
              >
                <Plus className="h-4 w-4 mr-1.5" />Add Stage
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 space-y-4 relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <GripVertical className="h-4 w-4 text-slate-400" />
                      <span className="h-6 w-6 rounded-full bg-gradient-corporate text-white text-xs font-extrabold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Approval Stage #{index + 1}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`steps.${index}.approverRole`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">Required Role *</FormLabel>
                          <Select onValueChange={f.onChange} value={f.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`steps.${index}.approverId`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">Specific Assigned User (Optional)</FormLabel>
                          <Select
                            onValueChange={(v) => f.onChange(v === "any" ? undefined : parseInt(v))}
                            value={f.value?.toString() ?? "any"}>
                            <FormControl>
                              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="any">Any user with matching role</SelectItem>
                              {users.map((u: any) => (
                                <SelectItem key={u.id} value={u.id.toString()}>{u.name} ({u.email})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1 border-t border-slate-200/50 dark:border-slate-800">
                    <FormField
                      control={form.control}
                      name={`steps.${index}.durationDays`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">SLAs Limit (Days)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} placeholder="3" className="h-10 rounded-xl border-slate-200 text-xs"
                              value={f.value ?? ""} onChange={f.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`steps.${index}.isRequired`}
                      render={({ field: f }) => (
                        <FormItem className="flex items-center gap-2.5 sm:mt-6">
                          <FormControl><Switch checked={f.value} onCheckedChange={f.onChange} /></FormControl>
                          <FormLabel className="!mt-0 text-xs font-semibold text-slate-700 dark:text-slate-300">Mandatory Gatekeeper</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button asChild variant="outline" className="rounded-xl h-11 border-slate-200 font-semibold px-5">
              <Link href="/workflows">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-corporate text-white font-semibold rounded-xl h-11 px-6 shadow-corporate-btn hover:-translate-y-0.5 transition-all duration-200"
            >
              {createMutation.isPending ? "Creating Template..." : "Save & Activate Workflow"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

