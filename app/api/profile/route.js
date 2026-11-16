export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { adminClient, json, fail, requireUser, uploadAvatar } from '@/lib/server';

export async function POST(req) {
  const { profile, error } = await requireUser(req);
  if (error) return error;
  const form = await req.formData();
  const patch = {};
  const dn = form.get('display_name');
  if (dn !== null) {
    const v = String(dn).trim();
    if (v.length < 1 || v.length > 40) return fail('Nome visualizzato non valido');
    patch.display_name = v;
  }
  if (form.get('onboarded') === 'true') patch.onboarded = true;
  try {
    const url = await uploadAvatar(profile.id, form.get('avatar'));
    if (url) patch.avatar_url = url;
  } catch (e) { return fail(e.message); }
  if (!Object.keys(patch).length) return json({ ok: true, profile });
  const { data, error: uErr } = await adminClient().from('profiles').update(patch).eq('id', profile.id).select().single();
  if (uErr) return fail('Salvataggio non riuscito');
  return json({ ok: true, profile: data });
}
