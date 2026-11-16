'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import RelationsEditor from '@/components/RelationsEditor';
import { Stocking } from '@/components/Illustrations';
import { api } from '@/lib/supabaseClient';

export default function Welcome() {
  const { profile, setProfile } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function finish() {
    setBusy(true);
    const fd = new FormData();
    fd.set('onboarded', 'true');
    try { const r = await api('/api/profile', { method: 'POST', form: fd }); setProfile(r.profile); } catch {}
    router.replace('/home');
  }

  return (
    <div className="stack cascade">
      <div className="steps" aria-hidden="true"><i className="on" /><i className="on" /><i /></div>
      <div className="hero" style={{ marginBottom: 4 }}>
        <Stocking style={{ width: 130, height: 130 }} />
        <h1>Ciao {profile.display_name}! 👋</h1>
        <p>Dicci chi è per te ogni familiare. Così evitiamo di farti pescare il partner o i genitori.</p>
      </div>
      <RelationsEditor />
      <p className="tiny center">Puoi cambiarlo quando vuoi dal tuo Profilo.</p>
      <button className="btn primary block" onClick={finish} disabled={busy}>Fatto, andiamo! 🎄</button>
      <button className="link-btn" onClick={finish}>Lo faccio più tardi</button>
    </div>
  );
}
