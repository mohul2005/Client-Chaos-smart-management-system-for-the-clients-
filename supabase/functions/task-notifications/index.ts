import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// ---------------------------------------------------------------------------
// TASKS — email notification engine
// Two jobs:
//   action = "assigned" -> tell a teammate a task was just assigned to them
//   action = "digest"   -> nudge every owner about their overdue / due-soon work
// Emails are sent through Resend using RESEND_API_KEY + RESEND_FROM_DOMAIN.
// Each owner controls their own reminder lead time (1-3 days before due) and
// can mute assignment emails independently of the daily reminders.
// ---------------------------------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BRAND = 'TASKS';

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};
const PRIORITY_COLOR: Record<string, string> = {
  low: '#64748b',
  medium: '#334155',
  high: '#d97706',
  urgent: '#dc2626',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function fmtDate(d: string | null): string {
  if (!d) return 'No due date';
  return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Whole-day difference between a due date and today (negative = overdue). */
function dayDiff(due: string | null, todayIso: string): number | null {
  if (!due) return null;
  const a = new Date(`${due}T00:00:00Z`).getTime();
  const b = new Date(`${todayIso}T00:00:00Z`).getTime();
  return Math.round((a - b) / 86400000);
}

function dueChip(due: string | null, todayIso: string, done = false): string {
  if (done) return '<span style="color:#059669;font-size:13px;font-weight:600;">Completed</span>';
  const diff = dayDiff(due, todayIso);
  if (diff === null) return '<span style="color:#94a3b8;font-size:13px;">No due date</span>';
  if (diff < 0) {
    const n = Math.abs(diff);
    return `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#fee2e2;color:#dc2626;font-size:12px;font-weight:700;">Overdue · ${n} day${n === 1 ? '' : 's'}</span>`;
  }
  if (diff === 0) {
    return '<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#fef3c7;color:#b45309;font-size:12px;font-weight:700;">Due today</span>';
  }
  if (diff === 1) {
    return '<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#fef3c7;color:#b45309;font-size:12px;font-weight:700;">Due tomorrow</span>';
  }
  return `<span style="color:#334155;font-size:13px;font-weight:600;">${esc(fmtDate(due))}</span>`;
}

function shell(inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#eef2f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f6;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;">
<tr><td style="background:#1c2b3a;padding:20px 28px;">
<span style="color:#ffffff;font-size:16px;font-weight:800;letter-spacing:1.5px;">${BRAND}</span>
<span style="color:#94a3b8;font-size:13px;">&nbsp;·&nbsp;delivery workspace</span>
</td></tr>
<tr><td style="padding:28px;">${inner}</td></tr>
<tr><td style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;">
<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">You are receiving this because email notifications are switched on for your ${BRAND} workspace. Manage them any time in Settings.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
<td style="padding:8px 0;color:#94a3b8;font-size:13px;width:110px;vertical-align:top;">${esc(label)}</td>
<td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:600;vertical-align:top;">${value}</td>
</tr>`;
}

function button(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;margin-top:24px;padding:12px 22px;border-radius:8px;background:#1c2b3a;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">${esc(label)}</a>`;
}

type SendResult = { ok: boolean; error: string | null };

async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    return {
      ok: false,
      error:
        'Email is not configured yet. Add RESEND_API_KEY and RESEND_FROM_DOMAIN in your Supabase Edge Function secrets.',
    };
  }
  const domain = Deno.env.get('RESEND_FROM_DOMAIN');
  const from = domain ? `${BRAND} <noreply@${domain}>` : `${BRAND} <onboarding@resend.dev>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    const text = await res.text();
    if (!res.ok) {
      let msg = text;
      try {
        const parsed = JSON.parse(text);
        msg = parsed?.message || parsed?.error || text;
      } catch {
        /* keep raw text */
      }
      return { ok: false, error: String(msg || `Resend error ${res.status}`) };
    }
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not reach Resend.' };
  }
}

// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;

function boardUrl(origin: unknown): string {
  const base = typeof origin === 'string' && /^https?:\/\//.test(origin) ? origin.replace(/\/+$/, '') : '';
  return `${base}/app/board`;
}

// deno-lint-ignore no-explicit-any
async function handleAssigned(admin: any, body: Row) {
  const taskId = String(body.taskId || '');
  if (!taskId) return json({ ok: false, error: 'taskId is required' }, 400);

  const { data: task, error } = await admin
    .from('tasks')
    .select('id, title, description, priority, status, due_date, assignee_id, client_id')
    .eq('id', taskId)
    .maybeSingle();
  if (error) return json({ ok: false, error: error.message });
  if (!task) return json({ ok: false, error: 'Task not found' }, 404);
  if (!task.assignee_id) return json({ ok: true, skipped: 'unassigned' });

  const { data: profile } = await admin
    .from('profiles')
    .select('id, full_name, email, assignment_emails')
    .eq('id', task.assignee_id)
    .maybeSingle();
  const to = (profile as Row | null)?.email as string | undefined;
  if (!to) return json({ ok: true, skipped: 'assignee has no email' });
  // Respect the teammate's personal "email me on assignment" preference.
  if ((profile as Row | null)?.assignment_emails === false) {
    return json({ ok: true, skipped: 'assignee muted assignment emails' });
  }

  let clientName: string | null = null;
  if (task.client_id) {
    const { data: client } = await admin.from('clients').select('name').eq('id', task.client_id).maybeSingle();
    clientName = (client as Row | null)?.name ?? null;
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const name = (profile as Row | null)?.full_name || 'there';
  const link = boardUrl(body.origin);
  const includeLink = !!body.origin;

  const rows = [
    infoRow('Client', clientName ? esc(clientName) : '<span style="color:#94a3b8;font-weight:400;">Internal</span>'),
    infoRow(
      'Priority',
      `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#f1f5f9;color:${PRIORITY_COLOR[task.priority] || '#334155'};font-size:12px;font-weight:700;">${esc(PRIORITY_LABEL[task.priority] || task.priority)}</span>`,
    ),
    infoRow('Due', dueChip(task.due_date, todayIso)),
  ].join('');

  const desc = task.description
    ? `<div style="margin-top:20px;padding:14px 16px;border-left:3px solid #e2e8f0;background:#f8fafc;border-radius:6px;"><p style="margin:0;color:#475569;font-size:13px;line-height:1.6;">${esc(task.description)}</p></div>`
    : '';

  const inner = `
<p style="margin:0 0 8px;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">New assignment</p>
<h1 style="margin:0 0 16px;color:#0f172a;font-size:20px;line-height:1.35;font-weight:800;">${esc(task.title)}</h1>
<p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">Hi ${esc(name)}, a task has just been assigned to you.</p>
${desc}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px;width:100%;border-top:1px solid #e2e8f0;">${rows}</table>
${includeLink ? button(link, 'Open the task board') : ''}`;

  const result = await sendEmail(to, `You've been assigned: ${task.title}`, shell(inner));
  if (!result.ok) return json({ ok: false, error: result.error });
  return json({ ok: true, sentTo: to });
}

