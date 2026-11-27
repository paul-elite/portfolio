import { NextResponse, type NextRequest } from 'next/server';

// The shop's own address (2026-11-26). On shop.paulelite.com the shop's pages are served at the root:
// "/" is the list of templates, "/<slug>" a template, "/order/<token>" an order. The API and Next's own
// files pass through as they are. Its pages under /store on paulelite.com move to the shop's address,
// so each page has one address.
const SHOP = 'shop.paulelite.com';
const PASS = /^\/(api|_next|favicon\.ico|icon\.png|apple-icon\.png|robots\.txt|sitemap\.xml)(\/|$)|\.[a-z0-9]{2,5}$/i;

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const { pathname, search } = req.nextUrl;

  if (host === SHOP) {
    if (PASS.test(pathname)) return NextResponse.next();
    // an old /store address on the shop's own host: drop the prefix
    if (pathname === '/store' || pathname.startsWith('/store/')) {
      const url = req.nextUrl.clone();
      url.pathname = pathname.slice('/store'.length) || '/';
      return NextResponse.redirect(url, 308);
    }
    const url = req.nextUrl.clone();
    url.pathname = '/store' + (pathname === '/' ? '' : pathname);
    return NextResponse.rewrite(url);
  }

  if ((host === 'paulelite.com' || host === 'www.paulelite.com') && (pathname === '/store' || pathname.startsWith('/store/'))) {
    return NextResponse.redirect(`https://${SHOP}${pathname.slice('/store'.length) || '/'}${search}`, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
