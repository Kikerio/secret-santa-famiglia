export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, fail, requireAdmin, activeEvent } from '@/lib/server';
import { REL_TYPES } from '@/lib/relations';

export async function POST(req) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const b = await req.json().catch(() => ({}));
  const patch = {};
  if (b.name !== undefined) patch.name = String(b.name).slice(0, 80) || 'Secret Santa di Famiglia';
  if (b.year !== undefined) patch.year = parseInt(b.year, 10);
  if (b.budget_chf !== undefined) {
    const n = Number(b.budget_chf);
    if (!(n > 0 && n < 10000)) return fail('Budget non valido');
    patch.budget_chf = n;
  }
  if (b.exchange_at !== undefined) patch.exchange_at = b.exchange_at || null;
  if (b.location !== undefined) patch.location = String(b.location).slice(0, 160);
  if (b.reveal_at !== undefined) patch.reveal_at = b.reveal_at || null;
  if (Array.isArray(b.exclusion_types)) {
    const valid = REL_TYPES.map((r) => r.id);
    patch.exclusion_types = b.exclusion_types.filter((t) => valid.includes(t));
  }
  const sb = adminClient();
  const ev = await activeEvent();
  // Nuovo anno → nuovo evento (lo storico resta per evitare ripetizioni)
  if (ev && patch.year && patch.year !== ev.year) {
    await sb.from('events').update({ is_active: false }).eq('id', ev.id);
    const { data, error: e } = await sb.from('events').upsert({ ...ev, id: undefined, created_at: undefined, drawn_at: null, ...patch, is_active: true }, { onConflict: 'year' }).select().single();
    if (e) return fail('Impossibile creare il nuovo anno');
    return json({ ok: true, event: data });
  }
  if (!ev) {
    const { data, error: e } = await sb.from('events').insert({ year: new Date().getFullYear(), ...patch, is_active: true }).select().single();
    if (e) return fail('Impossibile creare l’evento');
    return json({ ok: true, event: data });
  }
  const { data, error: e } = await sb.from('events').update(patch).eq('id', ev.id).select().single();
  if (e) return fail('Salvataggio non riuscito');
  return json({ ok: true, event: data });
}
