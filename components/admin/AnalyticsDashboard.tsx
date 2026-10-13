'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | '90d' | '12m' | 'custom';
type TrendKey = 'hour' | 'day' | 'week' | 'month' | 'year';
type SortKey = 'url' | 'title' | 'views' | 'uniqueViews' | 'averageTimeOnPage' | 'bounceRate' | 'exitRate';

type SeriesPoint = {
  label: string;
  value?: number;
  visitors?: number;
  percentage?: number;
};

type PopularPage = {
  url: string;
  title: string;
  views: number;
  uniqueViews: number;
  averageTimeOnPage: string;
  bounceRate: string;
  exitRate: string;
};

type AnalyticsPayload = {
  overview: {
    totalVisitors: number;
    uniqueVisitors: number;
    activeUsersNow: number;
    totalSessions: number;
    averageSessionDuration: string;
    bounceRate: string;
    returningVisitors: number;
    newVisitors: number;
    totalPageViews: number;
    visitorDelta: number;
  };
  trends: Record<TrendKey, Array<{ label: string; visitors: number }>>;
  realtime: {
    currentActiveVisitors: number;
    visitorsLastFiveMinutes: number;
    recentlyViewedPages: Array<{ path: string; title: string; timestamp: string; location: string }>;
    mostActivePages: Array<{ path: string; visitors: number }>;
    updatedAt: string;
  };
  trafficSources: SeriesPoint[];
  popularPages: PopularPage[];
  locations: {
    countries: SeriesPoint[];
    cities: SeriesPoint[];
  };
  devices: {
    devices: SeriesPoint[];
    operatingSystems: SeriesPoint[];
    browsers: SeriesPoint[];
    screenResolutions: SeriesPoint[];
  };
  behavior: {
    journeys: SeriesPoint[];
    entryPages: SeriesPoint[];
    exitPages: SeriesPoint[];
    scrollDepth: SeriesPoint[];
    clickHeatmap: SeriesPoint[];
  };
  notifications: string[];
  meta: {
    range: string;
    generatedAt: string;
    totalEvents: number;
  };
};

const rangeOptions: Array<{ key: RangeKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
  { key: '12m', label: 'Last 12 Months' },
  { key: 'custom', label: 'Custom' },
];

