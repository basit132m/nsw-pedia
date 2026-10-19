# Setup — getting nsw-pedia.com live

Plain-English walkthrough. Do these in order; the whole thing takes about 30 minutes.

---

## 1. Push the repo to GitHub

The code needs to be on GitHub for Cloudflare to build it.

---

## 2. Create the Cloudflare Pages project

1. Sign up or log in at [dash.cloudflare.com](https://dash.cloudflare.com).
2. Go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Pick this repository.
4. Set the build configuration:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** add an environment variable `NODE_VERSION` = `22`
5. Name the project **`nswpedia`** — the deploy workflow references that exact name.
6. Save and deploy. You get a `nswpedia.pages.dev` URL to check before the domain is pointed.

---

## 3. Move DNS to Cloudflare (the domain stays at Namecheap)

You keep owning the domain at Namecheap. You are only changing which nameservers answer for it.

1. In Cloudflare: **Add a site → `nsw-pedia.com` → Free plan**. Cloudflare scans existing DNS
   records and shows you two nameservers, something like `xena.ns.cloudflare.com`.
2. In Namecheap: **Domain List → Manage → Nameservers → Custom DNS**. Replace what is there
   with Cloudflare's two nameservers. Save.
3. Wait for propagation — usually under an hour, occasionally up to 24.

> **Keep your email working.** If you have email on the domain, copy the existing MX records
> into Cloudflare DNS *before* switching nameservers, or mail will stop being delivered.

---

## 4. Attach the domain to the Pages project

1. In the Pages project: **Custom domains → Set up a custom domain**.
2. Add `nsw-pedia.com`, then add `www.nsw-pedia.com` as well.
3. Cloudflare creates the DNS records and issues the TLS certificate automatically.
4. Under **Rules → Redirect Rules**, add a 301 from `www.nsw-pedia.com/*` to
   `https://nsw-pedia.com/$1`. Pick one hostname as canonical and redirect the other — split
   hostnames split your rankings.

---

## 5. Secrets for the GitHub Actions deploy

The workflow in `.github/workflows/deploy.yml` deploys on every push to `main`. It needs two
repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Where to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → template **Edit Cloudflare Workers**, or a custom token with the *Cloudflare Pages: Edit* permission |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard sidebar, or the URL of your account page |

If you would rather let Cloudflare's own Git integration build the site (step 2 already set
that up), you can delete `deploy.yml` and keep `ci.yml` for the checks. Running both means the
site deploys twice per push.

---

## 6. Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Add a **Domain** property for `nsw-pedia.com` (not a URL-prefix property — the domain
   property covers every subdomain and both protocols).
