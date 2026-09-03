import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, and, SQL } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";
import { UpdateUserBody } from "@workspace/api-zod";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _, updatedAt: _u, ...rest } = user;
  return {
    ...rest,
    avatarUrl: rest.avatarUrl ?? null,
    createdAt: rest.createdAt.toISOString(),
  };
}

router.get("/users", requireAuth, async (req, res) => {
  const { role, department, search } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (role) conditions.push(eq(usersTable.role, role));
  if (department) conditions.push(eq(usersTable.department, department));
  if (search) conditions.push(ilike(usersTable.name, `%${search}%`));

  const users = conditions.length > 0
    ? await db.select().from(usersTable).where(and(...conditions))
    : await db.select().from(usersTable);

  res.json(users.map(formatUser));
});

router.get("/users/departments", requireAuth, async (_req, res) => {
  const users = await db.select({ department: usersTable.department }).from(usersTable);
  const departments = [...new Set(users.map((u) => u.department))].sort();
  res.json(departments);
});

router.get("/users/:userId", requireAuth, async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

router.patch("/users/:userId", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [user] = await db.update(usersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(usersTable.id, userId))
    .returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

router.delete("/users/:userId", requireAuth, requireRole("super_admin"), async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, userId));
  res.status(204).send();
});

export default router;
