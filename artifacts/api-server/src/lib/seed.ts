import { db, usersTable, workflowTemplatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "../middlewares/auth";
import { logger } from "./logger";

export const DEMO_PASSWORD = "password123";

interface DemoAccountSeed {
  name: string;
  email: string;
  role: string;
  department: string;
}

const DEMO_ACCOUNTS: DemoAccountSeed[] = [
  {
    name: "Super Admin",
    email: "superadmin@example.com",
    role: "super_admin",
    department: "Executive",
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    department: "Operations",
  },
  {
    name: "Department Manager",
    email: "manager@example.com",
    role: "manager",
    department: "Engineering",
  },
  {
    name: "Staff Employee",
    email: "employee@example.com",
    role: "employee",
    department: "Marketing",
  },
];

/**
 * Upsert a single demo account so its password hash, active flag and profile
 * always match the current SESSION_SECRET. This is isolated from template
 * seeding so a failure anywhere else can never block demo login.
 */
export async function syncDemoUser(
  email: string,
): Promise<typeof usersTable.$inferSelect | null> {
  const seed = DEMO_ACCOUNTS.find((d) => d.email === email);
  if (!seed) return null;

  try {
    const values = {
      name: seed.name,
      email: seed.email,
      role: seed.role,
      department: seed.department,
      passwordHash: hashPassword(DEMO_PASSWORD),
      isActive: true,
    };

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, seed.email));

    if (existing.length > 0) {
      await db
        .update(usersTable)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(usersTable.email, seed.email));
    } else {
      await db.insert(usersTable).values(values);
    }

    const [row] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, seed.email));
    return row ?? null;
  } catch (err) {
    logger.error({ err, email }, "Failed to sync demo user");
    return null;
  }
}

export async function seedDemoAccounts() {
  for (const seed of DEMO_ACCOUNTS) {
    await syncDemoUser(seed.email);
    logger.info(`Demo account synced: ${seed.email}`);
  }
}

async function seedDefaultTemplates() {
  try {
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
            { stepOrder: 1, approverRole: "manager", label: "Manager Approval", isRequired: true },
            { stepOrder: 2, approverRole: "admin", label: "Admin Review", isRequired: true },
          ],
        },
        {
          name: "Paid Time Off & Leave Request",
          description: "Standard vacation, medical, and personal leave approval process.",
          requestType: "leave_request",
          isActive: true,
          steps: [
            { stepOrder: 1, approverRole: "manager", label: "Manager Approval", isRequired: true },
          ],
        },
        {
          name: "Enterprise Expense Reimbursement",
          description: "Travel, dining, and client entertainment expense clearance pipeline.",
          requestType: "expense",
          isActive: true,
          steps: [
            { stepOrder: 1, approverRole: "manager", label: "Manager Approval", isRequired: true },
            { stepOrder: 2, approverRole: "super_admin", label: "Executive Review", isRequired: false },
          ],
        },
      ]);

      logger.info("Default workflow templates successfully seeded.");
    }
  } catch (err) {
    logger.error({ err }, "Error checking/seeding default workflow templates");
  }
}

export async function ensureSeedData() {
  await seedDemoAccounts();
  await seedDefaultTemplates();
}