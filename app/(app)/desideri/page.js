'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getSupabase } from '@/lib/supabaseClient';
import { Spinner, useToast } from '@/components/UI';
import { Ico } from '@/components/Icons';
import { Gingerbread } from '@/components/Illustrations';
import { ShopSearch, BandFilter, ItemsByBand, ItemCard, ItemForm, DETAIL_FIELDS } from '@/components/Wishlist';

export default function MyWishlist() {
  const { profile, event } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('list');
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null); // null | 'new' | item

  async function load() {
    const { data } = await getSupabase().from('wishlist_items').select('*').eq('owner_id', profile.id).order('created_at', { ascending: false });
    setItems(data || []);
  }
  useEffect(() => { load(); }, []); // eslint-disable-line

  async function save(values) {
    const sb = getSupabase();
    const q = editing && editing !== 'new'
      ? sb.from('wishlist_items').update(values).eq('id', editing.id)
      : sb.from('wishlist_items').insert({ ...values, owner_id: profile.id });
    const { error } = await q;
    if (error) throw new Error('Salvataggio non riuscito');
    toast('Desiderio salvato 🎁');
    load();
  }
  async function remove(item) {
    if (!confirm(`Eliminare “${item.title}”?`)) return;
    await getSupabase().from('wishlist_items').delete().eq('id', item.id);
    toast('Eliminato'); load();
  }
  async function toggleTop(item) {
    await getSupabase().from('wishlist_items').update({ is_top: !item.is_top }).eq('id', item.id);
    load();
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div><h1>I miei desideri</h1><p className="sub">Aiuta il tuo Babbo Natale Segreto ✨</p></div>
        {tab === 'list' && <button className="btn primary icon" onClick={() => setEditing('new')} aria-label="Aggiungi desiderio"><Ico.plus width={24} height={24} /></button>}
      </div>
      <div className="segmented" role="tablist" aria-label="Sezioni">
        <button role="tab" aria-selected={tab === 'list'} onClick={() => setTab('list')}>🎁 Wishlist</button>
        <button role="tab" aria-selected={tab === 'id'} onClick={() => setTab('id')}>🪪 Identikit</button>
      </div>

      {tab === 'list' ? (
        <>
          <ShopSearch />
          {!items ? <Spinner /> : items.length === 0 ? (
            <div className="glass card empty">
              <Gingerbread style={{ width: 120, height: 120 }} />
              <h2>La tua lista è vuota</h2>
              <p className="small muted">Incolla il link di un prodotto o scrivi un’idea: chi ti ha pescato ti ringrazierà!</p>
              <button className="btn primary mt-8" onClick={() => setEditing('new')}><Ico.plus width={20} height={20} /> Aggiungi il primo desiderio</button>
            </div>
          ) : (
            <>
              <BandFilter value={filter} onChange={setFilter} budget={event?.budget_chf} />
              <ItemsByBand items={items} filter={filter} budget={event?.budget_chf} render={(it) => (
                <ItemCard key={it.id} item={it} actions={<>
                  <button className="star-toggle" onClick={() => toggleTop(it)} aria-pressed={it.is_top} aria-label={it.is_top ? 'Togli da desiderio top' : 'Segna come desiderio top'}>
                    {it.is_top ? <Ico.starFill style={{ color: 'var(--gold)' }} /> : <Ico.star style={{ color: 'var(--ink-3)' }} />}
                  </button>
                  <button className="star-toggle" onClick={() => setEditing(it)} aria-label={`Modifica ${it.title}`}><Ico.edit /></button>
                  <button className="star-toggle" onClick={() => remove(it)} aria-label={`Elimina ${it.title}`}><Ico.trash style={{ color: 'var(--berry-deep)' }} /></button>
                </>} />
              )} />
              <p className="tiny center mt-8">🤫 Non vedrai mai chi ha scelto i tuoi regali: la sorpresa è garantita.</p>
            </>
          )}
        </>
      ) : <Identikit userId={profile.id} />}

      <ItemForm open={!!editing} initial={editing && editing !== 'new' ? editing : null} onClose={() => setEditing(null)} onSave={save} />
    </div>
  );
}

function Identikit({ userId }) {
  const toast = useToast();
  const [d, setD] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    getSupabase().from('profile_details').select('*').eq('user_id', userId).maybeSingle().then(({ data }) => setD(data || {}));
  }, [userId]);
  if (!d) return <Spinner />;
  async function save(e) {
    e.preventDefault(); setBusy(true);
    const row = { user_id: userId, updated_at: new Date().toISOString() };
    for (const f of DETAIL_FIELDS) row[f.k] = (d[f.k] || '').trim() || null;
    const { error } = await getSupabase().from('profile_details').upsert(row);
    setBusy(false);
    toast(error ? 'Non salvato, riprova' : 'Identikit salvato ✓');
  }
  return (
    <form className="glass card stack" onSubmit={save}>
      <p className="small muted">Queste informazioni sono visibili a tutta la famiglia: aiutano a scegliere la taglia giusta.</p>
      {DETAIL_FIELDS.map((f) => (
        <div className="field" key={f.k}>
          <label htmlFor={f.k}>{f.label}</label>
          {['no_gifts', 'extra_notes', 'allergies'].includes(f.k)
            ? <textarea id={f.k} className="textarea" value={d[f.k] || ''} onChange={(e) => setD({ ...d, [f.k]: e.target.value })} placeholder={f.ph} />
            : <input id={f.k} className="input" value={d[f.k] || ''} onChange={(e) => setD({ ...d, [f.k]: e.target.value })} placeholder={f.ph} />}
        </div>
      ))}
      <button className="btn primary block" disabled={busy}>{busy ? 'Salvataggio…' : 'Salva identikit'}</button>
    </form>
  );
}
