'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { api, getSupabase } from '@/lib/supabaseClient';
import { Avatar, Spinner, useToast } from '@/components/UI';
import { Ico, GlassIcon } from '@/components/Icons';
import { SnowGlobe } from '@/components/Illustrations';
import { timeShort } from '@/lib/format';

export default function Page() {
  return <Suspense fallback={<Spinner />}><SantaMail /></Suspense>;
}

function SantaMail() {
  const params = useSearchParams();
  const { profile } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState(params.get('tab') === 'santa' ? 'santa' : 'giftee');
  const [draw, setDraw] = useState(null);
  const [msgs, setMsgs] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { api('/api/draw/me').then(setDraw).catch(() => setDraw({ status: 'error' })); }, []);

  useEffect(() => {
    const sb = getSupabase();
    setMsgs(null);
    sb.from('messages').select('id, box, sender_role, body, created_at').eq('owner_id', profile.id).eq('box', tab)
      .order('created_at', { ascending: true }).limit(500)
      .then(({ data }) => setMsgs(data || []));
    const ch = sb.channel(`mail-${profile.id}-${tab}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `owner_id=eq.${profile.id}` }, (p) => {
        const m = p.new;
        if (m.box !== tab) return;
        setMsgs((list) => (list && !list.some((x) => x.id === m.id) ? [...list, { id: m.id, box: m.box, sender_role: m.sender_role, body: m.body, created_at: m.created_at }] : list));
      })
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [tab, profile.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs]);

  const myRole = tab === 'giftee' ? 'santa' : 'recipient';

  async function send(e) {
    e?.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      const r = await api('/api/messages', { method: 'POST', body: { box: tab, body } });
      setText('');
      setMsgs((list) => (list.some((x) => x.id === r.message.id) ? list : [...list, r.message]));
    } catch (err) { toast(err.message); }
    finally { setSending(false); }
  }

  const ready = draw?.status === 'ready';

  return (
    <div className="stack">
      <div className="page-head"><div><h1>Santa Mail 💌</h1><p className="sub">Chat anonima con bolle di neve</p></div></div>
      <div className="segmented" role="tablist" aria-label="Conversazioni">
        <button role="tab" aria-selected={tab === 'giftee'} onClick={() => setTab('giftee')}>A chi faccio il regalo</button>
        <button role="tab" aria-selected={tab === 'santa'} onClick={() => setTab('santa')}>Il mio Babbo Natale</button>
      </div>

      {!draw ? <Spinner /> : !ready ? (
        <div className="glass card empty">
          <SnowGlobe style={{ width: 120, height: 120 }} />
          <h2>La posta di Babbo Natale è chiusa</h2>
          <p className="small muted">Si apre subito dopo l’estrazione. Torna presto!</p>
        </div>
      ) : (
        <>
          <div className="glass chat-head" role="region" aria-label="Con chi stai parlando">
            {tab === 'giftee' ? (
              <>
                <Avatar src={draw.receiver?.avatar_url} name={draw.receiver?.display_name} size={44} />
                <div className="grow"><b>{draw.receiver?.display_name}</b><div className="tiny">Ti vede come “Il tuo Babbo Natale Segreto” 🎅</div></div>
              </>
            ) : (
              <>
                <GlassIcon name="gift" tone="red" size={44} />
                <div className="grow"><b>Il tuo Babbo Natale Segreto</b><div className="tiny">Rispondi in anonimo: non sai chi è (ancora!)</div></div>
              </>
            )}
          </div>

          <div className="chat" role="log" aria-live="polite" aria-label="Messaggi">
            {!msgs ? <Spinner /> : msgs.length === 0 ? (
              <p className="small muted center" style={{ padding: '24px 12px' }}>
                {tab === 'giftee' ? 'Scrivi un messaggio misterioso: chiedi la taglia o un colore preferito 😉' : 'Nessun messaggio dal tuo Babbo Natale per ora.'}
              </p>
            ) : msgs.map((m) => {
              const me = m.sender_role === myRole;
              return (
                <div key={m.id} style={{ display: 'contents' }}>
                  <div className={`bubble ${me ? 'me' : 'them'}`}>
                    <span className="sr-only">{me ? 'Tu: ' : tab === 'santa' ? 'Il tuo Babbo Natale: ' : `${draw.receiver?.display_name}: `}</span>
                    {m.body}
                  </div>
                  <div className={`bubble-time num ${me ? 'me' : ''}`}>{timeShort(m.created_at)}</div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <form className="glass strong composer" onSubmit={send}>
            <label htmlFor="msg" className="sr-only">Scrivi un messaggio</label>
            <textarea id="msg" rows={1} value={text} maxLength={1000} onChange={(e) => setText(e.target.value)}
              placeholder={tab === 'giftee' ? 'Scrivi come Babbo Natale…' : 'Rispondi al tuo Babbo Natale…'}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) { e.preventDefault(); send(); } }} />
            <button className="btn primary icon" disabled={sending || !text.trim()} aria-label="Invia"><Ico.send width={22} height={22} /></button>
          </form>
        </>
      )}
    </div>
  );
}
