import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { requestsTable } from "./requests";
import { usersTable } from "./users";

export const approvalStepsTable = pgTable("approval_steps", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().references(() => requestsTable.id, { onDelete: "cascade" }),
  stepOrder: integer("step_order").notNull(),
  approverRole: text("approver_role").notNull(),
  approverId: integer("approver_id").references(() => usersTable.id),
  status: text("status").notNull().default("pending"),
  comment: text("comment"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertApprovalStepSchema = createInsertSchema(approvalStepsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertApprovalStep = z.infer<typeof insertApprovalStepSchema>;
export type ApprovalStep = typeof approvalStepsTable.$inferSelect;
