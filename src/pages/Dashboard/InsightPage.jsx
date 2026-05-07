import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Smartphone, Monitor, Tablet, HelpCircle, MapPin } from 'lucide-react';

const urlBe = import.meta.env.VITE_URL_BE;

/* ─────────────── helpers ─────────────── */

function formatNumber(n) {
  if (n == null) return '-';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const DEVICE_ICONS = {
  mobile: <Smartphone className="w-4 h-4 text-[#a2a2a2]" />,
  desktop: <Monitor className="w-4 h-4 text-[#a2a2a2]" />,
  tablet: <Tablet className="w-4 h-4 text-[#a2a2a2]" />,
  unknown: <HelpCircle className="w-4 h-4 text-[#a2a2a2]" />,
};

const TIME_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'all_time', label: 'All Time' },
];

/* ─────────────── custom tooltip ─────────────── */

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#232323] border border-[#333] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[#a2a2a2] text-xs m-0">{label}</p>
      <p className="text-white text-sm font-bold m-0">{formatNumber(payload[0].value)} Views</p>
    </div>
  );
}

/* ─────────────── skeleton loader ─────────────── */

function InsightSkeleton() {
  return (
    <div className="min-h-screen pb-5 animate-pulse">
      <div className="h-8 w-40 bg-[#181818] rounded mb-2" />
      <div className="h-4 w-64 bg-[#181818] rounded mb-6" />
      <div className="bg-[#181818] rounded-2xl h-80 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#181818] rounded-xl h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#181818] rounded-xl h-40" />
        ))}
      </div>
    </div>
  );
}

/* ─────────────── sub-components ─────────────── */

