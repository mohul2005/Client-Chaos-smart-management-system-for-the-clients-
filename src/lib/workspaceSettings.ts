import { supabase } from './supabase';

/** app_config key holding the workspace-wide baseline for assignment emails. */
const ASSIGNMENT_DEFAULT_KEY = 'default_assignment_emails';

/** Only these keys are readable by the app; the rest stay private to the backend. */
export type WorkspaceSettingKey = typeof ASSIGNMENT_DEFAULT_KEY;

/**
 * Read the workspace-wide default for assignment emails.
 * Falls back to `true` (the historical behaviour) when the row is missing.
 */
export async function getAssignmentEmailDefault(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', ASSIGNMENT_DEFAULT_KEY)
      .maybeSingle();
    if (error) throw error;
    return (data?.value ?? 'true') !== 'false';
  } catch {
    return true;
  }
}

/**
 * Persist the workspace-wide default. Only admins pass the RLS policy; the
 * database rejects writes from anyone else.
 */
export async function setAssignmentEmailDefault(enabled: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('app_config')
    .upsert({ key: ASSIGNMENT_DEFAULT_KEY, value: String(enabled) }, { onConflict: 'key' });
  return { error: error ? error.message : null };
}

/** Resolve whether a teammate effectively receives assignment emails. */
export function resolveAssignmentEmails(
  override: boolean | null | undefined,
  workspaceDefault: boolean,
): boolean {
  return override ?? workspaceDefault;
}