# Private notes

The public garden stays public. Private notes are a separate deployment. This repository does not contain them, and it does not know the owner’s Google account.

Nothing in this pull request turns live authentication on. Cloudflare Access, Google, and the private deployment still have to be configured by hand. Until those values exist, the gate fails closed: the private entry is absent, and `/private/` responds as a missing page.

## Why Access on its own is not enough

Cloudflare Access can sit in front of a path and demand a Google login. It does not rewrite the public HTML, and the cache key for a public page ignores cookies. The header is the same document for every visitor. The `CF_Authorization` cookie is HttpOnly, so the browser cannot safely decide what to draw.

Hiding a link with client-side script would also flash, and anyone could spoof it. The entry is inserted by a Pages Function after it verifies the Access token. Anonymous HTML is returned untouched, so it can stay cached. A response that saw a token is `Cache-Control: private, no-store` and `CDN-Cache-Control: no-store`.

Access is still the login. This site does not implement Google’s token exchange, does not store a refresh token, and does not set its own session cookie.

## Two deployments

| | Public site | Private notes |
| --- | --- | --- |
| Repository | this one, public | a private repository you create later |
| Cloudflare project | the existing Pages project | a new project, not created here |
| What it stores | garden, public notes, the gate | note markdown, generated at that project’s build |
| Who can read it | everyone | the signed-in owner, after the token check |

The public Pages build must not check out the private repository. A submodule, a git dependency, or a build-step clone would copy notes into the public workspace and could publish them. `scripts/check-public-boundary.mjs` fails the build if a submodule or a filled catalog appears. The private repository’s name is not chosen and this change does not create it.

`PRIVATE_NOTES_ORIGIN` is the https origin of the private deployment. It is not a secret and it is not authorization. The private worker verifies the same Access token again. The public function only fetches it after the token matches `OWNER_EMAIL`, and it does not put that origin in the HTML.

`*.pages.dev`, including the public project’s default hostname and preview URLs, does not serve the entry or the notes unless `PRIVATE_NOTES_ALLOW_PREVIEW=true`. Leave that unset.

## What you have to provide

This repository has no owner email, team name, or Access audience. Do not copy them from a commit, a GitHub profile, or a guess. Set them in the Cloudflare dashboard.

1. `ACCESS_TEAM_DOMAIN` — `https://<team-name>.cloudflareaccess.com`
2. `ACCESS_AUD` — the Access application’s AUD tag
3. `OWNER_EMAIL` — the Google account you will sign in with
4. `PRIVATE_NOTES_ORIGIN` — `https://<private-deployment-host>` with no path, after that host exists

Google’s OAuth client id and client secret are entered only in Zero Trust → Integrations → Identity providers → Google. They are not Pages environment variables and they do not belong in this repository.

## Checklist

### Google

1. In Google Cloud, create an OAuth client of type Web application. You need this because Access’s Google login uses your client. The site never sees it.
2. Authorized JavaScript origin: `https://<team-name>.cloudflareaccess.com`
3. Authorized redirect URI: `https://<team-name>.cloudflareaccess.com/cdn-cgi/access/callback`
4. Audience type External, unless you are using Google Workspace on purpose.
5. Copy the client id and client secret into the Zero Trust Google identity provider. Enable PKCE if you want it. Do not put the secret in git, in Pages, or in the browser.

### Cloudflare Access

1. Create one self-hosted application. Deny is the default.
2. Add a public hostname for `funfun.zone` with path `private`, and another for path `auth`. Leave the rest of the site unprotected.
3. If the dashboard lets this same application include the private deployment’s hostname, add that hostname with an empty path so the whole host is gated and both hosts share one AUD. A second application has a different AUD. The public function forwards the token it already verified, and that token will not satisfy a different AUD. If you cannot share the application, do not put a second Access policy in front of the private host; the worker still rejects requests without this application’s token.
4. Allow policy: Include, Selector Emails, Value the same address as `OWNER_EMAIL`. Identity provider: the Google provider from the previous section. A wider “any Google account” policy still does not show notes, because the function compares the token’s email claim with `OWNER_EMAIL`.
5. Session duration, in all three places Access lets you set it: one month. That is the longest Access will issue.
   - Zero Trust → Access controls → Access settings → global session duration
   - The application’s session duration
   - The allow policy’s session duration
