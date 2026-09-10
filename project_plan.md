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

## 3. Core Features
- [ ] Team authentication (email + password sign in / sign up)
- [ ] Team directory with profiles
- [ ] Client directory
- [ ] Task board with owners, priority, status, due date (create / edit / move / delete)
- [ ] Client request intake form -> requests inbox -> convert to task
- [ ] Overview dashboard: overdue, in progress, completed, workload per owner
- [ ] Task activity / comments trail

## 4. Data Model Design

### Table: profiles
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key, matches auth user id |
| full_name | text | Display name |
| email | text | Work email |
| role | text | admin / manager / member |
| avatar_color | text | Accent color for avatar |
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

## 5. Backend / Third-party Integration Plan
- Database: SaaS Supabase (connected) — Auth + Postgres with Row Level Security.
- Shopify: not needed.
- Stripe: not needed.
- Others: none required for the MVP.

## 6. Development Phase Plan

### Phase 1: Foundation + Shared Task Board
- Goal: Team can sign in and manage all client work on one shared board.
- Deliverable: Supabase schema + auth (login/signup) + app shell + task board with create/edit/move/delete, owners, priority, status, due dates, and seeded clients.

### Phase 2: Client Request Intake
- Goal: Turn scattered client messages into a single tracked inbox.
- Deliverable: Public request form + requests inbox + one-click convert request to task.

### Phase 3: Overview & Visibility
- Goal: Give leadership instant visibility into workload and risk.
- Deliverable: Overview dashboard (overdue, in-progress, completed, workload per owner) + task comments/activity.