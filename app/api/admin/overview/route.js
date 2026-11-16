export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, requireAdmin, activeEvent } from '@/lib/server';
import { excludedPairs } from '@/lib/relations';

export async function GET(req) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const sb = adminClient();
  const ev = await activeEvent();
  const [{ data: members }, { data: rels }] = await Promise.all([
    sb.from('profiles').select('id, username, display_name, avatar_url, participates, is_admin').order('display_name'),
    sb.from('relationships').select('user_id, other_id, rel_type'),
  ]);
  const { list } = excludedPairs(rels || [], ev?.exclusion_types || []);
  let drawCount = 0, scratched = 0;
  if (ev) {
    const { data: d } = await sb.from('draws').select('scratched_at').eq('event_id', ev.id);
    drawCount = d?.length || 0;
    scratched = (d || []).filter((x) => x.scratched_at).length;
  }
  // NB: gli abbinamenti NON vengono mai restituiti qui.
  return json({ event: ev, members, exclusions: list, drawCount, scratched });
}
