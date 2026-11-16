'use client';
import { createClient } from '@supabase/supabase-js';

let client = null;

/** Client Supabase lato browser (chiave anon pubblica, protetta dalle RLS). */
export function getSupabase() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Variabili NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY mancanti');
  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'ss-auth' },
  });
  return client;
}

/** fetch verso le API interne con il token della sessione. */
export async function api(path, { method = 'GET', body, form } = {}) {
  const sb = getSupabase();
  const { data } = await sb.auth.getSession();
  const token = data?.session?.access_token;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(path, { method, headers, body: payload, cache: 'no-store' });
  let json = {};
  try { json = await res.json(); } catch {}
  if (!res.ok) throw new Error(json.error || 'Qualcosa è andato storto, riprova.');
  return json;
}
