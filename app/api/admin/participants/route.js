export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, fail, requireAdmin } from '@/lib/server';

export async function POST(req) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { user_id, participates } = await req.json().catch(() => ({}));
  if (!user_id) return fail('Utente mancante');
  const { error: e } = await adminClient().from('profiles').update({ participates: !!participates }).eq('id', user_id);
  if (e) return fail('Salvataggio non riuscito');
  return json({ ok: true });
}
