export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import crypto from 'node:crypto';
import { adminClient, json, fail, syntheticEmail, normalizeUsername, uploadAvatar } from '@/lib/server';

function safeEqual(a, b) {
  const x = Buffer.from(String(a).trim().toUpperCase());
  const y = Buffer.from(String(b).trim().toUpperCase());
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export async function POST(req) {
  let form;
  try { form = await req.formData(); } catch { return fail('Dati non validi'); }
  const username = normalizeUsername(form.get('username'));
  const displayName = String(form.get('display_name') || '').trim();
  const password = String(form.get('password') || '');
  const code = String(form.get('family_code') || '');
  const avatar = form.get('avatar');

  const familyCode = process.env.FAMILY_CODE;
  if (!familyCode) return fail('Registrazione non configurata (manca FAMILY_CODE)', 500);
  if (!safeEqual(code, familyCode)) return fail('Codice famiglia non corretto 🎄', 403);
  if (!/^[a-z0-9._-]{3,24}$/.test(username))
    return fail('Il nome utente deve avere 3–24 caratteri: lettere minuscole, numeri, punto o trattino.');
  if (displayName.length < 1 || displayName.length > 40) return fail('Inserisci un nome visualizzato (max 40 caratteri).');
  if (password.length < 6) return fail('La password deve avere almeno 6 caratteri.');

  const sb = adminClient();
  const { data: exists } = await sb.from('profiles').select('id').eq('username', username).maybeSingle();
  if (exists) return fail('Questo nome utente è già preso, scegline un altro.');

  const { data: created, error } = await sb.auth.admin.createUser({
    email: syntheticEmail(username),
    password,
    email_confirm: true,
    user_metadata: { username, display_name: displayName },
  });
  if (error || !created?.user) return fail('Non è stato possibile creare l’account. Il nome utente potrebbe essere già in uso.');

  const uid = created.user.id;
  const admins = (process.env.ADMIN_USERNAMES || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  let avatarUrl = null;
  try { avatarUrl = await uploadAvatar(uid, avatar); } catch {}

  const { error: pErr } = await sb.from('profiles').insert({
    id: uid, username, display_name: displayName, avatar_url: avatarUrl, is_admin: admins.includes(username),
  });
  if (pErr) {
    await sb.auth.admin.deleteUser(uid);
    return fail('Registrazione non completata, riprova.');
  }
  return json({ ok: true, email: syntheticEmail(username) });
}
