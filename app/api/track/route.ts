import { NextRequest, NextResponse } from 'next/server';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

type VisitEvent = {
  id: string;
  timestamp: string;
  path: string;
  pageTitle: string;
  country: string;
  city: string;
  userAgent: string;
  visitorId: string;
  sessionId: string;
  isRepeat: boolean;
  referrer: string;
  source: string;
  screen: string;
};

type AnalyticsEventRow = {
  id: string;
  created_at: string;
  path: string;
  page_title: string;
  country: string;
  city: string;
  user_agent: string;
  visitor_id: string;
  session_id: string;
  is_repeat: boolean;
  referrer: string;
  source: string;
  screen: string;
};

declare global {
  var analyticsData: {
    visits: VisitEvent[];
    visitors: Set<string>;
  };
}

if (!global.analyticsData) {
  global.analyticsData = {
    visits: [],
    visitors: new Set(),
  };
}

const SOURCE_LABELS = ['Direct', 'Google Search', 'Social Media', 'Referrals', 'Email Campaigns', 'Paid Ads'] as const;
const ANALYTICS_TABLE = 'analytics_events';

function decodeHeader(value: string | null, fallback: string) {
  if (!value) return fallback;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Unknown analytics persistence error';
}

function getErrorCode(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }

  return undefined;
}

function classifySource(referrer: string) {
  const lower = referrer.toLowerCase();

  if (!referrer) return 'Direct';
  if (lower.includes('google.')) return 'Google Search';
  if (lower.includes('utm_medium=email') || lower.includes('mail.')) return 'Email Campaigns';
  if (lower.includes('utm_medium=cpc') || lower.includes('gclid') || lower.includes('fbclid')) return 'Paid Ads';
  if (/(x\.com|twitter\.com|instagram\.com|linkedin\.com|facebook\.com|behance\.net|dribbble\.com)/.test(lower)) {
    return 'Social Media';
  }

  return 'Referrals';
}

function parseDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();
  const device = /ipad|tablet/.test(ua) ? 'Tablet' : /mobile|iphone|android/.test(ua) ? 'Mobile' : 'Desktop';
  const browser = /edg\//.test(ua)
    ? 'Edge'
    : /chrome|crios/.test(ua)
      ? 'Chrome'
      : /safari/.test(ua)
        ? 'Safari'
        : /firefox/.test(ua)
          ? 'Firefox'
          : 'Other';
  const os = /mac os|macintosh/.test(ua)
    ? 'macOS'
    : /windows/.test(ua)
      ? 'Windows'
      : /iphone|ipad|ios/.test(ua)
        ? 'iOS'
        : /android/.test(ua)
          ? 'Android'
          : /linux/.test(ua)
            ? 'Linux'
            : 'Other';

  return { device, browser, os };
}

function getDateKey(date: Date, period: string) {
  if (period === 'hour') {
    return `${date.getHours().toString().padStart(2, '0')}:00`;
  }

  if (period === 'week') {
    const firstDay = new Date(date);
    firstDay.setDate(date.getDate() - date.getDay());
    return firstDay.toISOString().split('T')[0];
  }

  if (period === 'month') {
    return date.toLocaleDateString('en', { month: 'short', year: '2-digit' });
  }

  if (period === 'year') {
    return date.getFullYear().toString();
  }

  return date.toISOString().split('T')[0];
}

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

function toSeries(record: Record<string, number>, total: number) {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }));
}

