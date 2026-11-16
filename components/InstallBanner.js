'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isIOS, isStandalone } from '@/lib/platform';
import { GlassIcon, Ico } from './Icons';

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let dismissed = false;
    try { dismissed = localStorage.getItem('ss-install-dismissed') === '1'; } catch {}
    setShow(isIOS() && !isStandalone() && !dismissed);
  }, []);
  if (!show) return null;
  return (
    <div className="glass strong install-banner" role="region" aria-label="Installa l’app">
      <GlassIcon name="phone" tone="ice" />
      <div className="grow">
        <b style={{ fontSize: 15 }}>Mettila sulla schermata Home</b>
        <div className="small muted">Si apre come un’app e ricevi le notifiche.</div>
      </div>
      <Link href="/installa" className="btn primary sm">Come</Link>
      <button className="btn icon" style={{ background: 'transparent' }} aria-label="Chiudi avviso"
        onClick={() => { try { localStorage.setItem('ss-install-dismissed', '1'); } catch {} setShow(false); }}>
        <Ico.x width={18} height={18} />
      </button>
    </div>
  );
}
