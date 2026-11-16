'use client';
import { useState } from 'react';
import { Ico } from './Icons';
import { Sheet, Switch, useToast } from './UI';
import { api } from '@/lib/supabaseClient';
import { chf, PRICE_BANDS, bandForBudget, vibrate } from '@/lib/format';

export const SHOPS = [
  { id: 'galaxus', label: 'Galaxus', url: (q) => `https://www.galaxus.ch/it/search?q=${encodeURIComponent(q)}` },
  { id: 'digitec', label: 'Digitec', url: (q) => `https://www.digitec.ch/it/search?q=${encodeURIComponent(q)}` },
  { id: 'zalando', label: 'Zalando', url: (q) => `https://www.zalando.ch/catalog/?q=${encodeURIComponent(q)}` },
  { id: 'manor', label: 'Manor', url: (q) => `https://www.manor.ch/it/search?q=${encodeURIComponent(q)}` },
  { id: 'google', label: 'Google Shopping', url: (q) => `https://www.google.ch/search?tbm=shop&hl=it&q=${encodeURIComponent(q)}` },
];

export function ShopSearch() {
  const [q, setQ] = useState('');
  return (
    <div className="glass card sm stack" style={{ gap: 10 }}>
      <label className="field" htmlFor="shopq">
        <span className="label">Cerca idee nei negozi svizzeri</span>
        <div className="input-wrap">
          <input id="shopq" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="es. sciarpa in cashmere" enterKeyHint="search" />
          <span className="eye btn icon" aria-hidden="true" style={{ pointerEvents: 'none' }}><Ico.search width={20} height={20} /></span>
        </div>
      </label>
      <div className="shops">
        {SHOPS.map((s) => (
          <a key={s.id} className="pill plain" href={q.trim() ? s.url(q.trim()) : s.url('regalo natale')} target="_blank" rel="noopener noreferrer"
            aria-label={`Cerca su ${s.label} (si apre in una nuova scheda)`}>{s.label} ↗</a>
        ))}
      </div>
    </div>
  );
}

/** Raggruppa per fasce di prezzo. */
export function groupItems(items) {
  return PRICE_BANDS.map((b) => ({
    ...b,
    items: items.filter((i) => b.test(i.price_chf === null || i.price_chf === undefined ? null : Number(i.price_chf)))
      .sort((a, z) => Number(z.is_top) - Number(a.is_top)),
  })).filter((g) => g.items.length);
}

export function BandFilter({ value, onChange, budget }) {
  const ss = bandForBudget(budget);
  return (
    <div className="pills" role="group" aria-label="Filtra per fascia di prezzo">
      <button className="pill plain" aria-pressed={value === 'all'} onClick={() => onChange('all')}>Tutti</button>
      {PRICE_BANDS.map((b) => (
        <button key={b.id} className="pill plain" aria-pressed={value === b.id} onClick={() => onChange(b.id)}>
          {b.label}{b.id === ss ? ' 🎅' : ''}
        </button>
      ))}
    </div>
  );
}

export function ItemsByBand({ items, filter, budget, render }) {
  const ss = bandForBudget(budget);
  const groups = groupItems(items).filter((g) => filter === 'all' || g.id === filter);
  if (!groups.length) return <p className="muted small center mt-16">Nessun desiderio in questa fascia.</p>;
  return groups.map((g) => (
    <section key={g.id} aria-labelledby={`band-${g.id}`}>
      <div className="group-head">
        <h3 id={`band-${g.id}`}>{g.label}</h3>
        {g.id === ss && <span className="badge gold">🎅 Fascia Secret Santa</span>}
      </div>
      <div className="items cascade">{g.items.map(render)}</div>
    </section>
  ));
}

