import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fillMonthRange, formatMonthLabel } from './monthSeries';

const formatCurrency = (v) => {
  if (v == null) return 'MMK 0';
  if (v >= 1000) return 'MMK ' + (v / 1000).toFixed(1) + 'k';
  return 'MMK ' + Number(v).toFixed(0);
};

export default function RevenueLineChart({ data = [], height = 280 }) {
  const chartData = fillMonthRange(data).map((d) => ({
    month: d.month,
    label: formatMonthLabel(d.month),
    revenue: Number(d.value) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-secondary, #6b7280)' }} interval="preserveStartEnd" />
        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: 'var(--text-secondary, #6b7280)' }} />
        <Tooltip
          formatter={(value) => ['MMK ' + Number(value).toLocaleString(), 'Revenue']}
          contentStyle={{ borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', fontSize: 13 }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#10182b"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#10182b' }}
          activeDot={{ r: 6 }}
          name="Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
