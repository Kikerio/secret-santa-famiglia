'use client';
import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { initials } from '@/lib/format';
import { Ico } from './Icons';

export function Avatar({ src, name, size = 44, className = '' }) {
  const [err, setErr] = useState(false);
  return (
    <span className={`avatar ${className}`} style={{ '--s': `${size}px` }} role="img" aria-label={name ? `Foto di ${name}` : 'Avatar'}>
      {src && !err ? <img src={src} alt="" onError={() => setErr(true)} /> : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  );
}

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <span className="switch">
      <input type="checkbox" role="switch" checked={!!checked} disabled={disabled} aria-label={label}
        onChange={(e) => onChange?.(e.target.checked)} />
      <span className="track" /><span className="thumb" />
    </span>
  );
}

export function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="backdrop" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="grabber" aria-hidden="true" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="btn ghost icon" onClick={onClose} aria-label="Chiudi"><Ico.x width={20} height={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PasswordInput({ id, value, onChange, autoComplete = 'current-password', placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-wrap">
      <input id={id} className="input" type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete} placeholder={placeholder} required minLength={6} />
      <button type="button" className="btn icon eye" style={{ background: 'transparent' }} onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Nascondi password' : 'Mostra password'}>
        {show ? <Ico.eyeOff width={22} height={22} /> : <Ico.eye width={22} height={22} />}
      </button>
    </div>
  );
}

export function Spinner({ label = 'Caricamento…' }) {
  return <div role="status" aria-live="polite"><div className="spinner" /><span className="sr-only">{label}</span></div>;
}

const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const show = useCallback((m) => {
    setMsg(m);
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => setMsg(null), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div aria-live="polite" role="status">{msg && <div className="toast">{msg}</div>}</div>
    </ToastCtx.Provider>
  );
}
export function useToast() { return useContext(ToastCtx); }