3. It gives you a TXT record. Add it in Cloudflare DNS, then verify.
4. Submit `https://nsw-pedia.com/sitemap-index.xml` under **Sitemaps**.
5. Do the same at [Bing Webmaster Tools](https://www.bing.com/webmasters) — it can import
   directly from Search Console.

---

## 7. Analytics

Cloudflare Web Analytics is free, sets no cookies and needs no consent banner. Enable it under
**Web Analytics** in the Cloudflare dashboard and it is injected automatically — no code change.

If you prefer Plausible, add the script tag to `src/components/BaseHead.astro`.

---

## 8. Before you publish anything real

- [ ] Replace `src/content/authors/nswpedia-team.md` with real named contributors and bios.
- [ ] Replace the placeholder email addresses in `src/pages/contact.astro`.
- [ ] Replace placeholder cover art in `src/content/*/images/`.
- [ ] Verify every technical value in the seed game page against primary sources, or delete it.
- [ ] Set the real Twitter/X handle in `src/lib/site.ts`.

---

## Reference: environment

Nothing secret is needed to build the site locally — `npm install && npm run dev` is enough.
API credentials only become relevant in Phase 2, when the IGDB ingest pipeline lands. Those go
in `.env` (already gitignored) and as Cloudflare Pages environment variables.

---

## Admin panel — write pages without touching code

The site has a visual editor at **https://nsw-pedia.com/admin/**. It gives you a form for
every field and commits your changes straight to GitHub, which triggers a Cloudflare rebuild.
Pages are live about two minutes after you hit Publish.

Sign-in runs inside this project as Cloudflare Pages Functions (`functions/auth.js` and
`functions/callback.js`), so there is no separate worker to deploy. Two steps:

### 1. Register a GitHub OAuth app

Go to [github.com/settings/applications/new](https://github.com/settings/applications/new):

| Field | Value |
|---|---|
| Application name | `NSWPEDIA CMS` |
| Homepage URL | `https://nsw-pedia.com` |
| Authorization callback URL | `https://nsw-pedia.com/callback` |

Register it, then click **Generate a new client secret**. Copy the **Client ID** and the
**Client Secret** — the secret is shown only once.

### 2. Add the credentials to the Pages project

Cloudflare → **Workers & Pages** → `nswpedia` → **Settings** → **Variables and Secrets**.
Add three, for the **Production** environment:

| Name | Type | Value |
|---|---|---|
| `GITHUB_CLIENT_ID` | Text | the Client ID |
| `GITHUB_CLIENT_SECRET` | **Secret** | the Client Secret |
| `ALLOWED_DOMAINS` | Text | `nsw-pedia.com` |

Set `GITHUB_CLIENT_SECRET` as a **Secret**, not plain text, so it is encrypted and never
shown again. `ALLOWED_DOMAINS` restricts which site may receive an access token — without it
any page that can reach `/auth` could start a login flow.

Redeploy (Deployments → **Retry deployment**) so the functions pick up the variables. Then go
to `https://nsw-pedia.com/admin/` and sign in with GitHub.

### What the admin panel will and will not let you do

It enforces the schema as you type: Title ID must be 16 uppercase hex characters, summaries
must be 50–300 characters, a game needs at least three compatibility rows. Publishers,
authors and emulators are dropdowns rather than free text, so references cannot break.

It does **not** let you bypass the quality floor. Publish a game page with fewer than 250
words of body copy and the Cloudflare build fails, so the page does not go live. You will see
why in the deployment log. Fix the page and it deploys. That is the system working.

Images uploaded inside a collection go to that collection's `images/` folder and are
optimised to WebP at build time.

### If sign-in fails

| Symptom | Cause |
|---|---|
| "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are not set" | Variables missing, or you added them but have not redeployed |
| "Could not verify the sign-in request" | Cookies blocked, or you opened `/callback` directly instead of via the panel |
| GitHub shows "redirect_uri mismatch" | The callback URL on the OAuth app is not exactly `https://nsw-pedia.com/callback` |
| Popup opens then nothing happens | `ALLOWED_DOMAINS` does not match the hostname you are browsing from |

---

## Visitor ratings

ROM pages carry a 1–5 star rating. The site is static, so the average cannot be
built into the page — it is fetched when the page loads and stored in a
Cloudflare D1 database through `functions/api/ratings/[slug].js`.

Until the database exists the rating block simply stays hidden; nothing breaks.

### 1. Create the database

Cloudflare dashboard → **Storage & Databases** → **D1** → **Create database**.
Name it `nswpedia`.

### 2. Create the table

Open the database → **Console**, paste the contents of
`migrations/0001_ratings.sql`, and run it.

### 3. Bind it to the site

**Workers & Pages** → `nswpedia` → **Settings** → **Bindings** → **Add** →
**D1 database**:

| Field | Value |
|---|---|
| Variable name | `DB` |
| D1 database | `nswpedia` |

The variable name must be exactly `DB` — that is what the code looks for.

### 4. Add a salt (recommended)

**Settings** → **Variables and Secrets** → add a **Secret**:

| Name | Value |
|---|---|
| `RATING_SALT` | any long random string |

Votes are identified by a SHA-256 of the visitor's IP and browser, never the
IP itself, so the table holds no personal data. The salt stops that hash being
reversed by trying every possible IP. It works without one, just less safely.

### 5. Redeploy

**Deployments** → latest → **Retry deployment**, so the functions pick up the
new binding. Load a ROM page and the stars should appear.

### How voting behaves

- One vote per visitor per ROM. Voting again replaces the previous score
  rather than adding another, so the count cannot be inflated by re-clicking.
- Scores outside 1–5, non-integers and malformed requests are rejected.
- `/api/` is disallowed in robots.txt.

This is deliberately light protection: it stops casual double-voting, not a
determined person with a script. If ratings ever start getting gamed, the next
step is a per-IP daily cap or a proof-of-work challenge.
