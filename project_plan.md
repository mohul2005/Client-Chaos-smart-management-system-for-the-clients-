# Lala Ops — Client Work Operating System (MVP)

## 1. Project Description
Lala Tech LLC is a services/consulting agency whose work is scattered across spreadsheets, WhatsApp/email threads and disconnected tools. The result: requests get lost, tasks get forgotten, and nobody has a trustworthy view of what is happening.

This MVP attacks the single highest-impact problem first: **tasks getting forgotten + poor visibility**. It turns loose client requests into tracked tasks with a clear owner, priority, status and due date, and gives the whole team one shared board + live overview.

- Target users: Lala Tech internal team (managers + members) and its clients.
- Core value: nothing falls through the cracks; everyone can see who owns what, by when, and its current state.
- Positioning: the operational home of the agency — built on top of the existing marketing site.

## 2. Page Structure
- `/` - Marketing home (existing, kept)
- `/features` - Marketing features (existing, kept)
- `/pricing` - Marketing pricing (existing, kept)
- `/contact` - Marketing contact (existing, kept)
- `/login` - Team sign in / sign up
- `/request` - Public client request intake (submit a request)
- `/app` - Overview dashboard (live metrics)
- `/app/board` - Team task board (Kanban)
- `/app/requests` - Request inbox (triage incoming client requests)
- `/app/clients` - Client directory
- `/app/team` - Team directory
- `/app/settings` - Personal settings (per-teammate reminder lead time)

## 3. Core Features
- [x] Team authentication (email + password sign in / sign up)
- [x] Team directory with profiles
- [x] Client directory
- [x] Task board with owners, priority, status, due date (create / edit / move / delete)
- [x] Client request intake form -> requests inbox -> convert to task
- [x] Overview dashboard at /app: open/overdue/in-progress/completed, workload per owner, pipeline breakdown, attention list
- [x] Task activity / comments trail (who changed what, when, plus discussion)
- [x] Email notifications: assignment emails + a daily overdue / due-soon reminder digest
- [x] Personal settings: each teammate picks their own reminder lead time (1–3 days before due) and can mute assignment emails independently

## 4. Data Model Design

### Table: profiles
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key, matches auth user id |
| full_name | text | Display name |
| email | text | Work email |
| role | text | admin / manager / member |
| avatar_color | text | Accent color for avatar |
| reminder_lead_days | int | Days before a due date to send this teammate a nudge (1–3, default 1) |
| assignment_emails | boolean | Whether this teammate receives assignment emails (default true) |
| created_at | timestamptz | Created timestamp |

### Table: clients
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | text | Company / client name |
| contact_name | text | Main point of contact |
| email | text | Contact email |
| phone | text | Contact phone |
| notes | text | Free notes |
| created_at | timestamptz | Created timestamp |

### Table: tasks
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| title | text | Task title |
| description | text | Details |
| client_id | uuid | FK -> clients |
| assignee_id | uuid | FK -> profiles |
| status | text | todo / in_progress / review / done |
| priority | text | low / medium / high / urgent |
| due_date | date | Due date |
| source | text | request / internal |
| created_by | uuid | FK -> profiles |
| created_at | timestamptz | Created timestamp |
| updated_at | timestamptz | Updated timestamp |
| last_reminder_at | timestamptz | Last time a due reminder email was sent for this task |

### Table: requests
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| client_name | text | Submitting client name |
| contact_email | text | Submitter email |
| title | text | Request title |
| details | text | Request details |
| priority | text | low / medium / high / urgent |
| status | text | new / triaged / converted / declined |
| created_at | timestamptz | Created timestamp |

### Table: task_comments
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| task_id | uuid | FK -> tasks |
| author_id | uuid | FK -> profiles |
| body | text | Comment text |
| created_at | timestamptz | Created timestamp |

