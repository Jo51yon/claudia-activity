import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * logClaudiaActivity — a fire-and-forget activity logger. Ported from SafeSpaces' real
 * logActivity() (checked its actual source before this): deliberately never throws --
 * SafeSpaces' own comment says why: "silently fails to avoid disrupting user experience". A
 * failed audit-log write should not be the reason a real user action visibly breaks.
 *
 * Framework-agnostic on purpose, not a React hook: the real call sites this replaces (posting
 * a comment, earning a badge, publishing an article) are event handlers and backend logic, not
 * components -- forcing a hook here would mean wrapping every real caller in a component just
 * to use it.
 *
 * activityType is free text, not the rigid TypeScript union SafeSpaces has
 * (blog_created/event_rsvp/booking_created...) -- entirely SafeSpaces-domain-specific, none of
 * it applicable to Claudia's real, very different projects. Each real project defines its own
 * real vocabulary.
 */
export interface LogClaudiaActivityParams {
  supabase: SupabaseClient;
  projectSlug: string;
  userId: string;
  activityType: string;
  activityData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  /** Called on failure -- the function itself still never throws. Defaults to console.error. */
  onError?: (error: unknown) => void;
}

export async function logClaudiaActivity({
  supabase, projectSlug, userId, activityType, activityData = {}, metadata = {}, onError,
}: LogClaudiaActivityParams): Promise<void> {
  try {
    const { error } = await supabase.from('claudia_activity_logs').insert({
      project_slug: projectSlug,
      user_id: userId,
      activity_type: activityType,
      activity_data: activityData,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        ...(typeof navigator !== 'undefined' ? { user_agent: navigator.userAgent } : {}),
      },
    });
    if (error) (onError ?? console.error)(error);
  } catch (e) {
    (onError ?? console.error)(e);
  }
}
