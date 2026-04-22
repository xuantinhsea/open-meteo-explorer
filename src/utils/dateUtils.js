export function toISODate(date) {
  return date.toISOString().split('T')[0];
}

export function today() {
  return toISODate(new Date());
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

export function yearsAgo(n) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return toISODate(d);
}

export function formatLabel(timeStr, resolution) {
  if (!timeStr) return '';
  if (resolution === 'daily') return timeStr;
  return timeStr.replace('T', ' ').slice(0, 16);
}

export function daysAhead(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function getDateConstraints(mode) {
  const now = today();
  switch (mode) {
    case 'forecast':
      // Forecast API supports past ~92 days + up to 16 days ahead
      return { min: daysAgo(92), max: daysAhead(16), defaultStart: daysAgo(7), defaultEnd: daysAhead(7) };
    case 'historical':
      return { min: '1940-01-01', max: daysAgo(5), defaultStart: daysAgo(365), defaultEnd: daysAgo(5) };
    case 'ensemble':
      // Ensemble models go 10–35 days ahead depending on model
      return { min: daysAgo(92), max: daysAhead(35), defaultStart: now, defaultEnd: daysAhead(10) };
    case 'climate':
      return { min: '1950-01-01', max: '2050-12-31', defaultStart: '1990-01-01', defaultEnd: '2030-12-31' };
    default:
      return { min: '1940-01-01', max: daysAhead(16), defaultStart: daysAgo(30), defaultEnd: now };
  }
}
