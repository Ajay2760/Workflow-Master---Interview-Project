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
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/workflows"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Workflow</h1>
          <p className="text-muted-foreground mt-0.5">Create a multi-step approval workflow</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl><Input placeholder="e.g. Budget Approval" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Describe when to use this workflow..." className="min-h-[80px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="!mt-0">Active (available for new requests)</FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Approval Steps</CardTitle>
              <Button type="button" variant="outline" size="sm"
                onClick={() => append({ stepOrder: fields.length + 1, approverRole: "manager", isRequired: true })}>
                <Plus className="h-4 w-4 mr-2" />Add Step
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="p-3 rounded-lg border bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Step {index + 1}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)} disabled={fields.length === 1}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`steps.${index}.approverRole`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Approver Role *</FormLabel>
                          <Select onValueChange={f.onChange} value={f.value}>
                            <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
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
                          <FormLabel className="text-xs">Specific Approver</FormLabel>
                          <Select
                            onValueChange={(v) => f.onChange(v === "any" ? undefined : parseInt(v))}
                            value={f.value?.toString() ?? "any"}>
                            <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="any">Any with role</SelectItem>
                              {users.map((u: any) => (
                                <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <FormField
                      control={form.control}
                      name={`steps.${index}.durationDays`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Duration (days)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} placeholder="3" className="h-8 text-xs"
                              value={f.value ?? ""} onChange={f.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`steps.${index}.isRequired`}
                      render={({ field: f }) => (
                        <FormItem className="flex items-center gap-2 mt-5">
                          <FormControl><Switch checked={f.value} onCheckedChange={f.onChange} /></FormControl>
                          <FormLabel className="!mt-0 text-xs">Required</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button asChild variant="outline"><Link href="/workflows">Cancel</Link></Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Workflow"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
