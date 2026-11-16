export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, fail, requireUser } from '@/lib/server';
import { sendPush } from '@/lib/push';

export async function POST(req) {
  const { profile, error } = await requireUser(req);
  if (error) return error;
  const { subscription } = await req.json().catch(() => ({}));
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;
  if (!endpoint || !p256dh || !auth || !/^https:\/\//.test(endpoint)) return fail('Iscrizione non valida');
  const { error: e } = await adminClient().from('push_subscriptions')
    .upsert({ user_id: profile.id, endpoint, p256dh, auth }, { onConflict: 'endpoint' });
  if (e) return fail('Salvataggio non riuscito');
  const r = await sendPush(profile.id, {
    title: 'Notifiche attive 🔔',
    body: 'Perfetto! Da ora ti avviseremo per estrazione, Santa Mail e promemoria.',
    url: '/profilo', tag: 'test',
  });
  return json({ ok: true, sent: r.sent });
}

export async function DELETE(req) {
  const { profile, error } = await requireUser(req);
  if (error) return error;
  const { endpoint } = await req.json().catch(() => ({}));
  if (endpoint) await adminClient().from('push_subscriptions').delete().eq('user_id', profile.id).eq('endpoint', endpoint);
  return json({ ok: true });
}
