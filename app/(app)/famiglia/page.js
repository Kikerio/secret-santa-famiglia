'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getSupabase } from '@/lib/supabaseClient';
import { Avatar, Spinner } from '@/components/UI';
import { Ico } from '@/components/Icons';

export default function Family() {
  const { profile } = useAuth();
  const [rows, setRows] = useState(null);
  useEffect(() => {
    const sb = getSupabase();
    Promise.all([
      sb.from('profiles').select('id, display_name, avatar_url, participates').order('display_name'),
      sb.from('wishlist_items').select('owner_id, is_top'),
    ]).then(([{ data: p }, { data: w }]) => {
      const count = {}; const top = {};
      for (const i of w || []) { count[i.owner_id] = (count[i.owner_id] || 0) + 1; if (i.is_top) top[i.owner_id] = true; }
      setRows((p || []).filter((x) => x.id !== profile.id).map((x) => ({ ...x, n: count[x.id] || 0, top: top[x.id] })));
    });
  }, [profile.id]);

  return (
    <div className="stack">
      <div className="page-head"><div><h1>Famiglia</h1><p className="sub">Sbircia le liste e prenota un regalo 👀</p></div></div>
      {!rows ? <Spinner /> : rows.length === 0 ? (
        <div className="glass card muted">Nessun altro familiare registrato per ora. Condividi il link dell’app e il codice famiglia!</div>
      ) : (
        <ul className="stack cascade" style={{ listStyle: 'none', padding: 0, margin: 0, gap: 10 }}>
          {rows.map((m) => (
            <li key={m.id}>
              <Link href={`/famiglia/${m.id}`} className="glass member">
                <Avatar src={m.avatar_url} name={m.display_name} size={48} />
                <div className="grow">
                  <b>{m.display_name}</b>
                  <div className="small muted">{m.n === 0 ? 'Lista ancora vuota' : `${m.n} ${m.n === 1 ? 'desiderio' : 'desideri'}`}{m.top ? ' · ⭐ top' : ''}</div>
                </div>
                {m.n > 0 ? <span className="badge green">Pronta</span> : <span className="badge ice">In attesa</span>}
                <Ico.chevron className="chev" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