const trendOptions: Array<{ key: TrendKey; label: string }> = [
  { key: 'hour', label: 'Hour' },
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

const sourceColors = ['#111827', '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function formatNumber(value: number) {
  return new Intl.NumberFormat('en').format(value);
}

function parsePercent(value: string) {
  return Number(value.replace('%', '')) || 0;
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white text-gray-300">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125C16.5 3.504 17.004 3 17.625 3h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-gray-400">{detail}</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-red-700">Analytics could not be loaded</p>
          <p className="mt-1 text-sm text-red-500">Check the tracking endpoint and try again.</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta }: { label: string; value: string; delta?: number }) {
  const isPositive = (delta || 0) >= 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">{label}</p>
        {typeof delta === 'number' && (
          <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {isPositive ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-gray-950">{value}</p>
      <div className="mt-4 flex h-6 items-end gap-1" aria-hidden="true">
        {[32, 56, 44, 72, 50, 86, 68].map((height, index) => (
          <span
            key={`${label}-${height}-${index}`}
            className="flex-1 rounded-t bg-gray-900/10"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function Panel({ title, action, children, className = '' }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function SegmentedControl<T extends string>({ value, options, onChange }: { value: T; options: Array<{ key: T; label: string }>; onChange: (value: T) => void }) {
  return (
    <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-gray-50 p-1">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            value === option.key ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function LineChart({ data }: { data: Array<{ label: string; visitors: number }> }) {
  const max = Math.max(...data.map((point) => point.visitors), 1);
  const width = 720;
  const height = 220;
  const points = data.length > 0 ? data : [{ label: 'No data', visitors: 0 }];
  const path = points
    .map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
      const y = height - (point.visitors / max) * (height - 36) - 18;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  if (data.length === 0) {
    return <EmptyState title="No trend data yet" detail="Visitor trends will appear as page views are collected." />;
  }

  return (
    <div className="overflow-hidden">
      <svg className="h-[260px] w-full" viewBox={`0 0 ${width} ${height + 34}`} role="img" aria-label="Visitor trend line chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#111827" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((line) => (
          <line key={line} x1="0" x2={width} y1={18 + line * (height - 36)} y2={18 + line * (height - 36)} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        <path d={areaPath} fill="url(#trendGradient)" />
        <path d={path} fill="none" stroke="#111827" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        {points.map((point, index) => {
          const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
          const y = height - (point.visitors / max) * (height - 36) - 18;
          return <circle key={`${point.label}-${index}`} cx={x} cy={y} r="4" fill="#111827" />;
        })}
      </svg>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 sm:grid-cols-4 lg:grid-cols-6">
        {points.slice(-6).map((point) => (
          <div key={point.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <span className="truncate">{point.label}</span>
            <span className="font-medium text-gray-700">{point.visitors}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoughnutChart({ data }: { data: SeriesPoint[] }) {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const dashes = data.map((item) => {
    const value = item.value || 0;
    return total > 0 ? (value / total) * 100 : 0;
  });
  const segments = data.map((item, index) => {
    const previousDash = dashes.slice(0, index).reduce((sum, dash) => sum + dash, 0);
    return {
      dash: dashes[index],
      item,
      offset: 25 - previousDash,
      stroke: sourceColors[index % sourceColors.length],
    };
  });

  if (total === 0) {
    return <EmptyState title="No traffic source data" detail="Sources will populate after visitor referrers are collected." />;
  }

  return (
    <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
      <svg className="mx-auto h-44 w-44 -rotate-90" viewBox="0 0 42 42" role="img" aria-label="Traffic source doughnut chart">
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="7" />
        {segments.map((segment) => (
            <circle
              key={segment.item.label}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={segment.stroke}
              strokeDasharray={`${segment.dash} ${100 - segment.dash}`}
              strokeDashoffset={segment.offset}
              strokeWidth="7"
            />
        ))}
      </svg>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sourceColors[index % sourceColors.length] }} />
            <span className="flex-1 text-sm text-gray-600">{item.label}</span>
            <span className="text-sm font-semibold text-gray-950">{item.percentage || 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarList({ data, emptyTitle, emptyDetail }: { data: SeriesPoint[]; emptyTitle: string; emptyDetail: string }) {
  const max = Math.max(...data.map((item) => item.value || 0), 1);

  if (data.length === 0 || data.every((item) => !item.value)) {
    return <EmptyState title={emptyTitle} detail={emptyDetail} />;
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-gray-600">{item.label}</span>
            <span className="font-medium text-gray-950">{item.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${((item.value || 0) / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function WorldMap({ countries }: { countries: SeriesPoint[] }) {
  const activeCountries = countries.filter((country) => (country.value || 0) > 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="relative min-h-[260px] overflow-hidden rounded-2xl bg-gray-50 p-4">
        <svg className="h-full min-h-[230px] w-full" viewBox="0 0 640 320" role="img" aria-label="Visitor world map">
          <rect width="640" height="320" rx="20" fill="#f9fafb" />
          <path d="M88 120h98l32 38-34 54-90 8-40-42 34-58zM232 98l70-28 76 20 20 60-58 44-86-18-44-42 22-36zM396 122l98-42 82 34 22 74-80 56-98-28-52-44 28-50zM286 204l58 18 28 50-46 32-56-20-20-52 36-28zM504 236l54-10 36 28-22 34-58 10-36-30 26-32z" fill="#e5e7eb" />
          {activeCountries.slice(0, 8).map((country, index) => {
            const coordinates = [
              [154, 160],
              [314, 132],
              [492, 154],
              [320, 244],
              [536, 256],
              [248, 106],
              [420, 198],
              [110, 210],
            ][index];
            return (
              <g key={country.label}>
                <circle cx={coordinates[0]} cy={coordinates[1]} r={8 + Math.min(18, (country.value || 0) * 2)} fill="#111827" fillOpacity="0.12" />
                <circle cx={coordinates[0]} cy={coordinates[1]} r="5" fill="#111827" />
              </g>
            );
          })}
        </svg>
      </div>
      <BarList data={countries} emptyTitle="No location data" emptyDetail="Country and city data depends on deployment geo headers." />
    </div>
  );
}

function exportFile(kind: 'csv' | 'excel' | 'pdf', data: AnalyticsPayload | null) {
  if (!data) return;

  const rows = [
    ['Metric', 'Value'],
    ['Total visitors', data.overview.totalVisitors],
    ['Unique visitors', data.overview.uniqueVisitors],
    ['Active users now', data.overview.activeUsersNow],
    ['Total sessions', data.overview.totalSessions],
    ['Average session duration', data.overview.averageSessionDuration],
    ['Bounce rate', data.overview.bounceRate],
    ['Returning visitors', data.overview.returningVisitors],
    ['New visitors', data.overview.newVisitors],
    ['Total page views', data.overview.totalPageViews],
    [],
    ['Page URL', 'Page Title', 'Views', 'Unique Views', 'Average Time', 'Bounce Rate', 'Exit Rate'],
    ...data.popularPages.map((page) => [page.url, page.title, page.views, page.uniqueViews, page.averageTimeOnPage, page.bounceRate, page.exitRate]),
  ];
  const body = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const mime = kind === 'pdf' ? 'text/plain' : 'text/csv';
  const extension = kind === 'excel' ? 'xls' : kind;
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `portfolio-analytics.${extension}`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsDashboard() {
  const [range, setRange] = useState<RangeKey>('30d');
  const [trend, setTrend] = useState<TrendKey>('day');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('views');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setError(false);
    try {
      const response = await fetch(`/api/track?range=${range === 'custom' ? '30d' : range}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed analytics request');
      const nextData = await response.json();
      setData(nextData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics();
    const interval = window.setInterval(fetchAnalytics, 10000);
    return () => window.clearInterval(interval);
  }, [fetchAnalytics]);

  const filteredPages = useMemo(() => {
    const pages = data?.popularPages || [];
    const query = search.toLowerCase();

    return pages
      .filter((page) => page.url.toLowerCase().includes(query) || page.title.toLowerCase().includes(query))
      .sort((a, b) => {
        const first = a[sortKey];
        const second = b[sortKey];
        const firstValue = typeof first === 'number' ? first : parsePercent(first);
        const secondValue = typeof second === 'number' ? second : parsePercent(second);
        const result = sortKey === 'url' || sortKey === 'title' ? String(first).localeCompare(String(second)) : firstValue - secondValue;
        return sortDirection === 'asc' ? result : -result;
      });
  }, [data?.popularPages, search, sortDirection, sortKey]);

  const kpis = data
    ? [
        ['Total Visitors', formatNumber(data.overview.totalVisitors), data.overview.visitorDelta],
        ['Unique Visitors', formatNumber(data.overview.uniqueVisitors)],
        ['Active Users Right Now', formatNumber(data.overview.activeUsersNow)],
        ['Total Sessions', formatNumber(data.overview.totalSessions)],
        ['Average Session Duration', data.overview.averageSessionDuration],
        ['Bounce Rate', data.overview.bounceRate],
        ['Returning Visitors', formatNumber(data.overview.returningVisitors)],
        ['New Visitors', formatNumber(data.overview.newVisitors)],
        ['Total Page Views', formatNumber(data.overview.totalPageViews)],
      ] as Array<[string, string, number?]>
    : [];

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => <SkeletonBlock key={index} className="h-36" />)}
        </div>
        <SkeletonBlock className="h-96" />
      </div>
    );
  }

  if (error && !data) {
    return <ErrorState onRetry={fetchAnalytics} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">Website Analytics</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">Visitor intelligence</h2>
            <p className="mt-1 text-sm text-gray-400">Live traffic, acquisition, pages, devices, and behavior over time.</p>
          </div>
          <SegmentedControl value={range} options={rangeOptions} onChange={setRange} />
        </div>
        {range === 'custom' && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="date" className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            <input type="date" className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map(([label, value, delta]) => <KpiCard key={label} label={label} value={value} delta={delta} />)}
      </div>

      {data && data.meta.totalEvents === 0 && (
        <EmptyState title="No analytics events yet" detail="The dashboard is ready. Data will appear as visitors browse the website." />
      )}

      <Panel title="Visitor Trends" action={<SegmentedControl value={trend} options={trendOptions} onChange={setTrend} />}>
        <LineChart data={data?.trends[trend] || []} />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Real-Time Analytics">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">Current active visitors</p>
              <p className="mt-3 text-3xl font-semibold text-gray-950">{data?.realtime.currentActiveVisitors || 0}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">Last 5 minutes</p>
              <p className="mt-3 text-3xl font-semibold text-gray-950">{data?.realtime.visitorsLastFiveMinutes || 0}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <BarList data={(data?.realtime.mostActivePages || []).map((page) => ({ label: page.path, value: page.visitors }))} emptyTitle="No active pages" emptyDetail="Active pages appear as visitors browse." />
            <div className="space-y-3">
              {(data?.realtime.recentlyViewedPages || []).length === 0 ? (
                <EmptyState title="No recent views" detail="Recently viewed pages will stream into this area." />
              ) : (
                data?.realtime.recentlyViewedPages.map((page) => (
                  <div key={`${page.path}-${page.timestamp}`} className="rounded-xl bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-gray-900">{page.title}</p>
                      <span className="text-xs text-gray-400">{new Date(page.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-gray-400">{page.path} - {page.location}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </Panel>

        <Panel title="Traffic Sources">
          <DoughnutChart data={data?.trafficSources || []} />
        </Panel>
      </div>

      <Panel
        title="Popular Pages"
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search analytics"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => exportFile('csv', data)} className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200">CSV</button>
              <button type="button" onClick={() => exportFile('excel', data)} className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200">Excel</button>
              <button type="button" onClick={() => exportFile('pdf', data)} className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200">PDF</button>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-[0.12em] text-gray-400">
                {[
                  ['url', 'Page URL'],
                  ['title', 'Page Title'],
                  ['views', 'Total Views'],
                  ['uniqueViews', 'Unique Views'],
                  ['averageTimeOnPage', 'Avg Time'],
                  ['bounceRate', 'Bounce'],
                  ['exitRate', 'Exit'],
                ].map(([key, label]) => (
                  <th key={key} className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSortKey(key as SortKey);
                        setSortDirection(sortKey === key && sortDirection === 'desc' ? 'asc' : 'desc');
                      }}
                      className="inline-flex items-center gap-1 hover:text-gray-900"
                    >
                      {label}
                      <span>{sortKey === key ? (sortDirection === 'desc' ? 'v' : '^') : ''}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-gray-400">No matching page analytics.</td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.url} className="text-gray-600">
                    <td className="max-w-[180px] truncate py-4 pr-4 font-medium text-gray-950">{page.url}</td>
                    <td className="max-w-[240px] truncate py-4 pr-4">{page.title}</td>
                    <td className="py-4 pr-4">{page.views}</td>
                    <td className="py-4 pr-4">{page.uniqueViews}</td>
                    <td className="py-4 pr-4">{page.averageTimeOnPage}</td>
                    <td className="py-4 pr-4">{page.bounceRate}</td>
                    <td className="py-4 pr-4">{page.exitRate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Visitor Locations">
          <WorldMap countries={data?.locations.countries || []} />
          <div className="mt-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Cities</h3>
            <BarList data={data?.locations.cities || []} emptyTitle="No city data" emptyDetail="City-level analytics will appear when available." />
          </div>
        </Panel>

        <Panel title="Device Analytics">
          <div className="space-y-6">
            <BarList data={data?.devices.devices || []} emptyTitle="No device data" emptyDetail="Device type will appear after visits are collected." />
            <div className="grid gap-5 sm:grid-cols-2">
              <BarList data={data?.devices.operatingSystems || []} emptyTitle="No OS data" emptyDetail="Operating systems will appear here." />
              <BarList data={data?.devices.browsers || []} emptyTitle="No browser data" emptyDetail="Browsers will appear here." />
            </div>
            <BarList data={data?.devices.screenResolutions || []} emptyTitle="No resolution data" emptyDetail="Screen sizes are tracked on future visits." />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="User Behaviour">
          <div className="grid gap-5 md:grid-cols-2">
            <BarList data={data?.behavior.journeys || []} emptyTitle="No journeys yet" emptyDetail="Navigation paths need multiple page views per session." />
            <BarList data={data?.behavior.scrollDepth || []} emptyTitle="No scroll depth yet" emptyDetail="Scroll depth summaries will appear as events accumulate." />
            <BarList data={data?.behavior.entryPages || []} emptyTitle="No entry pages yet" emptyDetail="Entry pages will appear with traffic." />
            <BarList data={data?.behavior.exitPages || []} emptyTitle="No exit pages yet" emptyDetail="Exit pages will appear with traffic." />
          </div>
          <div className="mt-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Click heatmap summary</h3>
            <BarList data={data?.behavior.clickHeatmap || []} emptyTitle="No click summary yet" emptyDetail="Click group summaries will appear after interaction events are available." />
          </div>
        </Panel>

        <Panel title="Insights & Notifications">
          <div className="space-y-3">
            {(data?.notifications || []).map((notification) => (
              <div key={notification} className="flex gap-3 rounded-xl bg-gray-50 p-4">
                <span className="mt-1 h-2 w-2 rounded-full bg-gray-900" />
                <p className="text-sm leading-6 text-gray-600">{notification}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-gray-400">
            Last updated {data ? new Date(data.meta.generatedAt).toLocaleString() : 'just now'}. Live counts refresh automatically.
          </p>
        </Panel>
      </div>
    </div>
  );
}
