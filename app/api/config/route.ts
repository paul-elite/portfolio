import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/content-service';

export async function GET() {
  return NextResponse.json(await getSiteConfig());
}
