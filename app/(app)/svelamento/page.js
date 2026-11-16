'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/supabaseClient';
import { Avatar, Spinner } from '@/components/UI';
import { Ico } from '@/components/Icons';
import { SnowGlobe, GiftHero } from '@/components/Illustrations';
import { celebrate } from '@/lib/celebrate';
import { dateLong } from '@/lib/format';

export default function Reveal() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api('/api/reveal').then((d) => { setData(d); if (d.status === 'open') setTimeout(celebrate, 300); }).catch(() => setData({ status: 'error' }));
  }, []);
  return (
    <div className="stack">
      <div className="row">
        <Link href="/home" className="btn ghost icon" aria-label="Torna alla Home"><Ico.back width={22} height={22} /></Link>
        <h1 style={{ fontSize: 25 }}>Il Grande Svelamento</h1>
      </div>
      {!data ? <Spinner /> : data.status === 'open' ? (
        <>
          <div className="hero" style={{ margin: '0 0 6px' }}><GiftHero style={{ width: 120, height: 120 }} /><p>Ecco chi ha pescato chi! 🎉</p></div>
          {data.chains.map((chain, ci) => (
            <ol key={ci} className="glass card chain cascade" aria-label={`Catena ${ci + 1}`} style={{ listStyle: 'none', margin: 0 }}>
              {[...chain, chain[0]].map((p, i) => (
                <li key={i} style={{ width: '100%' }}>
                  {i > 0 && <div className="chain-arrow center row" aria-hidden="true">↓ 🎁</div>}
                  <div className="chain-node">
                    <Avatar src={p.avatar_url} name={p.display_name} size={46} />
                    <b className="grow">{p.display_name}</b>
                    {i < chain.length && <span className="sr-only">fa il regalo a {chain[(i + 1) % chain.length].display_name}</span>}
                  </div>
                </li>
              ))}
            </ol>
          ))}
        </>
      ) : (
        <div className="glass card empty">
          <SnowGlobe style={{ width: 120, height: 120 }} />
          <h2>{data.status === 'locked' ? 'Ancora un po’ di pazienza' : 'Nessuna estrazione'}</h2>
          <p className="small muted">{data.status === 'locked' ? `Lo svelamento si apre ${dateLong(data.reveal_at)}.` : 'L’estrazione non è ancora stata fatta.'}</p>
        </div>
      )}
    </div>
  );
}
