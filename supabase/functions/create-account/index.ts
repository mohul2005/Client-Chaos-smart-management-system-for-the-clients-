import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// ---------------------------------------------------------------------------
// Create Account — password signup without any confirmation email.
//
// Supabase normally emails a confirmation link on signup, which causes the
// "email rate limit exceeded" error and the Gmail verification detour. This
// function creates the user directly through the Admin API with the email
// already confirmed, so NO email is ever generated. The client then signs in
// with the same email + password to obtain a real session, which keeps all of
// the workspace's row-level security working exactly as before.
//
// Always responds with HTTP 200 and a { ok, code, message } body so the client
// can branch on code without wrestling with HTTP errors.
// ---------------------------------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ ok: false, code: 'method', message: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return json({ ok: false, code: 'config', message: 'Backend not configured.' });
  }
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const fullName = String(body.fullName ?? '').trim();

  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, code: 'invalid_email', message: 'Please enter a valid email address.' });
  }
  if (password.length < 6) {
    return json({ ok: false, code: 'weak_password', message: 'Password must be at least 6 characters.' });
  }
  if (!fullName) {
    return json({ ok: false, code: 'invalid_name', message: 'Please enter your name.' });
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    const message = (error.message || '').toLowerCase();
    if (
      message.includes('already') ||
      message.includes('registered') ||
      message.includes('exists')
    ) {
      return json({
        ok: false,
        code: 'already_exists',
        message: 'An account with this email already exists.',
      });
    }
    return json({ ok: false, code: 'error', message: error.message || 'Could not create the account.' });
  }

  return json({ ok: true, userId: data.user?.id ?? null });
});
