import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { requestsTable } from "./requests";

export const auditLogTable = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => requestsTable.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  performedById: integer("performed_by_id").notNull().references(() => usersTable.id),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogTable.$inferSelect;