// deno-lint-ignore no-explicit-any
async function handleDigest(admin: any, body: Row) {
  const todayIso = new Date().toISOString().slice(0, 10);

  // Every teammate picks their own nudge window (1-3 days before due), so we
  // bound the query by the largest possible window to pull only what could
  // ever be relevant for someone.
  const MAX_LEAD = 3;
  const horizon = new Date(`${todayIso}T00:00:00Z`);
  horizon.setUTCDate(horizon.getUTCDate() + MAX_LEAD);
  const horizonIso = horizon.toISOString().slice(0, 10);

  const { data: tasks, error } = await admin
    .from('tasks')
    .select('id, title, priority, status, due_date, assignee_id, client_id, last_reminder_at')
    .neq('status', 'done')
    .not('assignee_id', 'is', null)
    .not('due_date', 'is', null)
    .lte('due_date', horizonIso);
  if (error) return json({ ok: false, error: error.message });

  const allTasks = (tasks || []) as Row[];
  if (!allTasks.length) return json({ ok: true, sent: 0, tasks: 0 });

  const startOfToday = new Date(`${todayIso}T00:00:00Z`).toISOString();
  const assigneeIds = [...new Set(allTasks.map((t) => t.assignee_id))];

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, email, reminder_lead_days')
    .in('id', assigneeIds);
  const profileById = new Map(((profiles || []) as Row[]).map((p) => [p.id, p]));

  // How many days before a due date this owner wants to be nudged (default 1).
  const leadDaysFor = (id: string): number => {
    const n = Number(profileById.get(id)?.reminder_lead_days);
    return n >= 1 && n <= 3 ? n : 1;
  };

  // A task is nudged when it falls inside the owner's personal window (or is
  // already overdue) and hasn't already been remembered today.
  const due = allTasks.filter((t) => {
    if (t.last_reminder_at && String(t.last_reminder_at) >= startOfToday) return false;
    const diff = dayDiff(t.due_date, todayIso);
    if (diff === null) return false;
    return diff < 0 || diff <= leadDaysFor(t.assignee_id);
  });
  if (!due.length) return json({ ok: true, sent: 0, tasks: 0 });

  const byAssignee = new Map<string, Row[]>();
  due.forEach((t) => {
    const list = byAssignee.get(t.assignee_id) || [];
    list.push(t);
    byAssignee.set(t.assignee_id, list);
  });

  const clientIds = [...new Set(due.map((t) => t.client_id).filter(Boolean))];
  const clientById = new Map<string, string>();
  if (clientIds.length) {
    const { data: clients } = await admin.from('clients').select('id, name').in('id', clientIds);
    ((clients || []) as Row[]).forEach((c) => clientById.set(c.id, c.name));
  }

  const link = boardUrl(body.origin);
  const includeLink = !!body.origin;

  let sent = 0;
  const errors: string[] = [];
  const reminded: string[] = [];

  for (const [assigneeId, list] of byAssignee) {
    const profile = profileById.get(assigneeId);
    const to = profile?.email as string | undefined;
    if (!to) continue;

    const lead = leadDaysFor(assigneeId);
    const sorted = [...list].sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)));
    const overdueCount = sorted.filter((t) => (dayDiff(t.due_date, todayIso) ?? 0) < 0).length;

    const items = sorted
      .map((t) => {
        const client = t.client_id ? clientById.get(t.client_id) : null;
        const meta = [client ? esc(client) : 'Internal', PRIORITY_LABEL[t.priority] || t.priority]
          .filter(Boolean)
          .join(' &nbsp;·&nbsp; ');
        return `<tr><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
<div style="color:#0f172a;font-size:14px;font-weight:700;line-height:1.4;">${esc(t.title)}</div>
<div style="margin-top:4px;color:#94a3b8;font-size:12px;">${meta}</div>
<div style="margin-top:6px;">${dueChip(t.due_date, todayIso)}</div>
</td></tr>`;
      })
      .join('');

    const windowLabel = `${lead} day${lead === 1 ? '' : 's'}`;
    const heading =
      overdueCount > 0
        ? `<strong style="color:#dc2626;">${overdueCount} overdue</strong> and ${sorted.length - overdueCount} due soon`
        : `${sorted.length} ${sorted.length === 1 ? 'task is' : 'tasks are'} due within the next ${windowLabel}`;

    const inner = `
<p style="margin:0 0 8px;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Daily reminder</p>
<h1 style="margin:0 0 12px;color:#0f172a;font-size:20px;line-height:1.35;font-weight:800;">${sorted.length === 1 ? 'A task needs your attention' : `${sorted.length} tasks need your attention`}</h1>
<p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">Hi ${esc(profile?.full_name || 'there')}, here is where things stand: ${heading}.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:18px;width:100%;">${items}</table>
${includeLink ? button(link, 'Open the task board') : ''}
<p style="margin:20px 0 0;color:#94a3b8;font-size:11px;line-height:1.5;">Your reminder lead time is ${windowLabel} before the due date. You can change this any time in Settings.</p>`;

    const subject =
      overdueCount > 0
        ? `${BRAND}: ${overdueCount} task${overdueCount === 1 ? '' : 's'} overdue`
        : `${BRAND}: ${sorted.length} task${sorted.length === 1 ? '' : 's'} due soon`;

    const result = await sendEmail(to, subject, shell(inner));
    if (result.ok) {
      sent += 1;
      sorted.forEach((t) => reminded.push(t.id));
    } else if (result.error) {
      errors.push(result.error);
    }
  }

  if (reminded.length) {
    await admin.from('tasks').update({ last_reminder_at: new Date().toISOString() }).in('id', reminded);
  }

  return json({ ok: sent > 0 || due.length === 0, sent, tasks: due.length, errors });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return json({ ok: false, error: 'Backend not configured' }, 500);
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    let body: Row = {};
    try {
      body = ((await req.json()) || {}) as Row;
    } catch {
      body = {};
    }
    const action = String(body.action || '');

    // Authorise: either a real signed-in teammate, or the scheduled cron secret.
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
    let authorized = false;
    if (token) {
      const { data, error } = await admin.auth.getUser(token);
      if (!error && data?.user) authorized = true;
    }
    if (!authorized) {
      const cronSecret = (req.headers.get('x-cron-secret') ?? '').trim();
      if (cronSecret) {
        const { data } = await admin
          .from('app_config')
          .select('value')
          .eq('key', 'reminder_token')
          .maybeSingle();
        const expected = (data as { value?: string } | null)?.value;
        if (expected && cronSecret === expected) authorized = true;
      }
    }
    if (!authorized) return json({ ok: false, error: 'Unauthorized' }, 401);

    if (action === 'assigned') return await handleAssigned(admin, body);
    if (action === 'digest') return await handleDigest(admin, body);
    return json({ ok: false, error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : 'Unexpected error' }, 500);
  }
});
