'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ico, GlassIcon } from '@/components/Icons';
import { isInAppBrowser, isStandalone } from '@/lib/platform';

function Step({ n, title, children }) {
  return (
    <li className="glass guide-step">
      <span className="n" aria-hidden="true">{n}</span>
      <div className="grow"><h3 style={{ marginBottom: 4 }}><span className="sr-only">Passo {n}: </span>{title}</h3>{children}</div>
    </li>
  );
}
function Mock({ icon, children, trailing }) {
  const I = Ico[icon];
  return <span className="safari-mock" aria-hidden="true">{I && <I />}<span>{children}</span>{trailing}</span>;
}

export default function InstallGuide() {
  const [standalone, setStandalone] = useState(false);
  const [inApp, setInApp] = useState(false);
  useEffect(() => { setStandalone(isStandalone()); setInApp(isInAppBrowser()); }, []);

  return (
    <main className="screen no-tabs" id="main">
      <div className="stack">
        <div className="row">
          <Link href="/" className="btn ghost icon" aria-label="Indietro"><Ico.back width={22} height={22} /></Link>
          <h1 style={{ fontSize: 25 }}>Installa su iPhone</h1>
        </div>

        {standalone ? (
          <div className="ok-box">✓ Stai già usando l’app dalla schermata Home. Perfetto!</div>
        ) : (
          <p className="muted">In 30 secondi l’app finisce sulla schermata Home, si apre a tutto schermo e può mandarti le notifiche. 🎄</p>
        )}

        {inApp && (
          <div className="glass card stack" style={{ gap: 6, borderColor: 'rgba(224,49,43,.3)' }} role="alert">
            <b>Hai aperto il link dentro WhatsApp (o un’altra app)</b>
            <p className="small">Prima tocca <b>•••</b> o l’icona della bussola e scegli <b>“Apri in Safari”</b>, poi segui i passi qui sotto.</p>
            <Mock icon="compass">Apri in Safari</Mock>
          </div>
        )}

        <h2 style={{ margin: '6px 4px 0' }}>iOS 26</h2>
        <ol className="stack" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <Step n={1} title="Tocca i tre puntini">
            <p className="small muted">In basso a destra nella barra di Safari.</p>
            <Mock icon="more">{null}</Mock>
          </Step>
          <Step n={2} title="Tocca “Condividi”">
            <p className="small muted">È il quadrato con la freccia verso l’alto.</p>
            <Mock icon="share">Condividi</Mock>
          </Step>
          <Step n={3} title="Scegli “Aggiungi alla schermata Home”">
            <p className="small muted">Scorri un po’ verso il basso nel menu se non lo vedi subito.</p>
            <Mock icon="addSquare">Aggiungi alla schermata Home</Mock>
          </Step>
          <Step n={4} title="Lascia attivo “Apri come app web”">
            <p className="small muted">L’interruttore deve restare verde.</p>
            <Mock icon={null} trailing={<span className="tgl" />}>Apri come app web</Mock>
          </Step>
          <Step n={5} title="Tocca “Aggiungi”">
            <p className="small muted">In alto a destra. Fatto! Ora apri l’app dall’icona del pacco regalo 🎁</p>
            <span className="row mt-8" aria-hidden="true">
              <img src="/icons/apple-touch-icon.png" alt="" width="60" height="60" style={{ borderRadius: 14, boxShadow: '0 4px 12px rgba(0,0,0,.15)' }} />
              <span className="small" style={{ fontWeight: 600 }}>Secret Santa</span>
            </span>
          </Step>
        </ol>

        <div className="glass card stack" style={{ gap: 8 }}>
          <div className="row"><GlassIcon name="phone" tone="ice" size={36} /><h3>iOS 16.4 – 18</h3></div>
          <p className="small">Il tasto <b>Condividi</b> <Ico.share width={18} height={18} style={{ verticalAlign: '-3px', color: '#0A84FF' }} aria-hidden="true" /> è già visibile nella barra in basso: toccalo e continua dal passo 3.</p>
        </div>

        <div className="glass card stack" style={{ gap: 8 }}>
          <div className="row"><GlassIcon name="sparkle" tone="gold" size={36} /><h3>Non trovi l’opzione?</h3></div>
          <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
            <li>In fondo al menu Condividi tocca <b>“Modifica azioni”</b> e attiva “Aggiungi alla schermata Home”.</li>
            <li>Se il link si è aperto dentro <b>WhatsApp</b>, tocca prima <b>“Apri in Safari”</b>.</li>
            <li>Usa Safari: da Chrome o altre app su iPhone le notifiche non funzionano.</li>
          </ul>
        </div>
        <Link href="/" className="btn primary block">Ho fatto, torna all’app</Link>
      </div>
    </main>
  );
}
