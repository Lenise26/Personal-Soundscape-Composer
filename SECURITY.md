# Security Policy

This version stores composition data only in browser localStorage and has no server-side authentication surface.

For production deployments that add accounts, uploads, or synchronization:

- validate and sanitize all user-controlled metadata;
- enforce server-side authorization for every composition;
- scan and restrict uploaded media types;
- use secure cookies or standards-based token handling;
- encrypt data in transit and configure appropriate at-rest protection;
- avoid storing secrets in client-side environment variables.

Report security concerns privately to the repository owner rather than opening a public issue with exploit details.
