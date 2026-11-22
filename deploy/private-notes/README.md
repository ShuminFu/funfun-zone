# Private notes worker

This directory is the isolated notes API. It is not deployed with the public Pages project. The public project only learns the origin later, through `PRIVATE_NOTES_ORIGIN`.

The catalog in this repository is empty. Fill it from a private repository’s build, not from the public site’s `npm run build`.

## Later, in a private repository

Copy these paths without rearranging them:

- `functions/lib/access.ts`
- `functions/lib/catalog.ts`
- `deploy/private-notes/`

Add `deploy/private-notes/notes/<slug>.md`, then run:

```bash
node deploy/private-notes/build-catalog.mjs
```

Deploy that repository from its own Cloudflare project. Use `wrangler.toml.example` as the starting point. Set `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, and `OWNER_EMAIL` there. They must match the public production environment. Do not commit them.

See [docs/private-notes.md](../../docs/private-notes.md).
