import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fillMonthRange, formatMonthLabel } from './monthSeries';

export default function VendorGrowthChart({ data = [], height = 280 }) {
  const chartData = fillMonthRange(data).map((d) => ({
    month: d.month,
    label: formatMonthLabel(d.month),
    vendors: Number(d.value) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="vendorGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-secondary, #6b7280)' }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary, #6b7280)' }} />
        <Tooltip
          formatter={(value) => [value, 'New Vendors']}
          contentStyle={{ borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', fontSize: 13 }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="vendors"
          stroke="#8b5cf6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#vendorGrowth)"
          name="New Vendors"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
