import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AVATAR_BG, ROLE_META } from '@/lib/constants';
import { initials } from '@/lib/format';
import LeadTimeCard from './components/LeadTimeCard';
import AssignmentEmailCard from './components/AssignmentEmailCard';

const DEFAULTS = [1, 2, 3];

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [lead, setLead] = useState<number>(profile?.reminder_lead_days ?? 1);
  const [assignmentEmails, setAssignmentEmails] = useState<boolean>(profile?.assignment_emails ?? true);

  useEffect(() => {
    if (profile?.reminder_lead_days) setLead(profile.reminder_lead_days);
  }, [profile?.reminder_lead_days]);

  useEffect(() => {
    if (profile) setAssignmentEmails(profile.assignment_emails ?? true);
  }, [profile]);

  const color = AVATAR_BG[profile?.avatar_color || 'default'] || AVATAR_BG.default;
  const role = profile?.role ? ROLE_META[profile.role] : null;
  const safeLead = DEFAULTS.includes(lead) ? lead : 1;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Your settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Personal preferences for your workspace. These only affect your own notifications.
        </p>
      </div>

      {/* Account summary */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
            {initials(profile?.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 truncate">{profile?.full_name || 'Teammate'}</p>
            <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
          </div>
          {role && (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${role.chip}`}>
              {role.label}
            </span>
          )}
        </div>
      </section>

      {profile && (
        <LeadTimeCard
          userId={profile.id}
          current={safeLead}
          onSaved={async (days) => {
            setLead(days);
            await refreshProfile();
          }}
        />
      )}

      {profile && (
        <AssignmentEmailCard
          userId={profile.id}
          current={assignmentEmails}
          onSaved={async (enabled) => {
            setAssignmentEmails(enabled);
            await refreshProfile();
          }}
        />
      )}

      {/* How reminders work */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <i className="ri-question-line text-lg text-slate-500"></i>
          </div>
          <h3 className="text-base font-bold text-slate-900">How reminders work</h3>
        </div>
        <ul className="flex flex-col gap-3">
          <li className="flex items-start gap-3">
            <i className="ri-user-add-line text-slate-400 mt-0.5"></i>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Assignment emails</strong> go out the moment a task is given to
              you — with the client, priority and due date.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <i className="ri-calendar-check-line text-slate-400 mt-0.5"></i>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Daily nudges</strong> arrive each morning for anything inside your
              lead-time window, bundled into a single email.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <i className="ri-history-line text-slate-400 mt-0.5"></i>
            <p className="text-xs text-slate-500 leading-relaxed">
              Each task is only reminded <strong className="text-slate-700">once per day</strong>, so your inbox
              never gets spammed.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}