export const REL_TYPES = [
  { id: 'partner', label: 'Fidanzato/a o partner', emoji: '❤️' },
  { id: 'genitore', label: 'Mamma o papà', emoji: '👨‍👩‍👧' },
  { id: 'figlio', label: 'Figlio/a', emoji: '🧒' },
  { id: 'fratello', label: 'Fratello o sorella', emoji: '🤝' },
  { id: 'nonno', label: 'Nonno/a', emoji: '👵' },
  { id: 'nipote', label: 'Nipote', emoji: '🧸' },
  { id: 'zio', label: 'Zio/a', emoji: '🎩' },
  { id: 'cugino', label: 'Cugino/a', emoji: '🎈' },
  { id: 'amico', label: 'Amico/a', emoji: '✨' },
  { id: 'altro', label: 'Altro', emoji: '🎁' },
];
export const REL_LABEL = Object.fromEntries(REL_TYPES.map((r) => [r.id, r.label]));
export const DEFAULT_EXCLUSIONS = ['partner', 'genitore', 'figlio', 'fratello'];

/** Coppie escluse (bidirezionali) a partire dalle relazioni e dai tipi bloccanti. */
export function excludedPairs(relationships, types) {
  const set = new Set();
  const list = [];
  for (const r of relationships) {
    if (!types.includes(r.rel_type)) continue;
    const k = [r.user_id, r.other_id].sort().join('|');
    if (set.has(k)) continue;
    set.add(k);
    list.push({ a: r.user_id, b: r.other_id, rel_type: r.rel_type });
  }
  return { set, list };
}
