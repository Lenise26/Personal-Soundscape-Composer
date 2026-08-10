# Architecture

## Design goals

Personal Soundscape Composer is intentionally dependency-free. The current product is a single-user browser application, so the architecture favors portability, reviewability, and safe future expansion over infrastructure complexity.

## Modules

- `app.js` owns application state, rendering, event delegation, composition editing, timeline seeking, and orchestration.
- `audioEngine.js` owns Web Audio context creation, synthesized ambient voices, fades, loop behavior, scheduling, and cleanup.
- `data.js` contains the sound catalog, realistic starter compositions, and reusable U.S.-focused configurations.
- `storage.js` isolates persistence behind a tiny adapter so localStorage can later be replaced by an API client.
- `format.js` contains deterministic formatting and range helpers that are easy to test independently.
- `styles.css` contains the responsive design system and desktop/tablet/mobile layouts.

## State model

A composition contains metadata, duration, tags, and ordered layers. Each layer stores a preset reference, volume, start/end seconds, fade timings, loop state, and mute state. Duplication always creates new composition and layer IDs so the source version stays independent.

## Audio strategy

No audio files are bundled. The Web Audio API generates filtered noise and oscillator textures at runtime. This avoids unknown media licensing and keeps the repository small. Loop-enabled layers sustain through their scheduled timeline window; loop-disabled generated textures behave as short one-shot previews.

## Production extension points

For a team or SaaS edition:

1. Replace `storage.js` with authenticated API persistence.
2. Keep composition ownership and authorization server-side.
3. Add an upload service only for licensed customer audio and validate file types server-side.
4. Move downloadable mix rendering into an asynchronous server job or dedicated media worker.
5. Add organization/workspace identifiers without changing the layer schema.
6. Add conflict-safe revision metadata if multiple team members can edit the same composition.

## Security considerations

User-editable composition text is escaped before being interpolated into rendered HTML. The included development server prevents path traversal and sends basic defensive headers. A hosted multi-user edition would require authentication, authorization, rate limiting, audit logging, secure cookies/tokens, and upload hardening.
