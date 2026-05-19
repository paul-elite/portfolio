import { NextResponse } from 'next/server';
import { getPortfolioContent } from '@/lib/content-service';

export async function GET() {
  return NextResponse.json(await getPortfolioContent());
}
