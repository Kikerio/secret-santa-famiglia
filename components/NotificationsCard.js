'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/supabaseClient';
import { isIOS, isStandalone, pushSupported } from '@/lib/platform';
import { GlassIcon } from './Icons';
import { useToast } from './UI';

function b64ToUint8(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function NotificationsCard() {
  const toast = useToast();
  const [state, setState] = useState('loading'); // loading | need-install | unsupported | denied | off | on
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (isIOS() && !isStandalone()) return setState('need-install');
      if (!pushSupported()) return setState('unsupported');
      if (Notification.permission === 'denied') return setState('denied');
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setState(sub && Notification.permission === 'granted' ? 'on' : 'off');
    })().catch(() => setState('unsupported'));
  }, []);

  // Il prompt del browser parte SOLO da questo tap esplicito.
  async function enable() {
    setBusy(true);
    try {
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error('Notifiche non ancora configurate dall’organizzatore');
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setState(perm === 'denied' ? 'denied' : 'off'); return; }
      const reg = (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register('/sw.js'));
      await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(key) });
      await api('/api/push/subscribe', { method: 'POST', body: { subscription: sub.toJSON() } });
      setState('on');
      toast('Notifiche attive! Ti abbiamo mandato una notifica di prova 🔔');
    } catch (e) { toast(e.message || 'Attivazione non riuscita'); }
    finally { setBusy(false); }
  }
  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) { await api('/api/push/subscribe', { method: 'DELETE', body: { endpoint: sub.endpoint } }); await sub.unsubscribe(); }
      setState('off');
    } finally { setBusy(false); }
  }

  return (
    <div className="glass card stack" style={{ gap: 10 }}>
      <div className="row">
        <GlassIcon name="bell" tone="gold" />
        <div className="grow"><h3>Notifiche</h3><p className="small muted">Estrazione, Santa Mail e promemoria. Mai nomi sulla schermata di blocco.</p></div>
      </div>
      {state === 'loading' && <p className="small muted">Controllo…</p>}
      {state === 'need-install' && (
        <>
          <p className="small">Su iPhone le notifiche funzionano solo se apri l’app <b>dall’icona sulla schermata Home</b> (iOS 16.4 o successivo).</p>
          <Link href="/installa" className="btn primary block">Guida all’installazione</Link>
        </>
      )}
      {state === 'unsupported' && <p className="small muted">Questo browser non supporta le notifiche push.</p>}
      {state === 'denied' && <p className="small">Hai bloccato le notifiche. Per riattivarle: <b>Impostazioni › Notifiche › Secret Santa</b> e attiva “Consenti notifiche”.</p>}
      {state === 'off' && <button className="btn primary block" onClick={enable} disabled={busy}>{busy ? 'Attivazione…' : '🔔 Attiva notifiche'}</button>}
      {state === 'on' && (
        <div className="row between">
          <span className="badge green">✓ Attive su questo dispositivo</span>
          <button className="btn ghost sm" onClick={disable} disabled={busy}>Disattiva</button>
        </div>
      )}
    </div>
  );
}
