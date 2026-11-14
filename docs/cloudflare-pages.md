# Cloudflare Pages

FunFun Zone is a static Astro site. Pages serves `dist/`. There is no Wrangler adapter and no `wrangler.json`.

In the Pages project (funfun.zone):

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Node | 22 (set `NODE_VERSION=22`; `.nvmrc` is `22`) |
| Build command | `npm run build` |
| Build output | `dist` |

`npm run setup` is an interactive local wizard. Do not use it as the Pages build command. It rewrites `src/config.ts` and can replace the git remote.

The old feed URL `/rss.xml` redirects to `/feed.xml` via `public/_redirects`.

`public/appcast.xml` is the Claude Island Sparkle feed. Leave it in `public/` so `https://funfun.zone/appcast.xml` keeps working.
