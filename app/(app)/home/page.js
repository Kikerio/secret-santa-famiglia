'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { api, getSupabase } from '@/lib/supabaseClient';
import { Avatar, Spinner } from '@/components/UI';
import { GlassIcon } from '@/components/Icons';
import ScratchCard from '@/components/ScratchCard';
import Countdown from '@/components/Countdown';
import InstallBanner from '@/components/InstallBanner';
import { GiftHero, SnowGlobe } from '@/components/Illustrations';
import { celebrate } from '@/lib/celebrate';
import { chf, dateLong } from '@/lib/format';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

export default function Home() {
  const { profile, event } = useAuth();
  const [draw, setDraw] = useState(null);
  const [progress, setProgress] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    api('/api/draw/me').then(setDraw).catch(() => setDraw({ status: 'error' }));
    const sb = getSupabase();
    Promise.all([
      sb.from('profiles').select('id').eq('participates', true),
      sb.from('wishlist_items').select('owner_id'),
    ]).then(([{ data: p }, { data: w }]) => {
      const ids = new Set((p || []).map((x) => x.id));
      const with_ = new Set((w || []).map((x) => x.owner_id).filter((id) => ids.has(id)));
      setProgress({ done: with_.size, total: ids.size });
    });
  }, []);

  const revealOpen = event?.reveal_at && new Date(event.reveal_at) <= new Date() && event?.drawn_at;
  const firstName = profile.display_name;

  function onReveal() {
    setRevealed(true);
    celebrate();
    api('/api/draw/scratch', { method: 'POST' }).catch(() => {});
  }

  return (
    <div className="cascade stack" style={{ gap: 14 }}>
      <header className="hello">
        <Avatar src={profile.avatar_url} name={profile.display_name} size={52} />
        <div className="grow">
          <div className="greet">{greeting()} 👋</div>
          <h1>{firstName}</h1>
        </div>
        <GlassIcon name="snow" tone="ice" size={40} />
      </header>

      <InstallBanner />

      {/* Card centrale */}
      <section aria-labelledby="draw-title">
        <h2 id="draw-title" className="sr-only">La tua estrazione</h2>
        {!draw && <div className="glass card"><Spinner /></div>}
        {draw?.status === 'pending' && (
          <div className="glass card empty">
            <GiftHero style={{ width: 120, height: 120 }} />
            <h2>L’estrazione arriva presto</h2>
            <p className="muted small">Quando l’organizzatore avvia l’estrazione, qui comparirà la tua card da grattare. Nel frattempo compila la tua wishlist!</p>
            <Link href="/desideri" className="btn primary mt-8">Compila la wishlist</Link>
          </div>
        )}
        {draw?.status === 'not-participating' && (
          <div className="glass card empty">
            <SnowGlobe style={{ width: 110, height: 110 }} />
            <h2>Quest’anno non partecipi</h2>
            <p className="muted small">Se è un errore, chiedi all’organizzatore di includerti.</p>
          </div>
        )}
        {draw?.status === 'no-event' && <div className="glass card muted">Nessun evento attivo.</div>}
        {draw?.status === 'error' && <div className="glass card error-box">Non riesco a caricare l’estrazione. Riprova tra poco.</div>}
        {draw?.status === 'ready' && (draw.scratched || revealed ? (
          <ReceiverCard r={draw.receiver} fresh={revealed} />
        ) : (
          <ScratchCard onReveal={onReveal}>
            <ReceiverInner r={draw.receiver} />
          </ScratchCard>
        ))}
      </section>

      {/* Bento grid */}
      <section className="bento" aria-label="Dettagli dell’evento">
        <div className="glass tile span-2">
          <div className="row between">
            <span className="k">Allo scambio regali</span>
            <GlassIcon name="clock" tone="red" size={32} />
          </div>
          <Countdown target={event?.exchange_at} />
        </div>
        <div className="glass tile">
          <GlassIcon name="coin" tone="gold" />
          <span className="k">Budget max</span>
          <span className="v price">{chf(event?.budget_chf)}</span>
        </div>
        <div className="glass tile">
          <GlassIcon name="pin" tone="green" />
          <span className="k">Dove</span>
          <span className="v sm">{event?.location || 'Da definire'}</span>
        </div>
        <div className="glass tile span-2">
          <div className="row">
            <GlassIcon name="calendar" tone="plum" size={36} />
            <div className="grow">
              <span className="k">Quando</span>
              <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{dateLong(event?.exchange_at)}</div>
            </div>
          </div>
        </div>
        <div className="glass tile span-2" style={{ minHeight: 0 }}>
          <div className="row between">
            <span className="k">Wishlist pronte</span>
            {progress && <span className="num" style={{ fontWeight: 800 }}>{progress.done}/{progress.total}</span>}
          </div>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={progress?.total || 0} aria-valuenow={progress?.done || 0}
            aria-label="Familiari con una wishlist">
            <i style={{ width: progress?.total ? `${(progress.done / progress.total) * 100}%` : 0 }} />
          </div>
          <p className="small muted">{progress ? `${progress.done} su ${progress.total} hanno già una wishlist` : '…'}</p>
        </div>
      </section>

      {/* Grande Svelamento */}
      {event?.drawn_at && (
        revealOpen ? (
          <Link href="/svelamento" className="glass banner-reveal">
            <GlassIcon name="sparkle" tone="gold" size={48} />
            <div className="grow"><b className="rounded" style={{ fontSize: 18 }}>Il Grande Svelamento è aperto!</b><div className="small muted">Scopri chi ha pescato chi ✨</div></div>
          </Link>
        ) : (
          <div className="glass banner-reveal" aria-disabled="true">
            <GlassIcon name="lock" tone="ink" size={48} />
            <div className="grow"><b className="rounded" style={{ fontSize: 17 }}>Grande Svelamento</b><div className="small muted">Si sblocca {dateLong(event?.reveal_at)}</div></div>
          </div>
        )
      )}

      {/* Accesso rapido */}
      <nav className="pills" aria-label="Accesso rapido">
        <Link href="/desideri" className="pill"><GlassIcon name="gift" tone="red" size={32} />La mia wishlist</Link>
        <Link href="/famiglia" className="pill"><GlassIcon name="family" tone="green" size={32} />Liste famiglia</Link>
        <Link href="/santa-mail" className="pill"><GlassIcon name="mail" tone="gold" size={32} />Santa Mail</Link>
      </nav>
    </div>
  );
}

function ReceiverInner({ r }) {
  return (
    <>
      <Avatar src={r?.avatar_url} name={r?.display_name} size={108} />
      <span className="tiny" style={{ fontWeight: 700, textTransform: 'uppercase' }}>Fai il regalo a</span>
      <h2 style={{ fontSize: 28 }}>{r?.display_name}</h2>
    </>
  );
}

function ReceiverCard({ r, fresh }) {
  return (
    <div className="glass strong receiver-card" aria-live={fresh ? 'polite' : undefined}>
      <span className="who">🎁 Quest’anno fai il regalo a</span>
      <Avatar src={r?.avatar_url} name={r?.display_name} size={108} />
      <h2>{r?.display_name}</h2>
      <p className="small muted">È un segreto: non dirlo a nessuno 🤫</p>
      <div className="row wrap center" style={{ gap: 8 }}>
        <Link href={`/famiglia/${r?.id}`} className="btn primary">Guarda la sua wishlist</Link>
        <Link href="/santa-mail?tab=giftee" className="btn ghost">Scrivi in Santa Mail</Link>
      </div>
    </div>
  );
}
