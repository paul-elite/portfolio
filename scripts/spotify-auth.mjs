// Gets a new Spotify refresh token for the "now playing" card and stores it (2026-11-27).
// Run it yourself: node scripts/spotify-auth.mjs
//   1. opens Spotify's consent page in your browser (log in, press Agree)
//   2. catches the reply on http://127.0.0.1:8888/callback
//   3. writes SPOTIFY_REFRESH_TOKEN into .env.local and into the Cloudflare Worker's secrets
// The token is never printed. The Spotify app must list http://127.0.0.1:8888/callback as a Redirect URI
// (developer.spotify.com → your app → Settings → Redirect URIs).
import http from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawn, exec } from 'node:child_process';

const ENV = new URL('../.env.local', import.meta.url);
const text = readFileSync(ENV, 'utf8');
const env = Object.fromEntries(text.split('\n').filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]));
const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = env;
if (!id || !secret) { console.error('SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET are missing from .env.local'); process.exit(1); }

const REDIRECT = 'http://127.0.0.1:8888/callback';
const state = Math.random().toString(36).slice(2);
const auth = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
  client_id: id, response_type: 'code', redirect_uri: REDIRECT, state,
  scope: 'user-read-currently-playing user-read-recently-played user-read-playback-state',
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== '/callback') { res.writeHead(404).end(); return; }
  const fail = (msg) => { res.writeHead(400, { 'Content-Type': 'text/plain' }).end(msg); console.error(msg); server.close(); process.exit(1); };
  if (url.searchParams.get('state') !== state) return fail('State did not match; run the script again.');
  if (url.searchParams.get('error')) return fail('Spotify said: ' + url.searchParams.get('error'));
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(id + ':' + secret).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code: url.searchParams.get('code'), redirect_uri: REDIRECT }),
  });
  const j = await r.json();
  if (!j.refresh_token) return fail('No refresh token came back: ' + (j.error_description || j.error || r.status));
  // .env.local: replace the line, or add it
  const line = 'SPOTIFY_REFRESH_TOKEN=' + j.refresh_token;
  writeFileSync(ENV, /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(text) ? text.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line) : text.trimEnd() + '\n' + line + '\n');
  // the live site: the Worker's secret, piped in so it never shows on screen
  const put = spawn('npx', ['wrangler', 'secret', 'put', 'SPOTIFY_REFRESH_TOKEN'], { cwd: new URL('..', import.meta.url).pathname, stdio: ['pipe', 'inherit', 'inherit'] });
  put.stdin.end(j.refresh_token);
  put.on('close', (code) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end(code === 0 ? 'Done. You can close this tab.' : 'Saved locally, but the Cloudflare secret failed; see the terminal.');
    console.log(code === 0 ? 'Saved to .env.local and to the live site (Cloudflare secret).' : 'Saved to .env.local; the Cloudflare secret update failed.');
    server.close(); process.exit(code === 0 ? 0 : 1);
  });
});
server.listen(8888, '127.0.0.1', () => {
  console.log('Opening Spotify… if nothing opens, visit:\n' + auth);
  exec(`open "${auth}"`);
});