/** Card prodotto con flip 3D per vedere le note. */
export function ItemCard({ item, actions, dim, badge }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <article className={`item ${flipped ? 'flipped' : ''} ${dim ? 'dim' : ''}`} aria-label={item.title}>
      <div className="item-inner">
        <div className="item-face item-front glass" aria-hidden={flipped}>
          <div className="item-img">
            {item.image_url ? <img src={item.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <Ico.gift width={46} height={46} style={{ color: 'var(--berry)', opacity: 0.6 }} />}
            {item.is_top && <span className="badge gold star"><Ico.starFill width={13} height={13} /> Desiderio top</span>}
          </div>
          <button className="flip-btn" onClick={() => setFlipped(true)} aria-label={`Dettagli e note di ${item.title}`} tabIndex={flipped ? -1 : 0}><Ico.flip /></button>
          <div className="item-body">
            <div className="item-title">{item.title}</div>
            <div className="row between">
              <span className="item-store">{item.store || ' '}</span>
              <span className="item-price price">{item.price_chf !== null && item.price_chf !== undefined ? chf(item.price_chf) : ''}</span>
            </div>
            {badge}
            <div className="item-actions">{actions}</div>
          </div>
        </div>
        <div className="item-face item-back glass strong" aria-hidden={!flipped}>
          <div className="row between">
            <b className="small">Dettagli</b>
            <button className="btn icon" style={{ background: 'transparent' }} onClick={() => setFlipped(false)} aria-label="Torna al fronte" tabIndex={flipped ? 0 : -1}><Ico.flip width={20} height={20} /></button>
          </div>
          <p className="small" style={{ whiteSpace: 'pre-wrap' }}>{item.notes || 'Nessuna nota (taglia, colore, variante).'}</p>
          {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn ghost sm" tabIndex={flipped ? 0 : -1}>Apri nel negozio ↗</a>}
        </div>
      </div>
    </article>
  );
}

/** Foglio di aggiunta/modifica con auto-compilazione da link. */
export function ItemForm({ open, onClose, initial, onSave }) {
  const toast = useToast();
  const empty = { title: '', url: '', image_url: '', store: '', price_chf: '', notes: '', is_top: false };
  const [f, setF] = useState(initial || empty);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState(!!initial);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));

  // reset quando si apre con un altro oggetto
  const key = open ? (initial?.id || 'new') : 'closed';
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) { setLastKey(key); setF(initial || empty); setManual(!!initial); setLink(''); setNote(''); }

  async function fetchMeta() {
    if (!link.trim()) return;
    setLoading(true); setNote('');
    try {
      const r = await api('/api/scrape', { method: 'POST', body: { url: link.trim() } });
      setF((s) => ({
        ...s, url: r.url || link.trim(), title: r.title || s.title, image_url: r.image_url || s.image_url,
        store: r.store || s.store, price_chf: r.price_chf ?? s.price_chf,
      }));
      setNote(r.ok ? 'Trovato! Controlla i dati e salva ✨' : 'Questo negozio non si lascia leggere 🙈 Completa i campi qui sotto a mano.');
      setManual(true);
      vibrate(8);
    } catch (e) {
      setNote(e.message); setManual(true); setF((s) => ({ ...s, url: link.trim() }));
    } finally { setLoading(false); }
  }

  async function save(e) {
    e.preventDefault();
    const price = String(f.price_chf).trim() === '' ? null : Number(String(f.price_chf).replace(',', '.').replace(/[^\d.]/g, ''));
    if (price !== null && !Number.isFinite(price)) return toast('Prezzo non valido');
    const clean = (u) => (u && /^https?:\/\//i.test(u.trim()) ? u.trim() : null);
    setBusy(true);
    try {
      await onSave({
        title: f.title.trim().slice(0, 160), url: clean(f.url), image_url: clean(f.image_url),
        store: f.store?.trim() || null, price_chf: price, notes: f.notes?.trim() || null, is_top: !!f.is_top,
      });
      onClose();
    } catch (err) { toast(err.message || 'Salvataggio non riuscito'); }
    finally { setBusy(false); }
  }

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Modifica desiderio' : 'Nuovo desiderio'}>
      <form className="stack" onSubmit={save}>
        {!initial && (
          <div className="glass card sm stack" style={{ gap: 8 }}>
            <label className="label" htmlFor="lnk">Incolla il link del prodotto</label>
            <div className="row">
              <input id="lnk" className="input grow" inputMode="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://www.galaxus.ch/…" />
              <button type="button" className="btn primary sm" onClick={fetchMeta} disabled={loading || !link.trim()}>{loading ? '…' : 'Compila'}</button>
            </div>
            {note && <p className="small" role="status" style={{ fontWeight: 600 }}>{note}</p>}
            {!manual && <button type="button" className="link-btn" onClick={() => setManual(true)}>Non ho un link, scrivo io</button>}
          </div>
        )}
        {manual && (
          <>
            {f.image_url && <img src={f.image_url} alt="" style={{ height: 120, objectFit: 'contain', borderRadius: 16, background: '#fff', margin: '0 auto' }} referrerPolicy="no-referrer" />}
            <div className="field"><label htmlFor="t">Cosa desideri?</label><input id="t" className="input" value={f.title} onChange={set('title')} required maxLength={160} placeholder="es. Sciarpa in cashmere blu" /></div>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div className="field grow"><label htmlFor="pr">Prezzo (CHF)</label><input id="pr" className="input price" inputMode="decimal" value={f.price_chf ?? ''} onChange={set('price_chf')} placeholder="45" /></div>
              <div className="field grow"><label htmlFor="st">Negozio</label><input id="st" className="input" value={f.store || ''} onChange={set('store')} placeholder="Manor" /></div>
            </div>
            <div className="field"><label htmlFor="nt">Note (taglia, colore, variante)</label><textarea id="nt" className="textarea" value={f.notes || ''} onChange={set('notes')} placeholder="Taglia M, colore blu notte" /></div>
            <div className="field"><label htmlFor="u2">Link (facoltativo)</label><input id="u2" className="input" inputMode="url" value={f.url || ''} onChange={set('url')} placeholder="https://" /></div>
            <div className="field"><label htmlFor="im">Link immagine (facoltativo)</label><input id="im" className="input" inputMode="url" value={f.image_url || ''} onChange={set('image_url')} placeholder="https://" /></div>
            <div className="glass card sm row between">
              <span className="row"><Ico.starFill width={22} height={22} style={{ color: 'var(--gold)' }} /><b>Desiderio top</b></span>
              <Switch checked={f.is_top} onChange={(v) => setF((s) => ({ ...s, is_top: v }))} label="Desiderio top" />
            </div>
            <button className="btn primary block" disabled={busy || !f.title.trim()}>{busy ? 'Salvataggio…' : 'Salva desiderio'}</button>
          </>
        )}
      </form>
    </Sheet>
  );
}

