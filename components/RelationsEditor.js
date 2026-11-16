'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabaseClient';
import { useAuth } from './AuthProvider';
import { Avatar, Spinner, useToast } from './UI';
import { REL_TYPES, REL_LABEL } from '@/lib/relations';

/** "Chi è per te?" — associa un legame a ogni familiare + chi ti ha indicato. */
export default function RelationsEditor() {
  const { profile } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState(null);
  const [mine, setMine] = useState({});
  const [byOthers, setByOthers] = useState([]);

  useEffect(() => {
    const sb = getSupabase();
    (async () => {
      const [{ data: m }, { data: r }] = await Promise.all([
        sb.from('profiles').select('id, display_name, avatar_url').neq('id', profile.id).order('display_name'),
        sb.from('relationships').select('*'),
      ]);
      setMembers(m || []);
      const own = {}; const others = [];
      for (const x of r || []) {
        if (x.user_id === profile.id) own[x.other_id] = x.rel_type;
        else if (x.other_id === profile.id) others.push(x);
      }
      setMine(own); setByOthers(others);
    })();
  }, [profile.id]);

  async function setRel(otherId, type) {
    const sb = getSupabase();
    const prev = mine[otherId];
    setMine((s) => ({ ...s, [otherId]: type || undefined }));
    const { error } = type
      ? await sb.from('relationships').upsert({ user_id: profile.id, other_id: otherId, rel_type: type })
      : await sb.from('relationships').delete().eq('user_id', profile.id).eq('other_id', otherId);
    if (error) { setMine((s) => ({ ...s, [otherId]: prev })); toast('Non salvato, riprova'); }
    else toast('Salvato ✓');
  }

  if (!members) return <Spinner />;
  const name = Object.fromEntries(members.map((m) => [m.id, m.display_name]));

  return (
    <div className="stack">
      {members.length === 0 && <div className="glass card small muted">Ancora nessun altro familiare registrato. Torna qui quando arrivano gli altri!</div>}
      <div className="glass card sm list">
        {members.map((m) => (
          <div className="list-row" key={m.id}>
            <Avatar src={m.avatar_url} name={m.display_name} size={44} />
            <label className="grow" htmlFor={`rel-${m.id}`} style={{ fontWeight: 650 }}>{m.display_name}</label>
            <select id={`rel-${m.id}`} className="select" style={{ width: 'auto', maxWidth: '52%', minHeight: 44 }}
              value={mine[m.id] || ''} onChange={(e) => setRel(m.id, e.target.value)}>
              <option value="">— Scegli —</option>
              {REL_TYPES.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
            </select>
          </div>
        ))}
      </div>
      {byOthers.length > 0 && (
        <div className="glass card sm">
          <h3 style={{ marginBottom: 6 }}>Ti hanno indicato</h3>
          <p className="small muted">
            {byOthers.map((r, i) => (
              <span key={r.user_id}>{i > 0 && ', '}<b style={{ color: 'var(--ink)' }}>{name[r.user_id] || 'Qualcuno'}</b> ({REL_LABEL[r.rel_type]?.toLowerCase()})</span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
