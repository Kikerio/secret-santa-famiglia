export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, fail, requireAdmin } from '@/lib/server';

export async function POST(req) {
  const { profile, error } = await requireAdmin(req);
  if (error) return error;
  const { user_id, is_admin } = await req.json().catch(() => ({}));
  if (!user_id) return fail('Utente mancante');
  if (user_id === profile.id && !is_admin) return fail('Non puoi togliere a te stesso il ruolo di organizzatore');
  const { error: e } = await adminClient().from('profiles').update({ is_admin: !!is_admin }).eq('id', user_id);
  if (e) return fail('Salvataggio non riuscito');
  return json({ ok: true });
}
