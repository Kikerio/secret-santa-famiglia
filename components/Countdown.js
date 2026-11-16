'use client';
import { useEffect, useState } from 'react';

export function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (!target) return null;
  const ms = Math.max(0, new Date(target).getTime() - now);
  return { ms, d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 };
}

export default function Countdown({ target }) {
  const c = useCountdown(target);
  if (!c) return <p className="muted small">Data da definire</p>;
  if (c.ms === 0) return <p className="rounded" style={{ fontSize: 22, fontWeight: 800 }}>È il giorno dei regali! 🎁</p>;
  const cells = [['d', 'giorni'], ['h', 'ore'], ['m', 'min'], ['s', 'sec']];
  return (
    <div className="countdown-grid countdown" role="timer" aria-label={`Mancano ${c.d} giorni, ${c.h} ore e ${c.m} minuti`}>
      {cells.map(([k, l]) => <div key={k} aria-hidden="true"><b>{String(c[k]).padStart(2, '0')}</b><span>{l}</span></div>)}
    </div>
  );
}
