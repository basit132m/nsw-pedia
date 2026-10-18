import {
  CSRF_COOKIE,
  DEFAULT_GITHUB_HOSTNAME,
  randomToken,
  resolveScope,
} from './_lib.js';

/** Starts the GitHub OAuth flow. The /admin panel opens this in a popup. */
export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider') ?? 'github';

  if (provider !== 'github') {
    return new Response('Only the github provider is supported.', { status: 400 });
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response(
      'GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are not set on this Pages project. ' +
        'See the "Admin panel" section of SETUP.md.',
      { status: 500 },
    );
  }

  const csrfToken = randomToken();
  const authUrl = new URL(
    `https://${env.GITHUB_HOSTNAME || DEFAULT_GITHUB_HOSTNAME}/login/oauth/authorize`,
  );
  authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authUrl.searchParams.set('scope', resolveScope(searchParams.get('scope')));
  authUrl.searchParams.set('state', csrfToken);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      'Cache-Control': 'no-store',
      'Set-Cookie': `${CSRF_COOKIE}=${provider}_${csrfToken}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=600`,
    },
  });
}
