'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import TabBar from '@/components/TabBar';
import { Spinner } from '@/components/UI';

export default function AppLayout({ children }) {
  const { ready, session, profile, configError } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace('/login');
    else if (profile && !profile.onboarded && path !== '/benvenuto') router.replace('/benvenuto');
  }, [ready, session, profile, path, router]);

  if (configError) return <main className="screen no-tabs"><div className="error-box">{configError}</div></main>;
  if (!ready || !session || !profile) return <main className="screen no-tabs"><Spinner /></main>;
  const hideTabs = path === '/benvenuto';
  return (
    <>
      <main className={`screen ${hideTabs ? 'no-tabs' : ''}`} id="main">{children}</main>
      {!hideTabs && <TabBar />}
    </>
  );
}