export const DETAIL_FIELDS = [
  { k: 'shirt_size', label: 'Taglia maglie', ph: 'es. M' },
  { k: 'pants_size', label: 'Taglia pantaloni', ph: 'es. 44 / W32' },
  { k: 'shoe_size', label: 'Numero di scarpe', ph: 'es. 39' },
  { k: 'fav_colors', label: 'Colori preferiti', ph: 'es. blu, verde salvia' },
  { k: 'allergies', label: 'Allergie / intolleranze', ph: 'es. nichel, lattosio' },
  { k: 'no_gifts', label: 'Cose da non regalare', ph: 'es. candele profumate' },
  { k: 'extra_notes', label: 'Note extra', ph: 'Qualsiasi cosa utile' },
];

export function IdentikitView({ details }) {
  const rows = DETAIL_FIELDS.filter((f) => details?.[f.k]);
  if (!rows.length) return <p className="small muted">Scheda identikit ancora vuota.</p>;
  return (
    <dl className="list" style={{ margin: 0 }}>
      {rows.map((f) => (
        <div className="list-row" key={f.k} style={{ minHeight: 44 }}>
          <dt className="small muted grow">{f.label}</dt>
          <dd style={{ margin: 0, fontWeight: 650, textAlign: 'right', maxWidth: '60%' }}>{details[f.k]}</dd>
        </div>
      ))}
    </dl>
  );
}