### Table: task_activity
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| task_id | uuid | FK -> tasks (cascade delete) |
| actor_id | uuid | FK -> profiles (who made the change) |
| kind | text | created / converted / status / priority / assignee / due_date / client / title / description |
| field | text | Raw field name that changed |
| old_value | text | Previous value |
| new_value | text | New value |
| created_at | timestamptz | Created timestamp |

### Table: app_config
| Field | Type | Description |
|-------|------|-------------|
| key | text | Primary key (e.g. `reminder_token`) |
| value | text | Value (RLS locked; read only by backend service role) |
| created_at | timestamptz | Created timestamp |

## 5. Backend / Third-party Integration Plan
- Database: SaaS Supabase (connected) — Auth + Postgres with Row Level Security.
- Email: Resend, sent through the `task-notifications` Edge Function.
  - Assignment emails fire on task create / reassign and request→task conversion.
  - A daily reminder digest (08:00) is scheduled with `pg_cron` + `pg_net`, with a
    once-per-day in-app sweep as a safety net. Tasks are de-duplicated via `last_reminder_at`.
  - Each owner's nudge window is driven by their own `profiles.reminder_lead_days` (1–3 days),
    editable from `/app/settings`; overdue tasks are always included. Assignment emails
    can be muted per teammate via `profiles.assignment_emails` without affecting reminders.
  - Requires `RESEND_API_KEY` and `RESEND_FROM_DOMAIN` in Supabase Edge Function secrets.
- Shopify: not needed.
- Stripe: not needed.

## 6. Development Phase Plan

### Phase 1: Foundation + Shared Task Board
- Goal: Team can sign in and manage all client work on one shared board.
- Deliverable: Supabase schema + auth (login/signup) + app shell + task board with create/edit/move/delete, owners, priority, status, due dates, and seeded clients.

### Phase 2: Client Request Intake
- Goal: Turn scattered client messages into a single tracked inbox.
- Deliverable: Public request form + requests inbox + one-click convert request to task.

### Phase 3: Overview & Visibility (shipped)
- Goal: Give leadership instant visibility into workload and risk.
- Deliverable: Overview dashboard at /app (KPI strip, workload per owner, pipeline + priority breakdown, needs-attention watchlist, request triage pulse). [x] Done.

### Phase 4: Task Activity + Comments Trail (shipped)
- Goal: Answer "difficulty tracking progress" — every task shows who changed what and when, and where the discussion lives.
- Deliverable: `task_activity` change log (auto-written on create / edit / request→task conversion) + comments, rendered as a merged chronological trail inside the task modal on a new Activity tab, plus a comment-count badge on board cards. [x] Done.

### Phase 5: Email Notifications — "nothing gets forgotten" (shipped)
- Goal: Close the remaining gap where a person still had to open the board to notice a slipping deadline — push the work to them instead.
- Deliverable: `task-notifications` Edge Function (Resend). Assignment emails on create / reassign / request conversion; a daily overdue + due-soon reminder digest scheduled via `pg_cron` (08:00) with an in-app daily sweep fallback; a per-task `last_reminder_at` marker to prevent duplicate nudges; and an "Email reminders" card on the Overview with a manual "send now" trigger. [x] Done.

### Phase 6: Personal Reminder Lead Time (shipped)
- Goal: Let each teammate control how far ahead they are nudged, so reminders land at a useful moment for them instead of a one-size-fits-all default.
- Deliverable: `profiles.reminder_lead_days` column (1–3, default 1) + a small Settings page at `/app/settings` (account summary, a 1/2/3-day segmented picker with instant save, and a "how reminders work" explainer). The digest engine now reads each owner's window — overdue tasks are always included. [x] Done.

### Phase 7: Assignment Email Toggle (shipped)
- Goal: Let teammates quiet the noisier assignment email without losing the safety-net reminder digest.
- Deliverable: `profiles.assignment_emails` column (default true) + an "Email me on assignment" switch on `/app/settings`. The `task-notifications` engine skips the assignment email when a teammate has muted it, while the daily digest stays fully independent. [x] Done.