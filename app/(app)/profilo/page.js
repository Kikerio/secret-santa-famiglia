'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { api, getSupabase } from '@/lib/supabaseClient';
import AvatarPicker from '@/components/AvatarPicker';
import RelationsEditor from '@/components/RelationsEditor';
import NotificationsCard from '@/components/NotificationsCard';
import { PasswordInput, useToast } from '@/components/UI';
import { GlassIcon, Ico } from '@/components/Icons';

export default function Profile() {
  const { profile, setProfile, signOut } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(profile.display_name);
  const [avatar, setAvatar] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('');

  async function saveProfile(e) {
    e.preventDefault(); setBusy(true);
    try {
      const fd = new FormData();
      fd.set('display_name', name.trim());
      if (avatar) fd.set('avatar', avatar, 'avatar.jpg');
      const r = await api('/api/profile', { method: 'POST', form: fd });
      setProfile(r.profile); setAvatar(null);
      toast('Profilo aggiornato ✓');
    } catch (err) { toast(err.message); } finally { setBusy(false); }
  }
  async function changePw(e) {
    e.preventDefault();
    if (pw.length < 6) return toast('Almeno 6 caratteri');
    if (pw !== pw2) return toast('Le password non coincidono');
    const { error } = await getSupabase().auth.updateUser({ password: pw });
    if (error) toast('Cambio password non riuscito'); else { toast('Password aggiornata 🔐'); setPw(''); setPw2(''); }
  }

  return (
    <div className="stack">
      <div className="page-head"><div><h1>Profilo</h1><p className="sub">@{profile.username}</p></div></div>

      <form className="glass card stack" onSubmit={saveProfile}>
        <AvatarPicker value={profile.avatar_url} onChange={setAvatar} label="Cambia foto" />
        <div className="field">
          <label htmlFor="dn">Nome visualizzato</label>
          <input id="dn" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required />
        </div>
        <button className="btn primary block" disabled={busy || (!avatar && name.trim() === profile.display_name)}>{busy ? 'Salvataggio…' : 'Salva profilo'}</button>
      </form>

      <section className="stack" aria-labelledby="rel-h">
        <h2 id="rel-h" style={{ margin: '8px 4px 0' }}>Chi è per te?</h2>
        <RelationsEditor />
      </section>

      <NotificationsCard />

      <form className="glass card stack" onSubmit={changePw}>
        <div className="row"><GlassIcon name="lock" tone="ink" /><h3 className="grow">Cambia password</h3></div>
        <div className="field"><label htmlFor="np">Nuova password</label><PasswordInput id="np" value={pw} onChange={setPw} autoComplete="new-password" /></div>
        <div className="field"><label htmlFor="np2">Ripeti</label><PasswordInput id="np2" value={pw2} onChange={setPw2} autoComplete="new-password" /></div>
        <button className="btn ghost block">Aggiorna password</button>
      </form>

      <nav className="glass card sm list" aria-label="Altro">
        <Link href="/installa" className="list-row"><GlassIcon name="phone" tone="ice" size={36} /><span className="grow">Installa su iPhone</span><Ico.chevron className="chev" /></Link>
        {profile.is_admin && <Link href="/admin" className="list-row"><GlassIcon name="shield" tone="red" size={36} /><span className="grow">Pannello organizzatore</span><Ico.chevron className="chev" /></Link>}
        <button className="list-row" onClick={async () => { await signOut(); router.replace('/login'); }}>
          <GlassIcon name="logout" tone="ink" size={36} /><span className="grow">Esci</span>
        </button>
      </nav>
      <p className="tiny center">{profile.participates ? '🎄 Partecipi all’estrazione di quest’anno' : 'Quest’anno non partecipi all’estrazione'}</p>
    </div>
  );
}
