import 'server-only';
import webpush from 'web-push';
import { adminClient } from './server';

let configured = false;
function setup() {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

/**
 * Invia una notifica a uno o più utenti.
 * PRIVACY: il payload non deve MAI contenere nomi di abbinamenti.
 */
export async function sendPush(userIds, { title, body, url = '/home', tag }) {
  if (!setup()) return { sent: 0 };
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  if (!ids.length) return { sent: 0 };
  const sb = adminClient();
  const { data: subs } = await sb.from('push_subscriptions').select('*').in('user_id', ids);
  let sent = 0;
  const payload = JSON.stringify({ title, body, url, tag });
  await Promise.all(
    (subs || []).map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
          { TTL: 60 * 60 * 24 }
        );
        sent++;
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) {
          await sb.from('push_subscriptions').delete().eq('id', s.id);
        }
      }
    })
  );
  return { sent };
}

/** Invia solo se non già inviata (dedup tramite notification_log). */
export async function sendOnce(userId, kind, ref, msg) {
  const sb = adminClient();
  const { error } = await sb.from('notification_log').insert({ user_id: userId, kind, ref });
  if (error) return { sent: 0, skipped: true };
  return sendPush(userId, msg);
}
