export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, fail, activeEvent } from '@/lib/server';
import { sendOnce } from '@/lib/push';

const DAY = 86400000;

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  if (!secret || auth !== 'Bearer ' + secret) return fail('Non autorizzato', 401);

  const sb = adminClient();
  const ev = await activeEvent();
  const out = { reserved: 0, emptyWishlist: 0, dayBefore: 0 };
  const now = Date.now();

  // 3) Promemoria: opzionato da 3+ giorni e non acquistato
  const { data: claims } = await sb.from('claims').select('item_id, claimer_id, created_at')
    .eq('status', 'reserved').lt('created_at', new Date(now - 3 * DAY).toISOString());
  for (const c of claims || []) {
    const r = await sendOnce(c.claimer_id, 'claim-reminder', c.item_id, {
      title: 'Promemoria regalo 🎄',
      body: 'Hai opzionato un regalo qualche giorno fa: ricordati di segnarlo come acquistato quando lo prendi!',
      url: '/famiglia', tag: 'claim-reminder',
    });
    out.reserved += r.sent || 0;
  }

  if (ev?.exchange_at) {
    const diff = new Date(ev.exchange_at).getTime() - now;
    const { data: people } = await sb.from('profiles').select('id').eq('participates', true);
    const ids = (people || []).map((p) => p.id);

    // 4) 7 giorni prima: wishlist vuota
    if (diff > 6 * DAY && diff <= 8 * DAY) {
      const { data: items } = await sb.from('wishlist_items').select('owner_id');
      const has = new Set((items || []).map((i) => i.owner_id));
      for (const id of ids.filter((i) => !has.has(i))) {
        const r = await sendOnce(id, 'empty-wishlist', ev.id, {
          title: 'La tua wishlist è vuota 📝',
          body: 'Manca una settimana allo scambio! Aggiungi qualche desiderio per aiutare il tuo Babbo Natale Segreto.',
          url: '/desideri', tag: 'wishlist',
        });
        out.emptyWishlist += r.sent || 0;
      }
    }
    // 5) Il giorno prima
    if (diff > 0 && diff <= 1.5 * DAY) {
      for (const id of ids) {
        const r = await sendOnce(id, 'day-before', ev.id, {
          title: 'Domani è il grande giorno! 🎅',
          body: 'Manca un giorno allo scambio dei regali. Hai incartato tutto?',
          url: '/home', tag: 'countdown',
        });
        out.dayBefore += r.sent || 0;
      }
    }
  }
  return json({ ok: true, ...out });
}
