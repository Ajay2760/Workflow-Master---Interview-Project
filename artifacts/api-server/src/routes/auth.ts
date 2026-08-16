import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, hashPassword, requireAuth } from "../middlewares/auth";
import { LoginBody, RegisterBody } from "@workspace/api-zod";
import { ensureSeedData } from "../lib/seed";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...rest } = user;
  return {
    ...rest,
    avatarUrl: rest.avatarUrl ?? null,
    createdAt: rest.createdAt.toISOString(),
    updatedAt: rest.updatedAt.toISOString(),
  };
}

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;
  let [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  
  if (!user) {
    // Attempt auto-seeding default demo accounts if database was just provisioned
    await ensureSeedData();
    [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  }

  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const token = signToken(user.id);
  res.json({ user: formatUser(user), token });
});


router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const { name, email, password, role, department } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    role,
    department,
  }).returning();
  const token = signToken(user.id);
  res.status(201).json({ user: formatUser(user), token });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  res.json(formatUser(user));
});

export default router;
