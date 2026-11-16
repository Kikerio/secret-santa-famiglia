'use client';
import { useEffect, useRef, useState } from 'react';
import { Sheet } from './UI';
import { Ico } from './Icons';

const OUT = 512;

/** Selezione foto (fotocamera o galleria) + ritaglio quadrato + resize 512×512 JPEG. */
export default function AvatarPicker({ value, onChange, label = 'Aggiungi foto' }) {
  const inputRef = useRef(null);
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(value || null);

  useEffect(() => { if (value && typeof value === 'string') setPreview(value); }, [value]);

  function pick(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => setImg(im);
    im.src = url;
  }

  return (
    <>
      <button type="button" className="avatar-pick" onClick={() => inputRef.current?.click()} aria-label={preview ? 'Cambia foto profilo' : label}>
        {preview ? <img src={preview} alt="" /> : <span><Ico.camera width={30} height={30} /><br />{label}</span>}
        <span className="plus" aria-hidden="true"><Ico.plus width={18} height={18} /></span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={pick} hidden />
      <Cropper image={img} onCancel={() => setImg(null)} onDone={(blob) => {
        setImg(null);
        setPreview(URL.createObjectURL(blob));
        onChange?.(blob);
      }} />
    </>
  );
}

function Cropper({ image, onCancel, onDone }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const drag = useRef(null);

  useEffect(() => { setZoom(1); setOff({ x: 0, y: 0 }); }, [image]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !image) return;
    c.width = OUT; c.height = OUT;
    draw(c.getContext('2d'), image, zoom, off);
  }, [image, zoom, off]);

  if (!image) return null;

  function draw(ctx, im, z, o) {
    const base = Math.max(OUT / im.width, OUT / im.height) * z;
    const w = im.width * base, h = im.height * base;
    const maxX = (w - OUT) / 2, maxY = (h - OUT) / 2;
    const x = Math.max(-maxX, Math.min(maxX, o.x));
    const y = Math.max(-maxY, Math.min(maxY, o.y));
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, OUT, OUT);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, (OUT - w) / 2 + x, (OUT - h) / 2 + y, w, h);
  }

  function down(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, o: off };
  }
  function move(e) {
    if (!drag.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const k = OUT / rect.width;
    setOff({ x: drag.current.o.x + (e.clientX - drag.current.x) * k, y: drag.current.o.y + (e.clientY - drag.current.y) * k });
  }
  function up() { drag.current = null; }

  function done() {
    const c = document.createElement('canvas');
    c.width = OUT; c.height = OUT;
    draw(c.getContext('2d'), image, zoom, off);
    c.toBlob((b) => b && onDone(b), 'image/jpeg', 0.85);
  }

  return (
    <Sheet open title="Sistema la foto" onClose={onCancel}>
      <div className="stack">
        <div className="cropper" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <canvas ref={canvasRef} aria-label="Anteprima ritaglio: trascina per spostare" role="img" />
          <div className="mask" />
        </div>
        <label className="field">
          <span className="label">Zoom</span>
          <input className="range" type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(+e.target.value)} aria-label="Zoom foto" />
        </label>
        <p className="tiny center">Trascina con il dito per centrare il viso.</p>
        <button type="button" className="btn primary block" onClick={done}><Ico.check width={20} height={20} /> Usa questa foto</button>
      </div>
    </Sheet>
  );
}
