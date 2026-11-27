import { NextRequest, NextResponse } from 'next/server';

// Spotify's reply after /api/spotify/connect (2026-11-27). Exchanges the code with the site's own client
// id and secret (so the secret is never needed anywhere else) and shows the new refresh token to the
// person who just approved it, with the one command that saves it to the live site.
export const dynamic = 'force-dynamic';

const page = (title: string, body: string, status = 200) => new NextResponse(
  `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{margin:0;min-height:100svh;display:grid;place-items:center;background:#fefcf5;font:15px/1.55 ui-sans-serif,system-ui,sans-serif;color:#222}main{max-width:560px;padding:32px 24px}h1{font-size:22px;font-weight:500;margin:0 0 10px}p{color:#545454;margin:0 0 14px}code,textarea{font:13px ui-monospace,SFMono-Regular,Menlo,monospace}textarea{width:100%;box-sizing:border-box;height:84px;padding:10px;border:0;border-radius:10px;background:#fff;box-shadow:0 0 0 .5px rgba(130,100,20,.25);resize:none}button{margin:8px 0 18px;padding:8px 14px;border:0;border-radius:100px;background:#202123;color:#fff;font:inherit;cursor:pointer}pre{background:#fff;padding:10px 12px;border-radius:10px;box-shadow:0 0 0 .5px rgba(130,100,20,.25);overflow:auto}</style>
<main>${body}</main>`,
  { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } },
);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  if (q.get('error')) return page('Spotify said no', `<h1>Spotify didn’t connect</h1><p>Spotify said: <code>${esc(q.get('error') || '')}</code></p>`, 400);
  const code = q.get('code');
  const state = q.get('state');
  if (!code || !state || state !== req.cookies.get('spotify_state')?.value) {
    return page('Start again', '<h1>Start from the connect link</h1><p>This page only works right after <a href="/api/spotify/connect">/api/spotify/connect</a> in the same browser.</p>', 400);
  }
  const id = process.env.SPOTIFY_CLIENT_ID, secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return page('Not set up', '<h1>The site has no Spotify app keys</h1>', 500);
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(id + ':' + secret).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: 'https://paulelite.com/callback' }),
  });
  const j = await r.json().catch(() => ({}));
  if (!j.refresh_token) {
    return page('Not connected', `<h1>Spotify didn’t hand over a login</h1><p>Spotify said: <code>${esc(String(j.error_description || j.error || r.status))}</code></p><p>“Invalid client secret” means the site’s saved secret is out of date too.</p>`, 400);
  }
  const res = page('Spotify connected', `<h1>Almost there</h1>
<p>Spotify approved it. This is the new login for the “now playing” card. It’s shown only here, once; don’t share it.</p>
<textarea id="t" readonly>${esc(j.refresh_token)}</textarea>
<button type="button" onclick="navigator.clipboard.writeText(document.getElementById('t').value);this.textContent='Copied'">Copy</button>
<p>Now, in Terminal, run this and paste it when asked:</p>
<pre>cd ~/portfolio && npx wrangler secret put SPOTIFY_REFRESH_TOKEN</pre>
<p>The card picks it up within a minute. No redeploy needed.</p>`);
  res.cookies.delete({ name: 'spotify_state', path: '/callback' });
  return res;
}
