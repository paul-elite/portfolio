# Portfolio Production Maintenance

Use this guide for future changes to this portfolio.

## Ship Flow

All finished work in this session should go to production.

1. Run `npm run lint`.
2. Run `npm run build`.
3. Commit to `main` with a concise behavior-focused message.
4. Push `origin main`.
5. Deploy production with `npx vercel --prod --yes`.
6. Confirm the deployment is `READY` and aliased to `https://work.paulelite.me`.

If the Vercel CLI times out after the build, check the deployment by ID before retrying. A timeout during status polling can still produce a ready deployment.

## Current UI Rules

- Main navigation labels are text-only. Do not place icons beside the labels.
- The active navigation icon appears in the avatar-roll circle only.
- The active navigation icon circle matches the settings icon size: `h-10 w-10`, rounded full, overflow hidden.
- Uploaded active navigation icons should fill/crop the circle with cover behavior.
- Fallback line icons stay centered and contained.
- The radial menu uses uploaded navigation icons, not letter initials.
- Desktop landing mode is plain. Do not show a default featured project before user selection.
- User avatar and detail back/close controls should not show purple hover/focus outline rings.
- Admin has separate image slots for favicon and OG image. Favicon drives browser/app icons; OG image drives social preview cards.

## Navigation Icon Data

Admin-managed navigation items live in `settings.navigationItems` and persist to the Supabase `settings.navigation_items` JSONB column.

Relevant files:
- `app/admin/page.tsx`: admin navigation item editor and icon upload save flow.
- `app/api/admin/content/route.ts`: settings persistence.
- `app/layout.tsx`: favicon, Open Graph, and Twitter metadata.
- `components/HomeContent.tsx`: nav item assembly, active icon, radial menu items.
- `components/experience/PortfolioNavigation.tsx`: visible nav labels.
- `components/experience/PortfolioNavigationIcon.tsx`: uploaded/fallback icon rendering.
- `lib/content-adapters.ts`: settings mapping and asset URL versioning.
- `supabase-schema.sql`: required database columns.

If admin says a schema needs to run, the live database is likely missing:

```sql
ALTER TABLE IF EXISTS settings
  ADD COLUMN IF NOT EXISTS navigation_items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS favicon_image TEXT DEFAULT '';
```

## Deployment Context

Vercel project:
- Project: `portfolio`
- Production domain: `work.paulelite.me`
- Git remote: `https://github.com/paul-elite/portfolio.git`

Use direct production deploys after pushing because Git webhook visibility can lag.
