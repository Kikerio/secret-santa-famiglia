export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, fail, requireUser, activeEvent, loadPairs } from '@/lib/server';
import { sendPush } from '@/lib/push';

export async function POST(req) {
  const { profile, error } = await requireUser(req);
  if (error) return error;
  const { box, body } = await req.json().catch(() => ({}));
  const text = String(body || '').trim().slice(0, 1000);
  if (!text) return fail('Scrivi un messaggio');
  if (!['giftee', 'santa'].includes(box)) return fail('Conversazione non valida');
  const ev = await activeEvent();
  if (!ev?.drawn_at) return fail('L’estrazione non è ancora stata fatta');

  const pairs = await loadPairs(ev.id);
  let other = null;
  if (box === 'giftee') other = pairs.find((p) => p.giver === profile.id)?.receiver;
  else other = pairs.find((p) => p.receiver === profile.id)?.giver;
  if (!other) return fail('Non hai ancora questa conversazione');

  // Io scrivo come "santa" se sono nella chat con chi ho pescato
  const myRole = box === 'giftee' ? 'santa' : 'recipient';
  const otherBox = box === 'giftee' ? 'santa' : 'giftee';
  const { data, error: e } = await adminClient().from('messages').insert([
    { event_id: ev.id, owner_id: profile.id, box, sender_role: myRole, body: text },
    { event_id: ev.id, owner_id: other, box: otherBox, sender_role: myRole, body: text },
  ]).select('id, box, sender_role, body, created_at, owner_id');
  if (e) return fail('Invio non riuscito');

  // Notifica: mai nomi nel payload
  sendPush(other, {
    title: 'Santa Mail 💌',
    body: myRole === 'santa' ? 'Il tuo Babbo Natale Segreto ti ha scritto!' : 'Hai ricevuto una risposta in Santa Mail.',
    url: '/santa-mail?tab=' + otherBox,
    tag: 'santa-mail',
  }).catch(() => {});

  const mine = data.find((m) => m.owner_id === profile.id);
  return json({ ok: true, message: { id: mine.id, box: mine.box, sender_role: mine.sender_role, body: mine.body, created_at: mine.created_at } });
}
