export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, requireUser, activeEvent } from '@/lib/server';
import { decrypt } from '@/lib/crypto';

export async function GET(req) {
  const { profile, error } = await requireUser(req);
  if (error) return error;
  const ev = await activeEvent();
  if (!ev) return json({ status: 'no-event' });
  const sb = adminClient();
  const { data: d } = await sb.from('draws').select('receiver_enc, scratched_at').eq('event_id', ev.id).eq('giver_id', profile.id).maybeSingle();
  if (!d) return json({ status: ev.drawn_at ? 'not-participating' : 'pending' });
  const rid = decrypt(d.receiver_enc);
  const { data: r } = await sb.from('profiles').select('id, display_name, avatar_url').eq('id', rid).single();
  return json({ status: 'ready', scratched: !!d.scratched_at, receiver: r });
}
