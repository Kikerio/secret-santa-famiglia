export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, fail, requireAdmin } from '@/lib/server';

export async function POST(req) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { user_id, password } = await req.json().catch(() => ({}));
  if (!user_id) return fail('Utente mancante');
  if (!password || String(password).length < 6) return fail('La nuova password deve avere almeno 6 caratteri');
  const { error: e } = await adminClient().auth.admin.updateUserById(user_id, { password: String(password) });
  if (e) return fail('Reset non riuscito');
  return json({ ok: true });
}
