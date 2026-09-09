const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Format "YYYY-MM" as "Aug 2026" (not "Aug 26", which looks like a day). */
export function formatMonthLabel(month) {
  if (!month) return '';
  const [year, m] = String(month).split('-');
  const idx = parseInt(m, 10) - 1;
  if (!year || idx < 0 || idx > 11) return String(month);
  return `${MONTH_NAMES[idx]} ${year}`;
}

/**
 * Pad monthly series to a fixed trailing window (default: last 12 months through
 * the current calendar month), so charts always show the full range even when
 * only a couple of months have activity.
 */
export function fillMonthRange(data, monthsBack = 12) {
  const byKey = {};
  for (const d of data || []) {
    if (d?.month) byKey[d.month] = Number(d.value) || 0;
  }

  const now = new Date();
  let y = now.getFullYear();
  let m = now.getMonth() + 1; // 1–12

  m -= monthsBack - 1;
  while (m <= 0) {
    m += 12;
    y -= 1;
  }

  const result = [];
  for (let i = 0; i < monthsBack; i++) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    result.push({ month: key, value: byKey[key] || 0 });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return result;
}
