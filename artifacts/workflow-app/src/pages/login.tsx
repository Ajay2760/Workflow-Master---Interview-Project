import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, Layers } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const loginMutation = useLogin();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setError(null);
    loginMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          login(res.token, res.user);
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          setError(err.message || "Failed to login. Please check your credentials.");
        },
      }
    );
  };

  const fillDemo = (email: string) => {
    form.setValue("email", email);
    form.setValue("password", "password123");
    setTimeout(() => form.handleSubmit(onSubmit)(), 0);
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl filter pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-violet-500/15 rounded-full blur-3xl filter pointer-events-none" />

      {/* Left Column - Hero Branding & 3D Visual */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative z-10 border-r border-slate-200/60 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-corporate flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Workflow className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">OpsFlow</span>
        </div>

        <div className="my-auto max-w-lg space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Enterprise Approval Engine</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            Streamline approval chains with <span className="text-gradient-corporate">complete trust & visibility</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            OpsFlow empowers modern enterprise teams to automate multi-stage review pipelines, enforce role-based governance, and maintain immutable audit histories.
          </p>

          {/* 3D Isometric Preview Card */}
          <div className="perspective-container pt-4">
            <div className="isometric-card p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-corporate-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    PO
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">Purchase Order #8492</p>
                    <p className="text-xs text-slate-500">Submitted by Marketing Ops · $12,500</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> Step 2 of 3 Approved
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-corporate h-full w-2/3 rounded-full" />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Manager Approval: Passed</span>
                <span className="font-semibold text-indigo-600">Finance Review: Pending</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} OpsFlow Platform</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>SOC2 Type II Certified</span>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden inline-flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-corporate flex items-center justify-center text-white shadow-corporate">
                <Workflow className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">OpsFlow</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in to your account</h2>
            <p className="text-slate-500 text-sm">Enter your credentials to access your workflow dashboard</p>
          </div>

          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-corporate bg-white dark:bg-slate-900 rounded-2xl">
            <CardContent className="pt-6 space-y-5">
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@company.com"
                            className="rounded-lg h-11 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="rounded-lg h-11 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-corporate text-white font-semibold rounded-lg shadow-corporate-btn hover:-translate-y-0.5 transition-all duration-200"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Authenticating..." : "Sign In to Workspace"}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-5 border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="text-sm text-center text-slate-500">
                Don't have an account yet?{" "}
                <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Create Account
                </Link>
              </div>

              {/* One-Click Quick Login Preset Accounts */}
              <div className="w-full pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1-Click Quick Demo Login</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => fillDemo("superadmin@example.com")}
                    className="h-9 text-xs justify-start px-3 rounded-lg border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <span className="h-2 w-2 rounded-full bg-purple-600 mr-2" />
                    Super Admin
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => fillDemo("admin@example.com")}
                    className="h-9 text-xs justify-start px-3 rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    <span className="h-2 w-2 rounded-full bg-indigo-600 mr-2" />
                    Admin
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => fillDemo("manager@example.com")}
                    className="h-9 text-xs justify-start px-3 rounded-lg border-violet-200 text-violet-700 hover:bg-violet-50"
                  >
                    <span className="h-2 w-2 rounded-full bg-violet-600 mr-2" />
                    Manager
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => fillDemo("employee@example.com")}
                    className="h-9 text-xs justify-start px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <span className="h-2 w-2 rounded-full bg-slate-400 mr-2" />
                    Employee
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

