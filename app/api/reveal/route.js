export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, fail, requireUser, activeEvent, loadPairs } from '@/lib/server';

export async function GET(req) {
  const { error } = await requireUser(req);
  if (error) return error;
  const ev = await activeEvent();
  if (!ev || !ev.drawn_at) return json({ status: 'no-draw' });
  if (!ev.reveal_at || new Date(ev.reveal_at) > new Date())
    return json({ status: 'locked', reveal_at: ev.reveal_at });

  const pairs = await loadPairs(ev.id);
  const { data: people } = await adminClient().from('profiles').select('id, display_name, avatar_url');
  const P = Object.fromEntries((people || []).map((p) => [p.id, p]));
  // Ordina come catene/cicli: A → B → C → ...
  const next = new Map(pairs.map((p) => [p.giver, p.receiver]));
  const seen = new Set();
  const chains = [];
  for (const start of next.keys()) {
    if (seen.has(start)) continue;
    const chain = [];
    let cur = start;
    while (cur && !seen.has(cur)) { seen.add(cur); chain.push(P[cur] || { id: cur, display_name: '?' }); cur = next.get(cur); }
    chains.push(chain);
  }
  return json({ status: 'open', chains });
}
