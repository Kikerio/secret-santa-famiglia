'use client';
import { useEffect, useRef, useState } from 'react';
import { vibrate } from '@/lib/format';

const THRESHOLD = 0.55;

/** Lamina dorata satinata da grattare (canvas). */
export default function ScratchCard({ children, onReveal }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const last = useRef(null);
  const moves = useRef(0);
  const [gone, setGone] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const c = canvas.current, w = wrap.current;
    if (!c || !w) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = w.getBoundingClientRect();
    c.width = Math.round(width * dpr); c.height = Math.round(height * dpr);
    const ctx = c.getContext('2d');
    paintFoil(ctx, c.width, c.height, dpr);
  }, []);

  function pos(e) {
    const r = canvas.current.getBoundingClientRect();
    const k = canvas.current.width / r.width;
    return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k, k };
  }
  function scratch(from, to) {
    const ctx = canvas.current.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = 46 * to.k;
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(to.x, to.y, 23 * to.k, 0, Math.PI * 2); ctx.fill();
  }
  function ratio() {
    const c = canvas.current;
    const { data } = c.getContext('2d').getImageData(0, 0, c.width, c.height);
    let clear = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) { total++; if (data[i] < 40) clear++; }
    return clear / total;
  }
  function finish() {
    if (gone) return;
    setGone(true);
    vibrate([12, 40, 18]);
    onReveal?.();
  }

  function down(e) {
    if (gone) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setStarted(true);
    const p = pos(e); last.current = p; scratch(p, p);
  }
  function move(e) {
    if (!last.current || gone) return;
    const p = pos(e); scratch(last.current, p); last.current = p;
    if (++moves.current % 6 === 0) {
      vibrate(4);
      if (ratio() >= THRESHOLD) finish();
    }
  }
  function up() {
    last.current = null;
    if (!gone && ratio() >= THRESHOLD) finish();
  }

  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="scratch" ref={wrap}>
        <div className="under" aria-hidden={!gone}>{children}</div>
        <canvas ref={canvas} className={gone ? 'gone' : ''} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          role="img" aria-label="Lamina dorata da grattare: passa il dito per scoprire chi hai pescato" />
        {!started && !gone && <span className="hint-chip" aria-hidden="true">👆 Gratta con il dito</span>}
      </div>
      {!gone && (
        <button type="button" className="link-btn" style={{ alignSelf: 'center' }} onClick={finish}>
          Rivela senza grattare
        </button>
      )}
    </div>
  );
}

function paintFoil(ctx, w, h, dpr) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#B7832A'); g.addColorStop(0.25, '#F3D488'); g.addColorStop(0.5, '#D9A13B');
  g.addColorStop(0.72, '#F8E2A6'); g.addColorStop(1, '#A87420');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // satinatura
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.2 * dpr, 6 * dpr * Math.random());
  }
  const sheen = ctx.createLinearGradient(0, 0, w, 0);
  sheen.addColorStop(0, 'rgba(255,255,255,0)'); sheen.addColorStop(0.45, 'rgba(255,255,255,0.35)'); sheen.addColorStop(0.55, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen; ctx.fillRect(0, 0, w, h);
  // texture natalizia
  ctx.strokeStyle = 'rgba(120,80,15,0.28)'; ctx.fillStyle = 'rgba(255,248,225,0.55)';
  ctx.lineWidth = 1.6 * dpr; ctx.lineCap = 'round';
  const step = 58 * dpr;
  for (let y = step / 2, row = 0; y < h; y += step, row++) {
    for (let x = (row % 2 ? step : step / 2); x < w; x += step) {
      if ((Math.round(x + y) / step) % 3 < 1) star(ctx, x, y, 6 * dpr); else flake(ctx, x, y, 8 * dpr);
    }
  }
  // etichetta centrale
  ctx.fillStyle = 'rgba(255,250,235,0.92)';
  ctx.shadowColor = 'rgba(90,55,5,0.35)'; ctx.shadowBlur = 8 * dpr;
  ctx.font = `800 ${26 * dpr}px "SF Pro Rounded", ui-rounded, -apple-system, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('✨ Gratta qui ✨', w / 2, h / 2 - 12 * dpr);
  ctx.font = `600 ${15 * dpr}px -apple-system, sans-serif`;
  ctx.fillText('Scopri chi hai pescato', w / 2, h / 2 + 20 * dpr);
  ctx.shadowBlur = 0;
}
function flake(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = (Math.PI / 3) * i;
    ctx.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.stroke();
}
function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
}
