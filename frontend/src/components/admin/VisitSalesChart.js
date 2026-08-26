// Inline SVG bar + line combo chart: same no-dependency approach as
// vendor/Sparkline.js, extended to plot two series (visits line, sales bars)
// against a shared month axis.
export default function VisitSalesChart({ months, visits, sales, width = 720, height = 220 }) {
  const padding = { top: 10, bottom: 28, left: 10, right: 10 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(...visits, ...sales) * 1.15;
  const step = innerW / months.length;
  const barWidth = step * 0.38;

  const yFor = (v) => padding.top + innerH - (v / max) * innerH;
  const xForCenter = (i) => padding.left + step * i + step / 2;

  const linePoints = visits.map((v, i) => [xForCenter(i), yFor(v)]);
  const path = linePoints.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      {sales.map((v, i) => {
        const x = xForCenter(i) - barWidth / 2;
        const y = yFor(v);
        return (
          <rect
            key={`bar-${i}`}
            x={x}
            y={y}
            width={barWidth}
            height={padding.top + innerH - y}
            rx={4}
            fill="#f3c318"
          />
        );
      })}

      <path d={path} fill="none" stroke="#10182b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {linePoints.map(([x, y], i) => (
        <circle key={`dot-${i}`} cx={x} cy={y} r="4" fill="#10182b" />
      ))}

      {months.map((m, i) => (
        <text
          key={m}
          x={xForCenter(i)}
          y={height - 6}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill="#9aa1ae"
        >
          {m}
        </text>
      ))}
    </svg>
  );
}
