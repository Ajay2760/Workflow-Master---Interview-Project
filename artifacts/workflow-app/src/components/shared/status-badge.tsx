import { cn } from "@/lib/utils";

type Status = "pending" | "in_review" | "approved" | "rejected" | "cancelled" | "draft" | string;

const STATUS_MAP: Record<string, { label: string; className: string; dotClass: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500 animate-pulse",
  },
  in_review: {
    label: "In Review",
    className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    dotClass: "bg-indigo-500 animate-pulse",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    dotClass: "bg-slate-400",
  },
  draft: {
    label: "Draft",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    dotClass: "bg-slate-400",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    dotClass: "bg-slate-400",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs transition-all", config.className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotClass)} />
      {config.label}
    </span>
  );
}

type Priority = "low" | "medium" | "high" | "urgent" | string;

const PRIORITY_MAP: Record<string, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/80 dark:border-slate-700",
  },
  medium: {
    label: "Medium",
    className: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  },
  high: {
    label: "High",
    className: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-semibold",
  },
  urgent: {
    label: "Urgent",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 border-rose-300 dark:border-rose-700 font-bold shadow-xs",
  },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_MAP[priority] ?? {
    label: priority,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", config.className)}>
      {config.label}
    </span>
  );
}

type Role = "super_admin" | "admin" | "manager" | "employee" | string;

const ROLE_MAP: Record<string, { label: string; className: string }> = {
  super_admin: {
    label: "Super Admin",
    className: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-xs font-semibold",
  },
  admin: {
    label: "Admin",
    className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700 font-medium",
  },
  manager: {
    label: "Manager",
    className: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200 border-violet-200 dark:border-violet-700 font-medium",
  },
  employee: {
    label: "Employee",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  },
};

export function RoleBadge({ role }: { role: Role }) {
  const config = ROLE_MAP[role] ?? {
    label: role.replace("_", " "),
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border capitalize", config.className)}>
      {config.label}
    </span>
  );
}

