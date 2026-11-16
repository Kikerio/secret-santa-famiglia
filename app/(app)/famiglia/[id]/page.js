'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getSupabase } from '@/lib/supabaseClient';
import { Avatar, Spinner, useToast } from '@/components/UI';
import { Ico } from '@/components/Icons';
import { Stocking } from '@/components/Illustrations';
import { BandFilter, ItemsByBand, ItemCard, IdentikitView } from '@/components/Wishlist';
import { vibrate } from '@/lib/format';

export default function MemberWishlist() {
  const { id } = useParams();
  const router = useRouter();
  const { profile, event } = useAuth();
  const toast = useToast();
  const [member, setMember] = useState(null);
  const [details, setDetails] = useState(null);
  const [items, setItems] = useState(null);
  const [claims, setClaims] = useState({});
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState('list');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => { if (id === profile.id) router.replace('/desideri'); }, [id, profile.id, router]);

  const loadClaims = useCallback(async (ids) => {
    if (!ids.length) return setClaims({});
    const { data } = await getSupabase().from('claims').select('*').in('item_id', ids);
    setClaims(Object.fromEntries((data || []).map((c) => [c.item_id, c])));
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    let ids = [];
    (async () => {
      const [{ data: m }, { data: d }, { data: w }] = await Promise.all([
        sb.from('profiles').select('id, display_name, avatar_url').eq('id', id).maybeSingle(),
        sb.from('profile_details').select('*').eq('user_id', id).maybeSingle(),
        sb.from('wishlist_items').select('*').eq('owner_id', id).order('created_at', { ascending: false }),
      ]);
      setMember(m); setDetails(d); setItems(w || []);
      ids = (w || []).map((x) => x.id);
      loadClaims(ids);
    })();
    // Aggiornamenti in tempo reale delle prenotazioni
    const ch = sb.channel(`claims-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () => loadClaims(ids))
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [id, loadClaims]);

  async function act(item, action) {
    const sb = getSupabase();
    setBusyId(item.id);
    let error;
    if (action === 'reserve') ({ error } = await sb.from('claims').insert({ item_id: item.id, claimer_id: profile.id, status: 'reserved' }));
    if (action === 'purchase') ({ error } = await sb.from('claims').update({ status: 'purchased' }).eq('item_id', item.id));
    if (action === 'unpurchase') ({ error } = await sb.from('claims').update({ status: 'reserved' }).eq('item_id', item.id));
    if (action === 'cancel') ({ error } = await sb.from('claims').delete().eq('item_id', item.id));
    setBusyId(null);
    if (error) toast(error.code === '23505' ? 'Ops, qualcuno l’ha appena preso!' : 'Non riuscito, riprova');
    else {
      vibrate(10);
      toast({ reserve: 'Opzionato! Solo tu lo sai 🤫', purchase: 'Segnato come acquistato ✅', unpurchase: 'Tornato a “opzionato”', cancel: 'Prenotazione annullata' }[action]);
    }
    loadClaims(items.map((x) => x.id));
  }

  if (!member || !items) return <Spinner />;

  function claimUI(item) {
    const c = claims[item.id];
    const busy = busyId === item.id;
    if (!c) return { actions: <button className="btn primary claim-btn" disabled={busy} onClick={() => act(item, 'reserve')}>🎁 Lo prendo io</button> };
    const mine = c.claimer_id === profile.id;
    if (c.status === 'reserved') {
      return mine
        ? { badge: <span className="badge yellow">Opzionato da te</span>, actions: <>
            <button className="btn green claim-btn" disabled={busy} onClick={() => act(item, 'purchase')}>✓ Segna acquistato</button>
            <button className="btn ghost claim-btn" disabled={busy} onClick={() => act(item, 'cancel')}>Annulla</button></> }
        : { badge: <span className="badge yellow">Qualcuno ha intenzione di prenderlo</span>, actions: <button className="btn ghost claim-btn" disabled>Già opzionato</button> };
    }
    return mine
      ? { badge: <span className="badge green">✓ Acquistato da te</span>, actions: <button className="btn ghost claim-btn" disabled={busy} onClick={() => act(item, 'unpurchase')}>Annulla</button> }
      : { badge: <span className="badge green">✓ Già acquistato</span>, dim: true, actions: null };
  }

  return (
    <div className="stack">
      <div className="row">
        <Link href="/famiglia" className="btn ghost icon" aria-label="Torna alla famiglia"><Ico.back width={22} height={22} /></Link>
        <Avatar src={member.avatar_url} name={member.display_name} size={52} />
        <div className="grow"><h1 style={{ fontSize: 24 }}>{member.display_name}</h1><p className="small muted">La sua lista dei desideri</p></div>
      </div>
      <div className="segmented" role="tablist" aria-label="Sezioni">
        <button role="tab" aria-selected={tab === 'list'} onClick={() => setTab('list')}>🎁 Wishlist</button>
        <button role="tab" aria-selected={tab === 'id'} onClick={() => setTab('id')}>🪪 Identikit</button>
      </div>
      {tab === 'id' ? (
        <div className="glass card"><IdentikitView details={details} /></div>
      ) : items.length === 0 ? (
        <div className="glass card empty">
          <Stocking style={{ width: 110, height: 110 }} />
          <h2>Lista ancora vuota</h2>
          <p className="small muted">Dai un’occhiata alla scheda identikit. Se è la persona che hai pescato, chiedi un’idea in Santa Mail!</p>
        </div>
      ) : (
        <>
          <BandFilter value={filter} onChange={setFilter} budget={event?.budget_chf} />
          <ItemsByBand items={items} filter={filter} budget={event?.budget_chf} render={(it) => {
            const u = claimUI(it);
            return <ItemCard key={it.id} item={it} badge={u.badge} dim={u.dim} actions={u.actions} />;
          }} />
          <p className="tiny center mt-8">🔒 {member.display_name} non vede mai le prenotazioni sulla sua lista.</p>
        </>
      )}
    </div>
  );
}
