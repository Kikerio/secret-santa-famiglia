'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabaseClient';
import AvatarPicker from '@/components/AvatarPicker';
import { PasswordInput } from '@/components/UI';
import { Ico } from '@/components/Icons';

export default function Register() {
  const router = useRouter();
  const [f, setF] = useState({ display_name: '', username: '', password: '', confirm: '', family_code: '' });
  const [avatar, setAvatar] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: typeof v === 'string' ? v : v.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (f.password !== f.confirm) return setErr('Le due password non coincidono.');
    const username = f.username.trim().toLowerCase();
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set('display_name', f.display_name.trim());
      fd.set('username', username);
      fd.set('password', f.password);
      fd.set('family_code', f.family_code);
      if (avatar) fd.set('avatar', avatar, 'avatar.jpg');
      const res = await fetch('/api/register', { method: 'POST', body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Registrazione non riuscita');
      const { error } = await getSupabase().auth.signInWithPassword({ email: j.email, password: f.password });
      if (error) throw new Error('Account creato! Ora accedi con nome utente e password.');
      router.replace('/benvenuto');
    } catch (e2) {
      setErr(e2.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="stack cascade">
      <div className="row">
        <Link href="/login" className="btn ghost icon" aria-label="Torna all’accesso"><Ico.back width={22} height={22} /></Link>
        <h1 style={{ fontSize: 26 }}>Unisciti alla famiglia</h1>
      </div>
      <form className="glass card stack" onSubmit={submit}>
        <AvatarPicker onChange={setAvatar} label="La tua foto" />
        <p className="tiny center">Scatta un selfie o scegli una foto dalla galleria</p>
        <div className="field">
          <label htmlFor="dn">Come ti chiamano in famiglia?</label>
          <input id="dn" className="input" value={f.display_name} onChange={set('display_name')} placeholder="es. Zia Carla" maxLength={40} required />
        </div>
        <div className="field">
          <label htmlFor="un">Nome utente (per accedere)</label>
          <input id="un" className="input" value={f.username} onChange={(e) => set('username')(e.target.value.toLowerCase().replace(/\s/g, ''))}
            autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="username" placeholder="es. carla" pattern="[a-z0-9._\-]{3,24}" required />
          <span className="hint">Minuscole, numeri, punto o trattino. Da 3 a 24 caratteri.</span>
        </div>
        <div className="field">
          <label htmlFor="pw">Password</label>
          <PasswordInput id="pw" value={f.password} onChange={set('password')} autoComplete="new-password" placeholder="Almeno 6 caratteri" />
        </div>
        <div className="field">
          <label htmlFor="pw2">Ripeti la password</label>
          <PasswordInput id="pw2" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" />
        </div>
        <div className="field">
          <label htmlFor="fc">Codice famiglia</label>
          <input id="fc" className="input" value={f.family_code} onChange={set('family_code')} autoCapitalize="characters" autoCorrect="off" required placeholder="Te lo dà l’organizzatore" />
        </div>
        {err && <div className="error-box" role="alert">{err}</div>}
        <button className="btn primary block" disabled={busy}>{busy ? 'Creazione account…' : 'Crea account 🎁'}</button>
      </form>
    </div>
  );
}
