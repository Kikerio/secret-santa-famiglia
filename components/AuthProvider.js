'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabaseClient';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [event, setEvent] = useState(null);
  const [ready, setReady] = useState(false);
  const [configError, setConfigError] = useState(null);

  const load = useCallback(async (s) => {
    const sb = getSupabase();
    if (!s) { setProfile(null); setEvent(null); return; }
    const [{ data: p }, { data: e }] = await Promise.all([
      sb.from('profiles').select('*').eq('id', s.user.id).maybeSingle(),
      sb.from('events').select('*').eq('is_active', true).maybeSingle(),
    ]);
    setProfile(p || null);
    setEvent(e || null);
  }, []);

  useEffect(() => {
    let sb;
    try { sb = getSupabase(); } catch (e) { setConfigError(e.message); setReady(true); return; }
    sb.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await load(data.session);
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      if (_evt === 'SIGNED_IN' || _evt === 'SIGNED_OUT' || _evt === 'USER_UPDATED') load(s);
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const refresh = useCallback(() => load(session), [load, session]);
  const signOut = useCallback(async () => { await getSupabase().auth.signOut(); }, []);

  return (
    <Ctx.Provider value={{ session, user: session?.user || null, profile, setProfile, event, setEvent, ready, refresh, signOut, configError }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() { return useContext(Ctx); }
