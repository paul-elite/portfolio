import { NextRequest, NextResponse } from 'next/server';

// In production, replace with a database (Vercel KV, Upstash, Planetscale, etc.)
// This is a simple in-memory store for demonstration
declare global {
  var analyticsData: {
    visits: Array<{
      id: string;
      timestamp: string;
      path: string;
      country: string;
      city: string;
      userAgent: string;
      visitorId: string;
      isRepeat: boolean;
    }>;
    visitors: Set<string>;
  };
}

if (!global.analyticsData) {
  global.analyticsData = {
    visits: [],
    visitors: new Set(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, visitorId } = body;

    // Get geo data from Vercel headers
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    const city = request.headers.get('x-vercel-ip-city') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    const isRepeat = global.analyticsData.visitors.has(visitorId);
    global.analyticsData.visitors.add(visitorId);

    const visit = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      path,
      country: decodeURIComponent(country),
      city: decodeURIComponent(city),
      userAgent,
      visitorId,
      isRepeat,
    };

    global.analyticsData.visits.push(visit);

    // Keep only last 1000 visits in memory
    if (global.analyticsData.visits.length > 1000) {
      global.analyticsData.visits = global.analyticsData.visits.slice(-1000);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}

export async function GET() {
  const visits = global.analyticsData?.visits || [];
  const uniqueVisitors = global.analyticsData?.visitors?.size || 0;

  // Aggregate data
  const totalVisits = visits.length;
  const repeatVisitors = visits.filter((v) => v.isRepeat).length;

  // Country breakdown
  const countries: Record<string, number> = {};
  visits.forEach((v) => {
    countries[v.country] = (countries[v.country] || 0) + 1;
  });

  // Page breakdown
  const pages: Record<string, number> = {};
  visits.forEach((v) => {
    pages[v.path] = (pages[v.path] || 0) + 1;
  });

  // Recent visits (last 20)
  const recentVisits = visits.slice(-20).reverse();

  // Visits by day (last 7 days)
  const now = new Date();
  const last7Days: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    last7Days[key] = 0;
  }
  visits.forEach((v) => {
    const day = v.timestamp.split('T')[0];
    if (last7Days[day] !== undefined) {
      last7Days[day]++;
    }
  });

  return NextResponse.json({
    totalVisits,
    uniqueVisitors,
    repeatVisitors,
    countries: Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    pages: Object.entries(pages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    recentVisits,
    last7Days,
  });
}
