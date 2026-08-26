// Shared "1 2 3 ... N" page-number list used by every admin table's
// pagination footer (Users, Vendors, Categories, Audit Logs).
export function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('...');
    out.push(p);
  });
  return out;
}
