import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const COLORS = ['#10182b', '#f3c318', '#3b82f6', '#8b5cf6', '#10b981'];

const formatCurrency = (v) => {
  if (v == null) return 'MMK 0';
  if (v >= 1000) return 'MMK ' + (v / 1000).toFixed(1) + 'k';
  return 'MMK ' + Number(v).toFixed(0);
};

const truncate = (str, max = 20) => (str && str.length > max ? str.slice(0, max) + '...' : str || '');

export default function TopProductsBarChart({ data = [], height = 280 }) {
  const chartData = data.map((d) => ({
    name: truncate(d.name, 18),
    revenue: Number(d.revenue) || 0,
    sales: Number(d.sales) || 0,
  }));

  if (chartData.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary, #6b7280)' }}>
        No product data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" horizontal={false} />
        <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: 'var(--text-secondary, #6b7280)' }} />
        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: 'var(--text-secondary, #6b7280)' }} />
        <Tooltip
          formatter={(value, name) => [name === 'revenue' ? 'MMK ' + Number(value).toLocaleString() : value, name === 'revenue' ? 'Revenue' : 'Sales']}
          contentStyle={{ borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', fontSize: 13 }}
        />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
