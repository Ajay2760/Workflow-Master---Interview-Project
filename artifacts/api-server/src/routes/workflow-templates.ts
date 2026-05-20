import { Router } from "express";
import { db, workflowTemplatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";
import { CreateWorkflowTemplateBody, UpdateWorkflowTemplateBody } from "@workspace/api-zod";

const router = Router();

function formatTemplate(t: typeof workflowTemplatesTable.$inferSelect) {
  return {
    ...t,
    description: t.description ?? null,
    steps: (t.steps as any[]) || [],
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

router.get("/workflow-templates", requireAuth, async (_req, res) => {
  const templates = await db.select().from(workflowTemplatesTable);
  res.json(templates.map(formatTemplate));
});

router.post("/workflow-templates", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  const parsed = CreateWorkflowTemplateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { name, description, requestType, isActive, steps } = parsed.data;
  const [template] = await db.insert(workflowTemplatesTable).values({
    name,
    description: description ?? null,
    requestType,
    isActive: isActive ?? true,
    steps: steps as any,
  }).returning();
  res.status(201).json(formatTemplate(template));
});

router.get("/workflow-templates/:templateId", requireAuth, async (req, res) => {
  const id = parseInt(req.params.templateId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [template] = await db.select().from(workflowTemplatesTable).where(eq(workflowTemplatesTable.id, id));
  if (!template) { res.status(404).json({ error: "Template not found" }); return; }
  res.json(formatTemplate(template));
});

router.patch("/workflow-templates/:templateId", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  const id = parseInt(req.params.templateId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateWorkflowTemplateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const data: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.steps) data.steps = parsed.data.steps as any;
  const [template] = await db.update(workflowTemplatesTable).set(data).where(eq(workflowTemplatesTable.id, id)).returning();
  if (!template) { res.status(404).json({ error: "Template not found" }); return; }
  res.json(formatTemplate(template));
});

router.delete("/workflow-templates/:templateId", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  const id = parseInt(req.params.templateId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(workflowTemplatesTable).where(eq(workflowTemplatesTable.id, id));
  res.status(204).send();
});

export default router;
