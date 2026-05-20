import { cn } from "@/lib/utils";

type Status = "pending" | "in_review" | "approved" | "rejected" | "cancelled" | "draft" | string;

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  in_review: { label: "In Review", className: "bg-blue-100 text-blue-800 border-blue-200" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-700 border-gray-200" },
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700 border-gray-200" },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_MAP[status] ?? { label: status, className: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", config.className)}>
      {config.label}
    </span>
  );
}

type Priority = "low" | "medium" | "high" | "urgent" | string;

const PRIORITY_MAP: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-gray-100 text-gray-600 border-gray-200" },
  medium: { label: "Medium", className: "bg-blue-100 text-blue-700 border-blue-200" },
  high: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700 border-red-200" },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_MAP[priority] ?? { label: priority, className: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", config.className)}>
      {config.label}
    </span>
  );
}

type Role = "super_admin" | "admin" | "manager" | "employee" | string;

const ROLE_MAP: Record<string, { label: string; className: string }> = {
  super_admin: { label: "Super Admin", className: "bg-purple-100 text-purple-800 border-purple-200" },
  admin: { label: "Admin", className: "bg-blue-100 text-blue-800 border-blue-200" },
  manager: { label: "Manager", className: "bg-teal-100 text-teal-800 border-teal-200" },
  employee: { label: "Employee", className: "bg-gray-100 text-gray-700 border-gray-200" },
};

export function RoleBadge({ role }: { role: Role }) {
  const config = ROLE_MAP[role] ?? { label: role, className: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", config.className)}>
      {config.label}
    </span>
  );
}
