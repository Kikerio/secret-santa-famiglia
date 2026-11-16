export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, fail, requireAdmin, activeEvent } from '@/lib/server';
import { encrypt, decrypt } from '@/lib/crypto';
import { excludedPairs } from '@/lib/relations';
import { runDraw } from '@/lib/draw';
import { sendPush } from '@/lib/push';

export async function POST(req) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const sb = adminClient();
  const ev = await activeEvent();
  if (!ev) return fail('Configura prima l’evento');
  if (ev.reveal_at && new Date(ev.reveal_at) <= new Date()) return fail('Lo svelamento è già avvenuto: non si può ripetere l’estrazione.');

  const [{ data: people }, { data: rels }] = await Promise.all([
    sb.from('profiles').select('id, display_name').eq('participates', true),
    sb.from('relationships').select('user_id, other_id, rel_type'),
  ]);
  const { set } = excludedPairs(rels || [], ev.exclusion_types || []);

  // Abbinamenti dell'anno precedente
  const previous = new Set();
  const { data: prevEv } = await sb.from('events').select('id').lt('year', ev.year).order('year', { ascending: false }).limit(1).maybeSingle();
  if (prevEv) {
    const { data: prev } = await sb.from('draws').select('giver_id, receiver_enc').eq('event_id', prevEv.id);
    for (const p of prev || []) {
      try { previous.add(p.giver_id + '>' + decrypt(p.receiver_enc)); } catch {}
    }
  }

  const res = runDraw((people || []).map((p) => ({ id: p.id, name: p.display_name })), set, previous);
  if (!res.ok) return fail(res.error, 422);

  // Ripetizione: cancella estrazione e chat precedenti di quest'anno
  await sb.from('messages').delete().eq('event_id', ev.id);
  await sb.from('draws').delete().eq('event_id', ev.id);
  const rows = res.pairs.map(([giver, receiver]) => ({ event_id: ev.id, giver_id: giver, receiver_enc: encrypt(receiver) }));
  const { error: e } = await sb.from('draws').insert(rows);
  if (e) return fail('Salvataggio estrazione non riuscito');
  await sb.from('events').update({ drawn_at: new Date().toISOString() }).eq('id', ev.id);

  await sendPush(res.pairs.map(([g]) => g), {
    title: 'Secret Santa 🎁',
    body: 'L’estrazione del Secret Santa è pronta! Gratta la tua card per scoprire chi hai pescato',
    url: '/home', tag: 'draw',
  }).catch(() => {});

  // Nessun abbinamento nella risposta
  return json({ ok: true, count: rows.length, avoidedPrevious: res.avoidedPrevious });
}
