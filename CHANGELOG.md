# Changelog

Semantic versioning: MAJOR = a prop, exported type, or default behaviour changed in a way that
could break an existing consumer without any code change on their side. MINOR = additive only.
Consuming projects should pin to a tag (`#v1.0.0`), never `#main`.

## v1.0.0 — 2026-08-23

First release. `logClaudiaActivity` (fire-and-forget logger) + `ClaudiaActivityTimeline`
(reverse-chronological viewer) -- ported from SafeSpaces' real `logActivity()` and its actual
`ActivityTimeline.tsx` (checked both before this).

`activityType` is free text, not the rigid TypeScript union SafeSpaces has
(`blog_created`/`event_rsvp`/`booking_created`...) -- entirely SafeSpaces-domain-specific, none
of it applicable to Claudia's real, very different projects. Each real project defines its own
real vocabulary, matching the same generalisation already applied to `entity_type` in
`claudia-comments`/`claudia-reactions`.

The logger is framework-agnostic on purpose, not a React hook -- the real call sites this
replaces are event handlers and backend logic, not components. Deliberately never throws,
preserving SafeSpaces' own documented reasoning: a failed audit-log write should not be why a
real user action visibly breaks. A real, optional `onError` hook is added on top so failures
stay observable during development without breaking that contract.

PDF export (a real SafeSpaces feature tied to its own utility) is NOT ported -- named plainly.

Different RLS shape from `claudia-comments`/`claudia-reactions`, on purpose: an activity log
is audit-facing, not a public social feed. Proven with real tests before the UI was built: a
user can log and read their own activity; a genuinely different, non-owner authenticated
session's attempt to log an activity claiming someone else's user id is refused (the actual
policy-violation error); that same session's read of another user's activity returns zero
rows, confirmed directly, not assumed.

**Known consumers at this tag:** none yet at release.
