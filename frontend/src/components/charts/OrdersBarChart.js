import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fillMonthRange, formatMonthLabel } from './monthSeries';

export default function OrdersBarChart({ data = [], height = 280, color = '#f3c318' }) {
  const chartData = fillMonthRange(data).map((d) => ({
    month: d.month,
    label: formatMonthLabel(d.month),
    orders: Number(d.value) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-secondary, #6b7280)' }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary, #6b7280)' }} />
        <Tooltip
          formatter={(value) => [value, 'Orders']}
          contentStyle={{ borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', fontSize: 13 }}
        />
        <Legend />
        <Bar dataKey="orders" fill={color} radius={[4, 4, 0, 0]} name="Orders" />
      </BarChart>
    </ResponsiveContainer>
  );
}