6. Optional: turn on instant authentication so Google is the only prompt.
7. Do not add a Bypass policy for `/private` or `/auth`.
8. Do not add a Cache Everything rule, and do not ignore cache-control headers. The owner’s HTML must not be stored for everyone else.

When the application token expires, Access can renew it while the global session is still valid. When the global session ends, Google asks again. This code honors the token’s `exp`. It allows 60 seconds of clock skew and refuses a token whose remaining life is longer than 32 days. It does not extend a session.

### Pages environment

On the **production** environment of the public Pages project only:

- `ACCESS_TEAM_DOMAIN`
- `ACCESS_AUD`
- `OWNER_EMAIL`
- `PRIVATE_NOTES_ORIGIN`

Do not copy those onto preview deployments. Preview hostnames stay closed even if the variables leak there, unless you also set `PRIVATE_NOTES_ALLOW_PREVIEW=true`.

There is no service token. A service token would let the public function read notes without your Google login, and a leaked token would skip the owner check.

### Private repository and deployment

Do this only when you want notes to exist. This pull request does not do it.

1. Create a private git repository. Pick the name then.
2. Copy this layout into it, unchanged, so the imports still resolve:
   - `functions/lib/access.ts`
   - `functions/lib/catalog.ts`
   - `deploy/private-notes/`
3. Put notes in `deploy/private-notes/notes/<slug>.md`. A slug is lowercase letters, digits, and single hyphens. Frontmatter needs `title` and `planted: YYYY-MM-DD`. The body is a small markdown subset: headings, lists, quotes, code, emphasis, and https or note links. Images are not loaded.
4. Run `node deploy/private-notes/build-catalog.mjs` in that repository. It writes `catalog.json`, which the worker bundles. Do not run that script in this public repository as part of `npm run build`.
5. Create a new Cloudflare Workers or Pages project connected to the private repository only. `deploy/private-notes/wrangler.toml.example` shows the shape. It has no account id and no secrets.
6. Set `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, and `OWNER_EMAIL` on that project to the same values as production. Do not give the public Pages project a git credential for the private repository.
7. Deploy the private project. Its `*.pages.dev` hostname is safe to use as `PRIVATE_NOTES_ORIGIN` only because the worker returns 404 without a verified owner token. Add that hostname to the Access application as well when the dashboard allows one shared AUD.
8. Set `PRIVATE_NOTES_ORIGIN` on the public production environment. The nav entry appears after you sign in on `https://funfun.zone` and the token matches.

Notes never go in `src/content/`, `public/`, or this catalog. Public notes, their URLs, the garden, and `/feed.xml` are unchanged.

## Sign-in

The header shows **Sign in**. It links to `/auth/login/`. After Access sets a valid owner token, the next HTML response includes **Private Notes** and **Sign out**. A different Google account gets **Sign out** and a 403 on `/private/`, with no note text. A missing, expired, or forged token is treated as logged out. `Cf-Access-Authenticated-User-Email` alone is ignored.

Sign out sends the browser to `/cdn-cgi/access/logout` on the site, which clears the Access cookie.

## Limits

- Live auth does not work until the checklist is done. This change cannot prove a real Google login.
- The readable page is rendered on the public host, inside the existing shell, from JSON the private deployment returns. The browser does not call the private host and does not see its URL.
- Markdown is intentionally smaller than the garden’s pipeline. Wikilinks, math, and images are not part of it.
- A stolen Access token can be replayed until `exp`. The cookie is HttpOnly and Secure. There is no second, longer session in this site.
- `localhost` is allowed to open the gate so `wrangler pages dev` can be tried later. Production requests are not localhost.
