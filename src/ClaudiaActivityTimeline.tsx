import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClaudiaActivity } from './types';

/**
 * ClaudiaActivityTimeline — the real viewer, ported from SafeSpaces' actual
 * ActivityTimeline.tsx (checked before this): reverse-chronological list, activity-type badge,
 * expandable JSON detail for activity_data, real user-name resolution (dependency-injected --
 * Claudia has no shared, generic profiles table the way SafeSpaces does).
 *
 * PDF export (a real SafeSpaces feature, tied to its own exportActivityTimelineToPDF utility)
 * is NOT ported -- named plainly, not silently dropped: a project wanting this wires its own
 * export against the same real, structured data this component already fetches.
 */
export interface ClaudiaActivityTimelineCopy {
  heading: string;
  description: string;
  empty: string;
  loading: string;
  detailsToggle: string;
  unknownUser: string;
}
const DEFAULT_COPY: ClaudiaActivityTimelineCopy = {
  heading: 'Recent activity',
  description: 'Last 50 activities',
  empty: 'No activity logged yet.',
  loading: 'Loading\u2026',
  detailsToggle: 'View details',
  unknownUser: 'Unknown user',
};

export interface ClaudiaActivityTimelineProps {
  supabase: SupabaseClient;
  projectSlug: string;
  limit?: number;
  resolveAuthor?: (userId: string) => string | null;
  copy?: Partial<ClaudiaActivityTimelineCopy>;
}

export default function ClaudiaActivityTimeline({ supabase, projectSlug, limit = 50, resolveAuthor, copy: copyProp }: ClaudiaActivityTimelineProps) {
  const copy = { ...DEFAULT_COPY, ...copyProp };
  const [activities, setActivities] = useState<ClaudiaActivity[] | null>(null);

  useEffect(() => {
    supabase.from('claudia_activity_logs').select('*')
      .eq('project_slug', projectSlug).order('created_at', { ascending: false }).limit(limit)
      .then(({ data }: { data: ClaudiaActivity[] | null }) => setActivities(data ?? []));
  }, [supabase, projectSlug, limit]);

  if (activities === null) return <p className="dim">{copy.loading}</p>;
  if (activities.length === 0) return <p className="dim">{copy.empty}</p>;

  return (
    <div>
      <h3 style={{ marginBottom: 2 }}>{copy.heading}</h3>
      <p className="dim" style={{ fontSize: '.82rem', marginTop: 0 }}>{copy.description}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        {activities.map((a) => (
          <div key={a.id} style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: '1px solid var(--claudia-kernel-line, #e0e0e0)' }}>
            <div style={{ width: 4, borderRadius: 2, background: 'var(--claudia-kernel-brand, #333)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '.88rem' }}>
                  {a.user_id ? (resolveAuthor?.(a.user_id) ?? a.user_id.slice(0, 8)) : copy.unknownUser}
                </p>
                <span style={{
                  fontSize: '.72rem', padding: '1px 8px', borderRadius: 999,
                  border: '1px solid var(--claudia-kernel-line, #e0e0e0)', color: 'var(--claudia-kernel-text-dim, #666)',
                }}>{a.activity_type}</span>
              </div>
              <p className="dim" style={{ fontSize: '.78rem', margin: '2px 0 0' }}>{new Date(a.created_at).toLocaleString()}</p>
              {Object.keys(a.activity_data ?? {}).length > 0 && (
                <details style={{ marginTop: 6, fontSize: '.8rem' }}>
                  <summary className="dim" style={{ cursor: 'pointer' }}>{copy.detailsToggle}</summary>
                  <pre style={{
                    marginTop: 6, padding: 8, fontSize: '.72rem', overflow: 'auto',
                    background: 'var(--claudia-kernel-surface, #f5f5f5)', borderRadius: 'var(--claudia-kernel-radius, 8px)',
                  }}>{JSON.stringify(a.activity_data, null, 2)}</pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
