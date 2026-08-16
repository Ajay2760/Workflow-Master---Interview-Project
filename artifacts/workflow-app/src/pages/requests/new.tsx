import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateRequest, useListWorkflowTemplates } from "@workspace/api-client-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Send } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  workflowTemplateId: z.coerce.number({ required_error: "Please select a workflow" }),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: z.string().optional(),
  amount: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: templatesData } = useListWorkflowTemplates();
  const createMutation = useCreateRequest();

  const templates = Array.isArray(templatesData) ? templatesData : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      amount: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: any = {
      title: values.title,
      workflowTemplateId: values.workflowTemplateId,
      priority: values.priority,
    };
    if (values.description) payload.description = values.description;
    if (values.dueDate) payload.dueDate = values.dueDate;
    if (values.amount) payload.amount = parseFloat(values.amount);

    createMutation.mutate(
      { data: payload },
      {
        onSuccess: (res: any) => {
          toast({ title: "Request submitted", description: "Your request has been submitted for approval." });
          setLocation(`/requests/${res.id}`);
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Failed to submit", description: err.message || "Please try again." });
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 shadow-2xs">
          <Link href="/requests"><ArrowLeft className="h-4 w-4 text-slate-600" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">New Request Submission</h1>
          <p className="text-slate-500 text-xs">Initiate a formal approval workflow for your department</p>
        </div>
      </div>

      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-corporate overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-6">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Request Parameters
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">Provide title, workflow category, and context for reviewers</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">Request Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Q3 Software License Approval" className="h-11 rounded-xl border-slate-200 dark:border-slate-800" {...field} />
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
                    <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">Context & Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed context, justification, or business case for reviewers..."
                        className="min-h-[110px] rounded-xl border-slate-200 dark:border-slate-800"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workflowTemplateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">Workflow Template *</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800">
                            <SelectValue placeholder="Select workflow template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {templates.map((t: any) => (
                            <SelectItem key={t.id} value={t.id.toString()}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">Priority Level *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-11 rounded-xl border-slate-200 dark:border-slate-800" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">Financial Amount ($ USD)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" step="0.01" min="0" className="h-11 rounded-xl border-slate-200 dark:border-slate-800" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button asChild variant="outline" className="h-11 rounded-xl border-slate-200 px-6 font-semibold">
                  <Link href="/requests">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-corporate text-white font-semibold shadow-corporate-btn hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-6 h-11 flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{createMutation.isPending ? "Submitting..." : "Submit Request"}</span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

