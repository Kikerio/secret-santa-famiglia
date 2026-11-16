export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, requireUser, activeEvent } from '@/lib/server';

export async function POST(req) {
  const { profile, error } = await requireUser(req);
  if (error) return error;
  const ev = await activeEvent();
  if (!ev) return json({ ok: false });
  await adminClient().from('draws').update({ scratched_at: new Date().toISOString() })
    .eq('event_id', ev.id).eq('giver_id', profile.id).is('scratched_at', null);
  return json({ ok: true });
}
