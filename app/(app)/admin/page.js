'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/supabaseClient';
import { Avatar, Spinner, Switch, Sheet, PasswordInput, useToast } from '@/components/UI';
import { GlassIcon, Ico } from '@/components/Icons';
import SlideToConfirm from '@/components/SlideToConfirm';
import { REL_TYPES, REL_LABEL } from '@/lib/relations';
import { toLocalInput, fromLocalInput, dateLong } from '@/lib/format';
import { celebrate } from '@/lib/celebrate';

export default function Admin() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [ev, setEv] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [drawErr, setDrawErr] = useState('');
  const [resetFor, setResetFor] = useState(null);
  const [newPw, setNewPw] = useState('');

  useEffect(() => { if (!profile.is_admin) router.replace('/home'); }, [profile.is_admin, router]);

  async function load() {
    try {
      const d = await api('/api/admin/overview');
      setData(d);
      const e = d.event || {};
      setEv({
        name: e.name || 'Secret Santa di Famiglia', year: e.year || new Date().getFullYear(), budget_chf: e.budget_chf ?? 50,
        exchange_at: toLocalInput(e.exchange_at), location: e.location || '', reveal_at: toLocalInput(e.reveal_at),
        exclusion_types: e.exclusion_types || [],
      });
    } catch (err) { toast(err.message); }
  }
  useEffect(() => { if (profile.is_admin) load(); }, []); // eslint-disable-line

  if (!profile.is_admin) return null;
  if (!data || !ev) return <Spinner />;

  const nameOf = Object.fromEntries((data.members || []).map((m) => [m.id, m.display_name]));
  const participants = (data.members || []).filter((m) => m.participates);
  const revealPassed = data.event?.reveal_at && new Date(data.event.reveal_at) <= new Date();

  async function saveEvent(e) {
    e?.preventDefault();
    setSaving(true);
    try {
      await api('/api/admin/event', { method: 'POST', body: {
        ...ev, budget_chf: Number(String(ev.budget_chf).replace(',', '.')),
        exchange_at: fromLocalInput(ev.exchange_at), reveal_at: fromLocalInput(ev.reveal_at),
      } });
      toast('Evento salvato ✓'); await load(); refresh();
    } catch (err) { toast(err.message); } finally { setSaving(false); }
  }
  async function toggleType(t, on) {
    const types = on ? [...ev.exclusion_types, t] : ev.exclusion_types.filter((x) => x !== t);
    setEv({ ...ev, exclusion_types: types });
    try { await api('/api/admin/event', { method: 'POST', body: { exclusion_types: types } }); load(); } catch (err) { toast(err.message); }
  }
  async function setPart(m, v) {
    setData((d) => ({ ...d, members: d.members.map((x) => (x.id === m.id ? { ...x, participates: v } : x)) }));
    try { await api('/api/admin/participants', { method: 'POST', body: { user_id: m.id, participates: v } }); } catch (err) { toast(err.message); load(); }
  }
  async function setRole(m, v) {
    try { await api('/api/admin/role', { method: 'POST', body: { user_id: m.id, is_admin: v } }); toast(v ? 'Ora è co-organizzatore' : 'Ruolo rimosso'); load(); } catch (err) { toast(err.message); }
  }
  async function doReset(e) {
    e.preventDefault();
    try { await api('/api/admin/reset-password', { method: 'POST', body: { user_id: resetFor.id, password: newPw } }); toast(`Password di ${resetFor.display_name} reimpostata 🔐`); setResetFor(null); setNewPw(''); }
    catch (err) { toast(err.message); }
  }
  async function runDraw() {
    setDrawing(true); setDrawErr('');
    try {
      const r = await api('/api/admin/draw', { method: 'POST' });
      setConfirm(false);
      celebrate();
      toast(`Estrazione completata per ${r.count} persone 🎉`);
      load(); refresh();
    } catch (err) { setDrawErr(err.message); } finally { setDrawing(false); }
  }

  return (
    <div className="stack">
      <div className="row">
        <Link href="/profilo" className="btn ghost icon" aria-label="Torna al profilo"><Ico.back width={22} height={22} /></Link>
        <div className="grow"><h1 style={{ fontSize: 25 }}>Pannello organizzatore</h1><p className="small muted">Solo tu lo vedi 🎩</p></div>
      </div>

      {/* Estrazione */}
      <section className="glass card stack" aria-labelledby="draw-h">
        <div className="row"><GlassIcon name="gift" tone="red" /><h2 id="draw-h" className="grow">Estrazione</h2></div>
        {data.event?.drawn_at ? (
          <div className="ok-box">✓ Fatta {dateLong(data.event.drawn_at)} · {data.drawCount} abbinamenti · {data.scratched} hanno già grattato</div>
        ) : <p className="small muted">Non ancora fatta. Partecipanti attivi: <b className="num">{participants.length}</b>.</p>}
        <p className="tiny">🔒 Gli abbinamenti sono cifrati: nemmeno tu puoi vederli prima dello Svelamento.</p>
        {revealPassed ? <p className="small muted">Lo svelamento è già avvenuto: l’estrazione è chiusa.</p> : (
          <SlideToConfirm label={data.event?.drawn_at ? 'Scorri per ripetere' : 'Scorri per estrarre'} onConfirm={() => { setDrawErr(''); setConfirm(true); }} disabled={participants.length < 3} />
        )}
        {participants.length < 3 && <p className="tiny">Servono almeno 3 partecipanti.</p>}
      </section>

      {/* Evento */}
      <form className="glass card stack" onSubmit={saveEvent} aria-labelledby="ev-h">
        <div className="row"><GlassIcon name="calendar" tone="plum" /><h2 id="ev-h" className="grow">Evento</h2></div>
        <div className="field"><label htmlFor="en">Nome</label><input id="en" className="input" value={ev.name} onChange={(e) => setEv({ ...ev, name: e.target.value })} /></div>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div className="field grow"><label htmlFor="ey">Anno</label><input id="ey" className="input num" inputMode="numeric" value={ev.year} onChange={(e) => setEv({ ...ev, year: e.target.value.replace(/\D/g, '') })} /></div>
          <div className="field grow"><label htmlFor="eb">Budget (CHF)</label><input id="eb" className="input price" inputMode="decimal" value={ev.budget_chf} onChange={(e) => setEv({ ...ev, budget_chf: e.target.value })} /></div>
        </div>
        <div className="field"><label htmlFor="ex">Data e ora dello scambio</label><input id="ex" type="datetime-local" className="input" value={ev.exchange_at} onChange={(e) => setEv({ ...ev, exchange_at: e.target.value })} /></div>
        <div className="field"><label htmlFor="el">Luogo</label><input id="el" className="input" value={ev.location} onChange={(e) => setEv({ ...ev, location: e.target.value })} placeholder="es. Casa della nonna, Lugano" /></div>
        <div className="field"><label htmlFor="er">Data e ora dello Svelamento</label><input id="er" type="datetime-local" className="input" value={ev.reveal_at} onChange={(e) => setEv({ ...ev, reveal_at: e.target.value })} />
          <span className="hint">Da quel momento tutti vedono chi ha pescato chi. Ora svizzera.</span></div>
        <p className="tiny">Se cambi l’anno viene creata una nuova edizione: quella vecchia resta salvata per evitare di ripetere gli stessi abbinamenti.</p>
        <button className="btn primary block" disabled={saving}>{saving ? 'Salvataggio…' : 'Salva evento'}</button>
      </form>

      {/* Esclusioni */}
      <section className="glass card stack" aria-labelledby="exc-h">
        <div className="row"><GlassIcon name="heart" tone="green" /><h2 id="exc-h" className="grow">Esclusioni</h2></div>
        <p className="small muted">Questi legami impediscono l’abbinamento in entrambi i sensi, anche se dichiarati da uno solo dei due.</p>
        <div className="list">
          {REL_TYPES.map((t) => (
            <div className="list-row" key={t.id}>
              <span className="grow">{t.emoji} {t.label}</span>
              <Switch checked={ev.exclusion_types.includes(t.id)} onChange={(v) => toggleType(t.id, v)} label={`Escludi ${t.label}`} />
            </div>
          ))}
        </div>
        <h3 className="mt-8">Coppie escluse ({data.exclusions.length})</h3>
        {data.exclusions.length === 0 ? <p className="small muted">Nessuna coppia esclusa.</p> : (
          <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
            {data.exclusions.map((p, i) => <li key={i}><b>{nameOf[p.a]}</b> ⇄ <b>{nameOf[p.b]}</b> <span className="muted">({REL_LABEL[p.rel_type]})</span></li>)}
          </ul>
        )}
      </section>

      {/* Partecipanti */}
      <section className="glass card stack" aria-labelledby="pp-h">
        <div className="row"><GlassIcon name="family" tone="gold" /><h2 id="pp-h" className="grow">Partecipanti</h2></div>
        <div className="list">
          {data.members.map((m) => (
            <div className="list-row" key={m.id} style={{ flexWrap: 'wrap' }}>
              <Avatar src={m.avatar_url} name={m.display_name} size={40} />
              <div className="grow"><b>{m.display_name}</b>{m.is_admin && <span className="badge red" style={{ marginLeft: 6 }}>Org.</span>}<div className="tiny">@{m.username}</div></div>
              <span className="tiny">Partecipa</span>
              <Switch checked={m.participates} onChange={(v) => setPart(m, v)} label={`${m.display_name} partecipa`} />
              <div className="row" style={{ width: '100%', paddingLeft: 52, gap: 6 }}>
                <button className="btn ghost sm" onClick={() => { setResetFor(m); setNewPw(''); }}>🔑 Reimposta password</button>
                {m.id !== profile.id && <button className="btn ghost sm" onClick={() => setRole(m, !m.is_admin)}>{m.is_admin ? 'Togli organizzatore' : 'Rendi organizzatore'}</button>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Sheet open={confirm} onClose={() => !drawing && setConfirm(false)} title={data.event?.drawn_at ? 'Ripetere l’estrazione?' : 'Avviare l’estrazione?'}>
        <div className="stack">
          <p>Verranno abbinate <b className="num">{participants.length}</b> persone, rispettando <b className="num">{data.exclusions.length}</b> esclusioni e, se possibile, evitando gli abbinamenti dell’anno scorso.</p>
          {data.event?.drawn_at && <div className="error-box">Attenzione: ripetendo, l’estrazione attuale e tutte le chat Santa Mail di quest’anno verranno cancellate.</div>}
          <p className="small muted">Tutti riceveranno una notifica (senza nomi). Nessuno, nemmeno tu, vedrà gli abbinamenti degli altri.</p>
          {drawErr && <div className="error-box" role="alert">{drawErr}</div>}
          <button className="btn primary block" onClick={runDraw} disabled={drawing}>{drawing ? 'Estrazione in corso…' : '🎲 Sì, estrai ora'}</button>
          <button className="btn ghost block" onClick={() => setConfirm(false)} disabled={drawing}>Annulla</button>
        </div>
      </Sheet>

      <Sheet open={!!resetFor} onClose={() => setResetFor(null)} title="Reimposta password">
        <form className="stack" onSubmit={doReset}>
          <p>Nuova password per <b>{resetFor?.display_name}</b> (@{resetFor?.username}). Comunicagliela di persona: potrà cambiarla dal suo profilo.</p>
          <PasswordInput id="rp" value={newPw} onChange={setNewPw} autoComplete="new-password" placeholder="Almeno 6 caratteri" />
          <button className="btn primary block" disabled={newPw.length < 6}>Reimposta</button>
        </form>
      </Sheet>
    </div>
  );
}
