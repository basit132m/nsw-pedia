/**
 * What is actually live right now.
 *
 * When a build fails, Cloudflare keeps serving the previous deploy, so the
 * site looks fine while being out of date. Open /build-info.json and compare
 * the timestamp against when you last saved: if it is older, the latest build
 * did not succeed and the deployment log will say why.
 */
export function GET() {
  const body = {
    builtAt: new Date().toISOString(),
    commit: process.env.CF_PAGES_COMMIT_SHA ?? 'local',
    branch: process.env.CF_PAGES_BRANCH ?? 'local',
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
