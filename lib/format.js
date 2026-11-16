/** Prezzo svizzero: "CHF 45.–" oppure "CHF 45.90" */
export function chf(v) {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  const int = Math.floor(n);
  const cents = Math.round((n - int) * 100);
  const intStr = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  return cents === 0 ? `CHF ${intStr}.–` : `CHF ${intStr}.${String(cents).padStart(2, '0')}`;
}

export function dateLong(iso) {
  if (!iso) return 'Da definire';
  return new Date(iso).toLocaleString('it-CH', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' });
}
export function dateShort(iso) {
  if (!iso) return 'Da definire';
  return new Date(iso).toLocaleDateString('it-CH', { day: 'numeric', month: 'short', timeZone: 'Europe/Zurich' });
}
export function timeShort(iso) {
  return new Date(iso).toLocaleTimeString('it-CH', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' });
}
/** Per <input type="datetime-local"> in ora svizzera */
export function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(d);
  const g = (t) => parts.find((p) => p.type === t)?.value;
  return `${g('year')}-${g('month')}-${g('day')}T${g('hour')}:${g('minute')}`;
}
/** Converte "YYYY-MM-DDTHH:mm" (ora svizzera) in ISO UTC */
export function fromLocalInput(v) {
  if (!v) return null;
  const [d, t] = v.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = t.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, day, hh, mm);
  const tzStr = new Date(guess).toLocaleString('en-US', { timeZone: 'Europe/Zurich', hour12: false });
  const asZurich = new Date(tzStr + ' UTC').getTime();
  return new Date(guess - (asZurich - guess)).toISOString();
}

export const PRICE_BANDS = [
  { id: 'b25', label: 'Fino a 25 CHF', test: (p) => p !== null && p <= 25, max: 25 },
  { id: 'b50', label: '25–50 CHF', test: (p) => p !== null && p > 25 && p <= 50, max: 50 },
  { id: 'b100', label: '50–100 CHF', test: (p) => p !== null && p > 50 && p <= 100, max: 100 },
  { id: 'bmax', label: 'Oltre 100 CHF', test: (p) => p !== null && p > 100, max: Infinity },
  { id: 'none', label: 'Senza prezzo', test: (p) => p === null, max: null },
];
export function bandForBudget(budget) {
  const b = Number(budget);
  if (!b) return null;
  return PRICE_BANDS.find((x) => x.max !== null && b <= x.max)?.id || 'bmax';
}

export function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '🎁';
}

export function vibrate(ms = 8) {
  try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms); } catch {}
}
