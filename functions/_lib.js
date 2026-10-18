/**
 * Shared helpers for the GitHub OAuth handshake that backs /admin/.
 *
 * This replaces the standalone sveltia-cms-auth Worker: the same protocol,
 * but running as Pages Functions inside this project, so there is one repo,
 * one deploy and one place to configure secrets.
 *
 * Protocol (Netlify CMS style, which Sveltia CMS implements):
 *   1. /admin opens /auth in a popup.
 *   2. /auth redirects to GitHub with a CSRF state, stored in a cookie.
 *   3. GitHub redirects back to /callback with a code.
 *   4. /callback verifies state, swaps code for a token, and hands it to the
 *      opener window via postMessage.
 */

export const DEFAULT_GITHUB_HOSTNAME = 'github.com';
export const DEFAULT_SCOPE = 'repo,user';
export const CSRF_COOKIE = 'csrf-token';

/** Scopes a caller is allowed to request; anything else falls back to default. */
const ALLOWED_SCOPES = ['repo', 'public_repo', 'user', 'read:user', 'user:email'];

export function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function readCookie(request, name) {
  const header = request.headers.get('Cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
}

export function resolveScope(requested) {
  if (!requested) return DEFAULT_SCOPE;
  const items = requested.split(/\s*,\s*/).filter(Boolean);
  return items.length && items.every((s) => ALLOWED_SCOPES.includes(s)) ? items.join(',') : DEFAULT_SCOPE;
}

/**
 * Matches an origin against the ALLOWED_DOMAINS list, which is a
 * comma-separated list of hostnames that may contain `*` wildcards.
 */
export function originAllowed(origin, allowedDomains) {
  if (!allowedDomains) return true;
  let hostname;
  try {
    hostname = new URL(origin).hostname;
  } catch {
    return false;
  }
  return allowedDomains
    .split(/\s*,\s*/)
    .filter(Boolean)
    .some((pattern) => {
      const re = new RegExp(
        `^${pattern.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`,
        'i',
      );
      return re.test(hostname);
    });
}

/** Escapes a JSON payload so it cannot terminate the inline <script>. */
function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * The page GitHub lands on. It completes the handshake with the CMS window
 * and then closes itself.
 */
export function renderCallbackPage({ provider = 'github', token, error, errorCode, allowedDomains }) {
  const state = token ? 'success' : 'error';
  const payload = token ? { provider, token } : { provider, error: error ?? 'Unknown error', errorCode };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<title>Signing you in…</title>
<style>
  body { background:#06080c; color:#e9eef4; font-family: ui-sans-serif, system-ui, sans-serif;
         display:grid; place-items:center; min-height:100dvh; margin:0; text-align:center; padding:1rem; }
  .err { color:#ff8f85; max-width:40rem; }
  code { background:#11161f; padding:.15em .4em; border-radius:4px; }
</style>
</head>
<body>
<p id="status">${token ? 'Signed in. You can close this window.' : 'Sign-in failed.'}</p>
${error ? `<p class="err">${String(error).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c])}</p>` : ''}
<script>
(function () {
  var state = ${safeJson(state)};
  var payload = ${safeJson(payload)};
  var allowed = ${safeJson(allowedDomains ?? '')};

  function hostAllowed(origin) {
    if (!allowed) return true;
    var host;
    try { host = new URL(origin).hostname; } catch (e) { return false; }
    return allowed.split(/\\s*,\\s*/).filter(Boolean).some(function (p) {
      var re = new RegExp('^' + p.trim().replace(/[.+?^\${}()|[\\]\\\\]/g, '\\\\$&').replace(/\\*/g, '.*') + '$', 'i');
      return re.test(host);
    });
  }

  function receive(event) {
    if (event.data !== 'authorizing:github') return;
    // Errors always go back so the user sees why. Tokens only to allowed origins.
    if (state === 'success' && !hostAllowed(event.origin)) return;
    window.removeEventListener('message', receive);
    event.source.postMessage(
      'authorization:github:' + state + ':' + JSON.stringify(payload),
      event.origin
    );
  }

  window.addEventListener('message', receive);
  if (window.opener) {
    window.opener.postMessage('authorizing:github', '*');
  } else {
    document.getElementById('status').textContent =
      'Open this from the admin panel rather than directly.';
  }
})();
</script>
</body>
</html>`;
}

export function htmlResponse(body, extraHeaders = {}) {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}
