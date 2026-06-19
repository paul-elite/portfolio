<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Portfolio Rules

Before changing this portfolio, read `docs/portfolio-production-maintenance.md`.

- Keep completed fixes production-bound: run `npm run lint` and `npm run build`, commit to `main`, push `origin main`, deploy with `npx vercel --prod --yes`, and confirm `work.paulelite.me` is aliased to a `READY` deployment.
- Preserve the current navigation behavior: text labels stay icon-free, the active navigation icon appears only in the avatar-roll circle, and the radial menu uses the uploaded navigation icons.
- Do not restore the desktop landing featured-project card. Desktop starts plain until a user selects content.
- Do not add purple hover/focus outline rings to the user avatar or detail back/close button.
