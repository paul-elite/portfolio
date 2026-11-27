import 'server-only';
import { headers } from 'next/headers';

// The shop lives at shop.paulelite.com (2026-11-26). There its pages sit at the root ("/", "/<slug>",
// "/order/<token>"); on any other address they are under /store, which middleware.ts sends on to the
// shop host when the address is paulelite.com. `shopBase()` is the prefix for the address being served.

export const SHOP_HOST = 'shop.paulelite.com';

export const isShopHost = (host: string | null | undefined) => !!host && host.split(':')[0].toLowerCase().startsWith('shop.');

/** "" on the shop's own address, "/store" anywhere else */
export async function shopBase(): Promise<string> {
  const h = await headers();
  return isShopHost(h.get('x-forwarded-host') || h.get('host')) ? '' : '/store';
}

/** The origin and prefix of the address a request came in on, for Bachs to send the buyer back to */
export function shopUrlFor(requestUrl: string): string {
  const u = new URL(requestUrl);
  return u.origin + (isShopHost(u.host) ? '' : '/store');
}
