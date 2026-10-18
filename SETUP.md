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
