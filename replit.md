# OpsFlow

A professional Role-Based Approval & Workflow Management System for enterprises, featuring multi-step approvals, analytics, notifications, and a full audit trail.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/workflow-app run dev` — run the frontend (port 22115)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — HMAC secret for auth tokens

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query + shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/`)
- Auth: HMAC-SHA256 token (SESSION_SECRET), stored in localStorage, sent as Bearer header

## Where things live

- `artifacts/workflow-app/src/` — React frontend (pages, components, lib)
- `artifacts/api-server/src/routes/` — Express route handlers
- `lib/db/src/schema.ts` — Drizzle ORM schema (source of truth for DB shape)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/src/generated/` — Auto-generated React Query hooks + Zod schemas
- `lib/api-client-react/src/index.ts` — Barrel exports for all generated hooks

## API response shapes (important)

- `GET /api/requests` → `{ data: Request[], total, page, limit }`
- `GET /api/audit-log` → `{ data: AuditEntry[], total, page, limit }`
- `GET /api/users` → `User[]` (plain array)
- `GET /api/workflow-templates` → `WorkflowTemplate[]` (plain array)
- `GET /api/notifications` → `Notification[]` (plain array)
- `GET /api/requests/:id/comments` → `Comment[]` (plain array)
- Request items include `submittedBy: { id, name, ... }` (not `requesterName`)
- Request detail includes `approvalSteps: [...]` (not `steps`)
- Comments use `text` field (not `content`), and `user: { name, ... }` (not `authorName`)

## Seeded demo accounts (all password: `password123`)

| Email | Role |
|-------|------|
| superadmin@example.com | super_admin |
| admin@example.com | admin |
| manager@example.com | manager |
| employee@example.com | employee |

## Architecture decisions

- Contract-first API: OpenAPI spec drives codegen for both React hooks and Zod validation schemas
- HMAC-SHA256 auth tokens (not JWT) — simpler, no decode needed, just compare hash
- Drizzle ORM with raw SQL fallback for complex queries
- Role hierarchy: super_admin > admin > manager > employee — role-based route guards in frontend
- Shared reverse proxy routes `/api` to api-server and `/` to workflow-app via artifact.toml

## Product

- **Dashboard**: Stats cards (total/pending/approved/rejected requests), recent activity feed
- **Requests**: List with filter/search, create new, detail view with approve/reject/comment
- **Workflows**: Manage multi-step approval workflow templates
- **Users**: Admin-only user management with role assignment
- **Notifications**: Per-user notification feed with mark read/all-read
- **Audit Log**: Immutable audit trail of all actions
- **Settings**: User profile update

## User preferences

- Enterprise design aesthetic with clean sidebar navigation
- No emojis in UI or code
- All pages use `(data as any)` casts since generated types may differ from actual response shapes

## Gotchas

- Password hashing: HMAC-SHA256 with SESSION_SECRET env var (not bcrypt)
- `useGetApprovalPipeline` endpoint does not exist — do not use it
- `useListComments` takes `requestId: number` as positional arg
- `useGetRequest` takes `id: number` as positional arg
- The `dashboard/pipeline` route returns 404 — not implemented
- Always run codegen after changing the OpenAPI spec before touching frontend code

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
