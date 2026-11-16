'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import { GiftHero } from '@/components/Illustrations';
import { PasswordInput } from '@/components/UI';

const DOMAIN = 'famiglia.secretsanta.app';

export default function Login() {
  const router = useRouter();
  const { session, ready } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (ready && session) router.replace('/home'); }, [ready, session, router]);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    const u = username.trim().toLowerCase();
    const { error } = await getSupabase().auth.signInWithPassword({ email: `${u}@${DOMAIN}`, password });
    setBusy(false);
    if (error) setErr('Nome utente o password non corretti. Se l’hai dimenticata, chiedi all’organizzatore 🎅');
    else router.replace('/home');
  }

  return (
    <div className="stack cascade">
      <div className="hero">
        <GiftHero />
        <h1>Secret Santa</h1>
        <p>Bentornato in famiglia! Accedi per scoprire chi hai pescato 🎄</p>
      </div>
      <form className="glass card stack" onSubmit={submit}>
        <div className="field">
          <label htmlFor="u">Nome utente</label>
          <input id="u" className="input" value={username} onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="none" autoCorrect="off" autoComplete="username" spellCheck={false} required placeholder="es. carla" />
        </div>
        <div className="field">
          <label htmlFor="p">Password</label>
          <PasswordInput id="p" value={password} onChange={setPassword} />
        </div>
        {err && <div className="error-box" role="alert">{err}</div>}
        <button className="btn primary block" disabled={busy}>{busy ? 'Accesso…' : 'Entra'}</button>
      </form>
      <div className="center row" style={{ flexDirection: 'column', gap: 4 }}>
        <span className="muted small">Prima volta qui?</span>
        <Link href="/registrati" className="btn ghost block">Crea il tuo account</Link>
        <Link href="/installa" className="link-btn">Come installare l’app su iPhone</Link>
      </div>
    </div>
  );
}
