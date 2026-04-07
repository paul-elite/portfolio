'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  repeatVisitors: number;
  countries: [string, number][];
  pages: [string, number][];
  recentVisits: Array<{
    id: string;
    timestamp: string;
    path: string;
    country: string;
    city: string;
    isRepeat: boolean;
  }>;
  last7Days: Record<string, number>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/track');
        const json = await res.json();
        setData(json);
      } catch {
        console.error('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-400">Failed to load analytics</p>
        </div>
      </main>
    );
  }

  const maxDayVisits = Math.max(...Object.values(data.last7Days), 1);

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
          >
            ← Back to site
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Total Visits
            </p>
            <p className="text-3xl font-semibold text-gray-900">
              {data.totalVisits}
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Unique Visitors
            </p>
            <p className="text-3xl font-semibold text-gray-900">
              {data.uniqueVisitors}
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Repeat Visitors
            </p>
            <p className="text-3xl font-semibold text-gray-900">
              {data.repeatVisitors}
            </p>
          </div>
        </div>

        {/* Last 7 Days Chart */}
        <div className="mb-12">
          <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-4">
            Last 7 Days
          </h2>
          <div className="flex items-end gap-2 h-32">
            {Object.entries(data.last7Days).map(([date, count]) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gray-900 rounded-t"
                  style={{
                    height: `${(count / maxDayVisits) * 100}%`,
                    minHeight: count > 0 ? '4px' : '0',
                  }}
                />
                <span className="text-xs text-gray-400">
                  {new Date(date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          {/* Countries */}
          <div>
            <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-4">
              Top Countries
            </h2>
            <div className="space-y-3">
              {data.countries.length === 0 ? (
                <p className="text-sm text-gray-400">No data yet</p>
              ) : (
                data.countries.map(([country, count]) => (
                  <div key={country} className="flex justify-between">
                    <span className="text-sm text-gray-600">{country}</span>
                    <span className="text-sm text-gray-400">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pages */}
          <div>
            <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-4">
              Top Pages
            </h2>
            <div className="space-y-3">
              {data.pages.length === 0 ? (
                <p className="text-sm text-gray-400">No data yet</p>
              ) : (
                data.pages.map(([page, count]) => (
                  <div key={page} className="flex justify-between">
                    <span className="text-sm text-gray-600 truncate mr-4">
                      {page}
                    </span>
                    <span className="text-sm text-gray-400">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Visits */}
        <div>
          <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-4">
            Recent Visits
          </h2>
          <div className="space-y-2">
            {data.recentVisits.length === 0 ? (
              <p className="text-sm text-gray-400">No visits yet</p>
            ) : (
              data.recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center gap-4 py-2 border-b border-gray-100"
                >
                  <span className="text-xs text-gray-400 w-32">
                    {new Date(visit.timestamp).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600 flex-1 truncate">
                    {visit.path}
                  </span>
                  <span className="text-sm text-gray-400">
                    {visit.city}, {visit.country}
                  </span>
                  {visit.isRepeat && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      Repeat
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-300 mt-12">
          Data is stored in memory and resets on deploy. Connect a database for persistence.
        </p>
      </div>
    </main>
  );
}
