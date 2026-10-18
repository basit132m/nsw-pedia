import {
  CSRF_COOKIE,
  DEFAULT_GITHUB_HOSTNAME,
  htmlResponse,
  readCookie,
  renderCallbackPage,
} from './_lib.js';

const CLEAR_COOKIE = `${CSRF_COOKIE}=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0`;

/** GitHub redirects here. Verifies state, swaps the code for a token. */
export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const allowedDomains = env.ALLOWED_DOMAINS;

  const fail = (error, errorCode) =>
    htmlResponse(renderCallbackPage({ error, errorCode, allowedDomains }), {
      'Set-Cookie': CLEAR_COOKIE,
    });

  const cookie = readCookie(request, CSRF_COOKIE);
  if (!cookie || !state || cookie !== `github_${state}`) {
    return fail(
      'Could not verify the sign-in request. Start again from the admin panel, and make sure cookies are enabled.',
      'CSRF_DETECTED',
    );
  }
  if (!code) {
    return fail('GitHub did not return an authorization code.', 'AUTH_CODE_REQUEST_FAILED');
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return fail('This site is missing its GitHub OAuth credentials.', 'MISCONFIGURED');
  }

  let token;
  try {
    const res = await fetch(
      `https://${env.GITHUB_HOSTNAME || DEFAULT_GITHUB_HOSTNAME}/login/oauth/access_token`,
      {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
        }),
      },
    );
    const data = await res.json();
    if (data.error) {
      return fail(data.error_description || data.error, 'TOKEN_REQUEST_FAILED');
    }
    token = data.access_token;
  } catch {
    return fail('Could not reach GitHub to complete sign-in.', 'TOKEN_REQUEST_FAILED');
  }

  if (!token) {
    return fail('GitHub did not return an access token.', 'TOKEN_REQUEST_FAILED');
  }

  return htmlResponse(renderCallbackPage({ token, allowedDomains }), {
    'Set-Cookie': CLEAR_COOKIE,
  });
}
