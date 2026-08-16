import { db, usersTable, workflowTemplatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "../middlewares/auth";
import { logger } from "./logger";

export async function ensureSeedData() {
  try {
    const existingUsers = await db.select().from(usersTable);
    if (existingUsers.length === 0) {
      logger.info("No users found in database. Initializing demo accounts...");

      const defaultPassword = hashPassword("password123");

      await db.insert(usersTable).values([
        {
          name: "Super Admin",
          email: "superadmin@example.com",
          passwordHash: defaultPassword,
          role: "super_admin",
          department: "Executive",
        },
        {
          name: "Admin User",
          email: "admin@example.com",
          passwordHash: defaultPassword,
          role: "admin",
          department: "Operations",
        },
        {
          name: "Department Manager",
          email: "manager@example.com",
          passwordHash: defaultPassword,
          role: "manager",
          department: "Engineering",
        },
        {
          name: "Staff Employee",
          email: "employee@example.com",
          passwordHash: defaultPassword,
          role: "employee",
          department: "Marketing",
        },
      ]);

      logger.info("Demo user accounts successfully seeded.");
    }

    const existingTemplates = await db.select().from(workflowTemplatesTable);
    if (existingTemplates.length === 0) {
      logger.info("Initializing default workflow templates...");

      await db.insert(workflowTemplatesTable).values([
        {
          name: "Standard Equipment & Software Purchase",
          description: "Approval workflow for hardware, software licenses, and IT equipment requests under $10,000.",
          requestType: "purchase_order",
          isActive: true,
          steps: [
            { id: "1", approverRole: "manager", isRequired: true, durationDays: 2 },
            { id: "2", approverRole: "admin", isRequired: true, durationDays: 3 },
          ],
        },
        {
          name: "Paid Time Off & Leave Request",
          description: "Standard vacation, medical, and personal leave approval process.",
          requestType: "leave_request",
          isActive: true,
          steps: [
            { id: "1", approverRole: "manager", isRequired: true, durationDays: 1 },
          ],
        },
        {
          name: "Enterprise Expense Reimbursement",
          description: "Travel, dining, and client entertainment expense clearance pipeline.",
          requestType: "expense",
          isActive: true,
          steps: [
            { id: "1", approverRole: "manager", isRequired: true, durationDays: 2 },
            { id: "2", approverRole: "super_admin", isRequired: false, durationDays: 5 },
          ],
        },
      ]);

      logger.info("Default workflow templates successfully seeded.");
    }
  } catch (err) {
    logger.error({ err }, "Error checking/seeding initial database data");
  }
}