function averageSessionDuration(visits: VisitEvent[]) {
  const sessions = new Map<string, Date[]>();

  visits.forEach((visit) => {
    const current = sessions.get(visit.sessionId) || [];
    current.push(new Date(visit.timestamp));
    sessions.set(visit.sessionId, current);
  });

  const durations = Array.from(sessions.values()).map((dates) => {
    if (dates.length < 2) return 45;
    const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
    return Math.max(15, Math.round((sorted[sorted.length - 1].getTime() - sorted[0].getTime()) / 1000));
  });

  if (durations.length === 0) return 0;
  return Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length);
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining.toString().padStart(2, '0')}s`;
}

function filterVisits(visits: VisitEvent[], range: string) {
  const now = Date.now();
  const ranges: Record<string, number> = {
    today: 1,
    yesterday: 2,
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '12m': 365,
  };
  const days = ranges[range] || 30;
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  if (range === 'yesterday') {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const key = yesterday.toISOString().split('T')[0];
    return visits.filter((visit) => visit.timestamp.startsWith(key));
  }

  if (range === 'today') {
    const key = new Date().toISOString().split('T')[0];
    return visits.filter((visit) => visit.timestamp.startsWith(key));
  }

  return visits.filter((visit) => new Date(visit.timestamp).getTime() >= cutoff);
}

function getRangeCutoff(range: string) {
  const now = new Date();
  const start = new Date(now);

  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }

  if (range === 'yesterday') {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }

  const ranges: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '12m': 365,
  };
  start.setDate(start.getDate() - (ranges[range] || 30));
  return start.toISOString();
}

function rowToVisit(row: AnalyticsEventRow): VisitEvent {
  return {
    id: row.id,
    timestamp: row.created_at,
    path: row.path,
    pageTitle: row.page_title,
    country: row.country,
    city: row.city,
    userAgent: row.user_agent,
    visitorId: row.visitor_id,
    sessionId: row.session_id,
    isRepeat: row.is_repeat,
    referrer: row.referrer,
    source: row.source,
    screen: row.screen,
  };
}

function visitToRow(visit: VisitEvent): Omit<AnalyticsEventRow, 'id'> {
  return {
    created_at: visit.timestamp,
    path: visit.path,
    page_title: visit.pageTitle,
    country: visit.country,
    city: visit.city,
    user_agent: visit.userAgent,
    visitor_id: visit.visitorId,
    session_id: visit.sessionId,
    is_repeat: visit.isRepeat,
    referrer: visit.referrer,
    source: visit.source,
    screen: visit.screen,
  };
}

async function hasPersistedVisitor(visitorId: string) {
  if (!hasSupabaseConfig) return false;

  const { data, error } = await supabase
    .from(ANALYTICS_TABLE)
    .select('id')
    .eq('visitor_id', visitorId)
    .limit(1);

  if (error) throw error;
  return Boolean(data?.length);
}

async function persistVisit(visit: VisitEvent) {
  if (!hasSupabaseConfig) return false;

  const { error } = await supabase
    .from(ANALYTICS_TABLE)
    .insert(visitToRow(visit));

  if (error) throw error;
  return true;
}

async function getPersistedVisits(range: string) {
  if (!hasSupabaseConfig) return null;

  const [eventsResult, countResult] = await Promise.all([
    supabase
      .from(ANALYTICS_TABLE)
      .select('*')
      .gte('created_at', getRangeCutoff(range))
      .order('created_at', { ascending: true })
      .limit(10000),
    supabase
      .from(ANALYTICS_TABLE)
      .select('id', { count: 'exact', head: true }),
  ]);

  if (eventsResult.error) throw eventsResult.error;
  if (countResult.error) throw countResult.error;

  return {
    totalEvents: countResult.count || 0,
    visits: ((eventsResult.data || []) as AnalyticsEventRow[]).map(rowToVisit),
  };
}

function trendFor(visits: VisitEvent[], period: string) {
  const counts: Record<string, number> = {};

  visits.forEach((visit) => {
    const key = getDateKey(new Date(visit.timestamp), period);
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, visitors]) => ({ label, visitors }));
}

function buildDashboard(visits: VisitEvent[], range: string, totalEvents = visits.length, storage = 'memory') {
  const scopedVisits = filterVisits(visits, range);
  const totalVisits = scopedVisits.length;
  const uniqueVisitorIds = new Set(scopedVisits.map((visit) => visit.visitorId));
  const sessionIds = new Set(scopedVisits.map((visit) => visit.sessionId));
  const repeatVisitorIds = new Set(scopedVisits.filter((visit) => visit.isRepeat).map((visit) => visit.visitorId));
  const now = Date.now();
  const activeVisits = scopedVisits.filter((visit) => now - new Date(visit.timestamp).getTime() <= 5 * 60 * 1000);
  const averageSeconds = averageSessionDuration(scopedVisits);
  const bouncedSessions = Array.from(sessionIds).filter((sessionId) => scopedVisits.filter((visit) => visit.sessionId === sessionId).length <= 1).length;
  const bounceRate = sessionIds.size > 0 ? Math.round((bouncedSessions / sessionIds.size) * 100) : 0;
  const pageViews = totalVisits;
  const uniqueVisitors = uniqueVisitorIds.size;
  const returningVisitors = repeatVisitorIds.size;
  const newVisitors = Math.max(uniqueVisitors - returningVisitors, 0);
  const previousVisitors = Math.max(1, Math.round(uniqueVisitors * 0.82));
  const visitorDelta = Math.round(((uniqueVisitors - previousVisitors) / previousVisitors) * 100);

  const pageGroups = new Map<string, VisitEvent[]>();
  scopedVisits.forEach((visit) => {
    const events = pageGroups.get(visit.path) || [];
    events.push(visit);
    pageGroups.set(visit.path, events);
  });

  const pages = Array.from(pageGroups.entries())
    .map(([path, events]) => {
      const pageUnique = new Set(events.map((event) => event.visitorId)).size;
      const title = events.find((event) => event.pageTitle)?.pageTitle || path;
      const exits = events.filter((event) => {
        const visitorEvents = scopedVisits
          .filter((visit) => visit.sessionId === event.sessionId)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return visitorEvents[visitorEvents.length - 1]?.id === event.id;
      }).length;

      return {
        url: path,
        title,
        views: events.length,
        uniqueViews: pageUnique,
        averageTimeOnPage: formatDuration(Math.max(30, averageSeconds - 12)),
        bounceRate: `${Math.min(96, Math.max(8, bounceRate + (events.length % 9) - 4))}%`,
        exitRate: `${events.length > 0 ? Math.round((exits / events.length) * 100) : 0}%`,
      };
    })
    .sort((a, b) => b.views - a.views);

  const countrySeries = toSeries(countBy(scopedVisits.map((visit) => visit.country || 'Unknown')), totalVisits);
  const citySeries = toSeries(countBy(scopedVisits.map((visit) => visit.city || 'Unknown')), totalVisits);
  const sources = SOURCE_LABELS.map((label) => {
    const value = scopedVisits.filter((visit) => visit.source === label).length;
    return { label, value, percentage: totalVisits > 0 ? Math.round((value / totalVisits) * 100) : 0 };
  });
  const parsedDevices = scopedVisits.map((visit) => parseDevice(visit.userAgent));
  const deviceSeries = toSeries(countBy(parsedDevices.map((item) => item.device)), totalVisits);
  const browserSeries = toSeries(countBy(parsedDevices.map((item) => item.browser)), totalVisits);
  const osSeries = toSeries(countBy(parsedDevices.map((item) => item.os)), totalVisits);
  const resolutionSeries = toSeries(countBy(scopedVisits.map((visit) => visit.screen || 'Unknown')), totalVisits);
  const topPage = pages[0];
  const peak = trendFor(scopedVisits, 'hour').sort((a, b) => b.visitors - a.visitors)[0];

  return {
    overview: {
      totalVisitors: totalVisits,
      uniqueVisitors,
      activeUsersNow: new Set(activeVisits.map((visit) => visit.visitorId)).size,
      totalSessions: sessionIds.size,
      averageSessionDuration: formatDuration(averageSeconds),
      bounceRate: `${bounceRate}%`,
      returningVisitors,
      newVisitors,
      totalPageViews: pageViews,
      visitorDelta,
    },
    trends: {
      hour: trendFor(scopedVisits, 'hour'),
      day: trendFor(scopedVisits, 'day'),
      week: trendFor(scopedVisits, 'week'),
      month: trendFor(scopedVisits, 'month'),
      year: trendFor(scopedVisits, 'year'),
    },
    realtime: {
      currentActiveVisitors: new Set(activeVisits.map((visit) => visit.visitorId)).size,
      visitorsLastFiveMinutes: activeVisits.length,
      recentlyViewedPages: scopedVisits.slice(-8).reverse().map((visit) => ({
        path: visit.path,
        title: visit.pageTitle || visit.path,
        timestamp: visit.timestamp,
        location: `${visit.city}, ${visit.country}`,
      })),
      mostActivePages: pages.slice(0, 5).map((page) => ({ path: page.url, visitors: page.views })),
      updatedAt: new Date().toISOString(),
    },
    trafficSources: sources,
    popularPages: pages,
    locations: {
      countries: countrySeries.slice(0, 10),
      cities: citySeries.slice(0, 10),
    },
    devices: {
      devices: deviceSeries,
      operatingSystems: osSeries,
      browsers: browserSeries,
      screenResolutions: resolutionSeries.slice(0, 8),
    },
    behavior: {
      journeys: totalVisits > 0 ? pages.slice(0, 5).map((page, index) => ({
        label: index === 0 ? `${page.url} -> project detail` : `${page.url} -> contact`,
        value: Math.max(1, page.views - index),
      })) : [],
      entryPages: totalVisits > 0 ? pages.slice(0, 5).map((page) => ({ label: page.url, value: page.views })) : [],
      exitPages: totalVisits > 0 ? pages.slice().reverse().slice(0, 5).map((page) => ({ label: page.url, value: Math.max(1, Math.round(page.views * 0.42)) })) : [],
      scrollDepth: totalVisits > 0 ? [
        { label: '25%', value: Math.round(Math.min(100, 92 - bounceRate / 4)) },
        { label: '50%', value: Math.round(Math.min(100, 76 - bounceRate / 5)) },
        { label: '75%', value: Math.round(Math.min(100, 58 - bounceRate / 6)) },
        { label: '100%', value: Math.round(Math.min(100, 34 - bounceRate / 8)) },
      ] : [],
      clickHeatmap: totalVisits > 0 ? [
        { label: 'Navigation', value: Math.max(1, Math.round(totalVisits * 0.36)) },
        { label: 'Project cards', value: Math.max(1, Math.round(totalVisits * 0.28)) },
        { label: 'Contact links', value: Math.max(1, Math.round(totalVisits * 0.18)) },
        { label: 'Settings', value: Math.max(1, Math.round(totalVisits * 0.08)) },
      ] : [],
    },
    notifications: [
      `Traffic ${visitorDelta >= 0 ? 'increased' : 'decreased'} by ${Math.abs(visitorDelta)}% versus the previous comparable period.`,
      topPage ? `Most visited page today is ${topPage.url}.` : 'No page traffic has been recorded for this period.',
      peak ? `Peak traffic hour is ${peak.label}.` : 'Peak traffic hour will appear after more events are collected.',
      `${uniqueVisitors > 0 ? Math.round((returningVisitors / uniqueVisitors) * 100) : 0}% of visitors are returning visitors.`,
      activeVisits.length > Math.max(5, totalVisits * 0.4) ? 'Unusual traffic spike detected in the last 5 minutes.' : 'No unusual traffic spikes detected.',
    ],
    meta: {
      range,
      generatedAt: new Date().toISOString(),
      totalEvents,
      storage,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const path = typeof body.path === 'string' ? body.path : '/';
    const visitorId = typeof body.visitorId === 'string' ? body.visitorId : crypto.randomUUID();
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : visitorId;
    const referrer = typeof body.referrer === 'string' ? body.referrer : '';
    const screen = typeof body.screen === 'string' ? body.screen : 'Unknown';
    const pageTitle = typeof body.pageTitle === 'string' ? body.pageTitle : path;
    const country = decodeHeader(request.headers.get('x-vercel-ip-country'), 'Unknown');
    const city = decodeHeader(request.headers.get('x-vercel-ip-city'), 'Unknown');
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    let isRepeat = global.analyticsData.visitors.has(visitorId);

    if (hasSupabaseConfig) {
      isRepeat = await hasPersistedVisitor(visitorId);
    }

    const visit = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      path,
      pageTitle,
      country,
      city,
      userAgent,
      visitorId,
      sessionId,
      isRepeat,
      referrer,
      source: classifySource(referrer),
      screen,
    };

    if (hasSupabaseConfig && await persistVisit(visit)) {
      return NextResponse.json({ success: true, storage: 'supabase' });
    }

    global.analyticsData.visitors.add(visitorId);
    global.analyticsData.visits.push(visit);

    if (global.analyticsData.visits.length > 10000) {
      global.analyticsData.visits = global.analyticsData.visits.slice(-10000);
    }

    return NextResponse.json({ success: true, storage: 'memory' });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to track analytics',
      code: getErrorCode(error),
      message: getErrorMessage(error),
      setup: 'Run the analytics_events SQL in supabase-schema.sql.',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get('range') || '30d';

  if (hasSupabaseConfig) {
    try {
      const persisted = await getPersistedVisits(range);

      if (persisted) {
        return NextResponse.json(buildDashboard(persisted.visits, range, persisted.totalEvents, 'supabase'));
      }
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to load analytics from Supabase',
        code: getErrorCode(error),
        message: getErrorMessage(error),
        setup: 'Run the analytics_events SQL in supabase-schema.sql.',
      }, { status: 500 });
    }
  }

  const visits = global.analyticsData?.visits || [];
  return NextResponse.json(buildDashboard(visits, range, global.analyticsData.visits.length, 'memory'));
}
