/**
 * Algoritmo di estrazione con backtracking.
 * - Nessuno pesca se stesso
 * - Esclusioni bidirezionali (set di chiavi "idA|idB" ordinate)
 * - Evita, se possibile, gli abbinamenti dell'anno precedente
 * - Ordina dal più vincolato al meno vincolato (MRV dinamico)
 */
function pairKey(a, b) { return [a, b].sort().join('|'); }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function solve(ids, allowed) {
  const assigned = new Map();
  const used = new Set();
  let steps = 0;
  const LIMIT = 500000;

  function bt() {
    if (assigned.size === ids.length) return true;
    if (++steps > LIMIT) return false;
    // scegli il donatore con meno opzioni rimaste
    let best = null; let bestOpts = null;
    for (const g of ids) {
      if (assigned.has(g)) continue;
      const opts = allowed.get(g).filter((r) => !used.has(r));
      if (opts.length === 0) return false;
      if (!best || opts.length < bestOpts.length) { best = g; bestOpts = opts; }
    }
    for (const r of shuffle(bestOpts)) {
      assigned.set(best, r); used.add(r);
      if (bt()) return true;
      assigned.delete(best); used.delete(r);
    }
    return false;
  }
  return bt() ? assigned : null;
}

/**
 * @param {{id:string,name:string}[]} people
 * @param {Set<string>} excluded  chiavi pairKey
 * @param {Set<string>} previous  chiavi "giver>receiver" dell'anno prima
 */
export function runDraw(people, excluded, previous = new Set()) {
  if (people.length < 3) {
    return { ok: false, error: 'Servono almeno 3 partecipanti per l’estrazione.' };
  }
  const ids = people.map((p) => p.id);
  const name = Object.fromEntries(people.map((p) => [p.id, p.name]));

  const base = new Map();
  for (const g of ids) {
    base.set(g, ids.filter((r) => r !== g && !excluded.has(pairKey(g, r))));
  }

  // Diagnosi: chi non ha nessuna opzione
  const noGive = ids.filter((g) => base.get(g).length === 0);
  const noReceive = ids.filter((r) => !ids.some((g) => base.get(g).includes(r)));
  if (noGive.length || noReceive.length) {
    const names = [...new Set([...noGive, ...noReceive])].map((i) => name[i]);
    return {
      ok: false,
      error: `Estrazione impossibile: ${names.join(', ')} ${names.length > 1 ? 'sono rimasti' : 'è rimasto/a'} senza nessuna opzione disponibile. Riduci le esclusioni o aggiungi partecipanti.`,
    };
  }

  // 1° tentativo: evita gli abbinamenti dell'anno scorso
  if (previous.size) {
    const soft = new Map();
    for (const g of ids) soft.set(g, base.get(g).filter((r) => !previous.has(`${g}>${r}`)));
    const res = solve(ids, soft);
    if (res) return { ok: true, pairs: [...res.entries()], avoidedPrevious: true };
  }
  const res = solve(ids, base);
  if (res) return { ok: true, pairs: [...res.entries()], avoidedPrevious: previous.size === 0 };

  const tight = [...ids].sort((a, b) => base.get(a).length - base.get(b).length).slice(0, 3);
  return {
    ok: false,
    error: `Non esiste una combinazione valida con le esclusioni attuali. I più vincolati sono: ${tight
      .map((i) => `${name[i]} (${base.get(i).length} opzioni)`)
      .join(', ')}. Prova a disattivare una categoria di esclusione.`,
  };
}
