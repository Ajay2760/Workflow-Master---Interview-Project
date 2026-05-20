import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { workflowTemplatesTable } from "./workflow-templates";

export const requestsTable = pgTable("requests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  submittedById: integer("submitted_by_id").notNull().references(() => usersTable.id),
  assignedToId: integer("assigned_to_id").references(() => usersTable.id),
  workflowTemplateId: integer("workflow_template_id").references(() => workflowTemplatesTable.id),
  currentStepOrder: integer("current_step_order").default(1),
  totalSteps: integer("total_steps").default(1),
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRequestSchema = createInsertSchema(requestsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = typeof requestsTable.$inferSelect;
