#!/bin/bash
# Publishes a static copy of the portfolio to GitHub Pages: https://paul-elite.github.io/
#
# The real site runs on Cloudflare Workers (npm run deploy) with a server: pages refresh from the
# database every minute, and it has an admin, a store, analytics and API routes. GitHub Pages only
# serves files, so this builds a SNAPSHOT in a scratch copy: every page as it is now, pictures unresized,
# no admin and no API (visit counts, now-playing and the booking form have nothing to talk to there).
# Run it again to refresh the snapshot.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${TMPDIR:-/tmp}/portfolio-pages-build"
REPO="paul-elite/paul-elite.github.io"
mkdir -p "$WORK"
rsync -a --delete --exclude .next --exclude .open-next --exclude .wrangler --exclude out --exclude .git --exclude node_modules --exclude .vercel "$SRC/" "$WORK/"
cmp -s "$SRC/package-lock.json" "$WORK/.lock-seen" || { rm -rf "$WORK/node_modules"; cp -Rc "$SRC/node_modules" "$WORK/node_modules" 2>/dev/null || cp -R "$SRC/node_modules" "$WORK/node_modules"; cp "$SRC/package-lock.json" "$WORK/.lock-seen"; }
cd "$WORK"
# no server on Pages: the admin and the API routes are left out of the copy
rm -rf app/admin app/api
python3 - <<'PY'
import re
p='next.config.ts'; s=open(p).read()
s=s.replace("const nextConfig: NextConfig = {","const nextConfig: NextConfig = {\n  output: 'export',\n  trailingSlash: true,",1).replace("  images: {","  images: {\n    unoptimized: true,",1)
open(p,'w').write(s)
# every project and writing is built ahead of time (there is no server to render one on request)
for kind,fn in (('projects','getProjectNavigation'),('writings','getWritingNavigation')):
    p=f'app/(site)/{kind}/[slug]/page.tsx'; s=open(p).read()
    if 'generateStaticParams' in s: continue
    s=s.replace("export const revalidate = 60;", f"export const dynamicParams = false;\nexport async function generateStaticParams() {{\n  const {{ getPortfolioContent }} = await import('@/lib/content-service');\n  const c = await getPortfolioContent();\n  return (c.{kind} || []).map((x: {{ slug: string }}) => ({{ slug: x.slug }}));\n}}",1)
    open(p,'w').write(s)
PY
rm -rf .next out
npx next build
touch out/.nojekyll
[ -n "${DRY:-}" ] && { echo "built in $WORK/out (not published)"; exit 0; }
# publish: the built files only, as the repository's one commit
cd out
git init -q -b main
git add -A
git -c user.name="paul-elite" -c user.email="paul-elite@users.noreply.github.com" commit -q -m "Portfolio snapshot $(date -u +%Y-%m-%dT%H:%MZ)"
git push -q -f "https://github.com/$REPO.git" main
echo "published: https://paul-elite.github.io/"
