import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

let admin = null;

/** Client con SERVICE ROLE — usare SOLO in Route Handlers. */
export function adminClient() {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Configurazione server mancante');
  admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

export function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}
export function fail(message, status = 400) {
  return json({ error: message }, status);
}

/** Verifica il token Bearer e restituisce { user, profile }. */
export async function requireUser(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return { error: fail('Accesso richiesto', 401) };
  const sb = adminClient();
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return { error: fail('Sessione scaduta, accedi di nuovo', 401) };
  const { data: profile } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
  if (!profile) return { error: fail('Profilo non trovato', 404) };
  return { user: data.user, profile };
}

export async function requireAdmin(req) {
  const r = await requireUser(req);
  if (r.error) return r;
  if (!r.profile.is_admin) return { error: fail('Solo l’organizzatore può farlo', 403) };
  return r;
}

export async function activeEvent() {
  const { data } = await adminClient().from('events').select('*').eq('is_active', true).maybeSingle();
  return data;
}

export const FAMILY_DOMAIN = 'famiglia.secretsanta.app';
export function syntheticEmail(username) {
  return `${username}@${FAMILY_DOMAIN}`;
}
export function normalizeUsername(u) {
  return String(u || '').trim().toLowerCase();
}

/** Carica un avatar (già ritagliato 512x512 lato client) su Storage. */
export async function uploadAvatar(userId, file) {
  if (!file || typeof file === 'string' || !file.size) return null;
  if (file.size > 1024 * 1024) throw new Error('Foto troppo pesante (max 1 MB)');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Formato foto non valido');
  const sb = adminClient();
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage.from('avatars').upload(path, buf, { contentType: file.type, upsert: true });
  if (error) throw new Error('Caricamento foto non riuscito');
  return sb.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

/** Tutti gli abbinamenti dell'evento, decifrati. SOLO uso interno server. */
export async function loadPairs(eventId) {
  const { decrypt } = await import('./crypto');
  const { data } = await adminClient().from('draws').select('giver_id, receiver_enc, scratched_at').eq('event_id', eventId);
  return (data || []).map((d) => ({ giver: d.giver_id, receiver: decrypt(d.receiver_enc), scratched_at: d.scratched_at }));
}