function GrowthBadge({ value }) {
  if (value == null) return null;
  const isPositive = value >= 0;
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
        isPositive ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'
      }`}
    >
      <span className="text-sm">{isPositive ? '↗' : '↘'}</span>
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

function StatCard({ label, value, tooltip }) {
  return (
    <div className="bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-2">
      <span className="text-[#a2a2a2] text-xs flex items-center gap-1">
        {label}
        {tooltip && (
          <span className="ml-1 cursor-help" title={tooltip}>
            ⓘ
          </span>
        )}
      </span>
      <span className="text-white text-2xl font-bold">{value}</span>
    </div>
  );
}

/* ─────────────── main component ─────────────── */

function InsightPage({ id }) {
  const [insight, setInsight] = useState(null);
  const [timeRange, setTimeRange] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsight = useCallback(
    async (range) => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') || '';
        const res = await axios.get(`${urlBe}/events/insight/${id}`, {
          params: { time_range: range },
          headers: { 'x-jdticket': token },
        });
        if (res.data.code === '1') {
          setInsight(res.data.data);
        } else {
          setError(res.data.message || 'Failed to load insight data');
        }
      } catch (err) {
        console.error('Fetch insight failed:', err);
        setError(err?.response?.data?.message || 'Failed to load insight data');
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchInsight(timeRange);
  }, [timeRange, fetchInsight]);

  if (loading) return <InsightSkeleton />;

  if (error || !insight) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
        <p className="text-[#a2a2a2] text-lg">{error || 'No insight data available'}</p>
        <button
          onClick={() => fetchInsight(timeRange)}
          className="px-4 py-2 rounded-lg bg-[#232323] text-white text-sm hover:bg-[#2a2a2a] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare chart data with formatted date labels
  const chartData = (insight.visitor_trend?.chart_data || []).map((d) => ({
    ...d,
    label: formatDateLabel(d.date),
  }));

  return (
    <div className="min-h-screen pb-5">
      <h1 className="text-white text-2xl font-bold mb-1">Page Views</h1>
      <p className="text-[#a2a2a2] mb-6">See Recent views of the page.</p>

      {/* ── Visitor Trend Card ────────────────────────── */}
      <div className="bg-[#181818] rounded-2xl p-6 mb-6 shadow-lg border border-[#232323]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-white text-lg font-bold">Visitor Trend</span>
            <GrowthBadge value={insight.visitor_trend?.growth_percentage} />
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#232323] text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-[#333] outline-none cursor-pointer appearance-auto"
          >
            {TIME_RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {chartData.length > 0 ? (
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="insightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6fffc6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6fffc6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232323" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#a2a2a2', fontSize: 11 }}
                  axisLine={{ stroke: '#232323' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#a2a2a2', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatNumber}
                  width={45}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#6fffc6', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#6fffc6"
                  strokeWidth={2.5}
                  fill="url(#insightGradient)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#6fffc6', stroke: '#181818', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-56 flex items-center justify-center text-[#a2a2a2]">
            No chart data available for this period
          </div>
        )}
      </div>

      {/* ── Stats Grid ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Unique Visitors"
          value={insight.unique_visitors != null ? formatNumber(insight.unique_visitors) : '-'}
          tooltip="Total unique visitors in the selected period"
        />
        <StatCard
          label="Avg. Session Time"
          value={insight.avg_session_time || '-'}
          tooltip="Average time visitors spend on your event page"
        />
        <StatCard
          label="Bounce Rate"
          value={insight.bounce_rate != null ? `${insight.bounce_rate}%` : '-'}
          tooltip="Percentage of visitors who leave after viewing only one page"
        />
        <StatCard
          label="Returning Visitors"
          value={insight.returning_visitors != null ? `${insight.returning_visitors}%` : '-'}
          tooltip="Percentage of visitors who visited more than once"
        />
      </div>

      {/* ── Profile Visit, Live Traffic, Top Cities ──── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Visit */}
        <div className="bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[#a2a2a2] text-xs font-medium">Profile Visit</span>
            <GrowthBadge value={insight.profile_visit?.growth_percentage} />
          </div>
          <div>
            <span className="text-white text-2xl font-bold">
              {formatNumber(insight.profile_visit?.all_time)}
            </span>
            <span className="text-[#a2a2a2] text-xs ml-2">All time visit</span>
          </div>
          <div className="flex gap-4 text-[#a2a2a2] text-xs flex-wrap">
            <span>
              <span className="text-white font-semibold">
                {formatNumber(insight.profile_visit?.['30_days'])}
              </span>{' '}
              30Days
            </span>
            <span>
              <span className="text-white font-semibold">
                {formatNumber(insight.profile_visit?.['7_days'])}
              </span>{' '}
              7 Days
            </span>
            <span>
              <span className="text-white font-semibold">
                {formatNumber(insight.profile_visit?.['24_hours'])}
              </span>{' '}
              24 hours
            </span>
          </div>
        </div>

        {/* Live Traffic */}
        <div className="bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-2">
          <span className="text-[#a2a2a2] text-xs font-medium mb-1">Live Traffic</span>
          <div className="flex flex-col gap-3">
            {insight.live_traffic && insight.live_traffic.length > 0 ? (
              insight.live_traffic.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#6fffc6]" />
                    <span className="text-white text-sm">{item.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {DEVICE_ICONS[item.device_type] || DEVICE_ICONS.unknown}
                    <span className="text-[#a2a2a2] text-xs">{item.time_ago}</span>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-[#a2a2a2] text-xs">No live traffic data</span>
            )}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-2">
          <span className="text-[#a2a2a2] text-xs font-medium mb-1">Top Cities</span>
          <div className="flex flex-col gap-3">
            {insight.top_cities && insight.top_cities.length > 0 ? (
              insight.top_cities.map((city, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm">{city.city}</span>
                    <span className="text-[#a2a2a2] text-xs">{city.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#232323] rounded-full">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${city.percentage}%`,
                        background:
                          idx === 0
                            ? 'linear-gradient(90deg, #6fffc6, #44A08D)'
                            : idx === 1
                              ? 'linear-gradient(90deg, #44A08D, #2F645E)'
                              : '#2F645E',
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <span className="text-[#a2a2a2] text-xs">No city data available</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Gender (only render when data exists) ────── */}
      {insight.gender && (
        <div className="mt-4 bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-2">
          <span className="text-[#a2a2a2] text-xs font-medium mb-1">Gender</span>
          <div className="flex items-center gap-6">
            {insight.gender.male != null && (
              <span className="flex items-center gap-1 text-white text-lg">♂️ {insight.gender.male}%</span>
            )}
            {insight.gender.female != null && (
              <span className="flex items-center gap-1 text-white text-lg">♀️ {insight.gender.female}%</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InsightPage;
