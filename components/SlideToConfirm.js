'use client';
import { useRef, useState } from 'react';
import { Ico } from './Icons';
import { vibrate } from '@/lib/format';

/** Slider tattile "Scorri per confermare" con alternativa accessibile da tastiera. */
export default function SlideToConfirm({ label = 'Scorri per confermare', onConfirm, disabled }) {
  const track = useRef(null);
  const [x, setX] = useState(0);
  const [done, setDone] = useState(false);
  const start = useRef(null);

  function max() { return (track.current?.clientWidth || 300) - 64; }
  function down(e) {
    if (disabled || done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = e.clientX - x;
  }
  function move(e) {
    if (start.current === null) return;
    const v = Math.max(0, Math.min(max(), e.clientX - start.current));
    setX(v);
  }
  async function up() {
    if (start.current === null) return;
    start.current = null;
    if (x >= max() * 0.88) await confirm();
    else setX(0);
  }
  async function confirm() {
    setX(max()); setDone(true); vibrate([10, 30, 10]);
    try { await onConfirm?.(); } finally { setTimeout(() => { setDone(false); setX(0); }, 900); }
  }

  return (
    <div className={`slider ${done ? 'done' : ''}`} ref={track} style={{ opacity: disabled ? 0.5 : 1 }}>
      <div className="fill" style={{ width: x + 60 }} />
      <div className="label" aria-hidden="true">{label}</div>
      <button type="button" className="knob" style={{ transform: `translateX(${x}px)`, transition: start.current === null ? 'transform .45s var(--spring)' : 'none' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); confirm(); } }}
        disabled={disabled} aria-label={`${label}. Su tastiera o lettore schermo premi Invio per confermare.`}>
        {done ? <Ico.check /> : <Ico.arrow />}
      </button>
    </div>
  );
}
