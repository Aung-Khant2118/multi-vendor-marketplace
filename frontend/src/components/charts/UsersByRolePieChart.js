import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const ROLE_COLORS = {
  ADMIN: '#ef4444',
  VENDOR: '#8b5cf6',
  CUSTOMER: '#3b82f6',
};

const ROLE_LABELS = {
  ADMIN: 'Admins',
  VENDOR: 'Vendors',
  CUSTOMER: 'Customers',
};

export default function UsersByRolePieChart({ data = {}, height = 280 }) {
  const chartData = Object.entries(data)
    .filter(([, count]) => count > 0)
    .map(([role, count]) => ({
      name: ROLE_LABELS[role] || role,
      value: count,
      color: ROLE_COLORS[role] || '#6b7280',
    }));

  if (chartData.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary, #6b7280)' }}>
        No user data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value.toLocaleString(), name]}
          contentStyle={{ borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', fontSize: 13 }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
