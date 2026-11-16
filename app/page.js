'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Spinner } from '@/components/UI';

export default function Index() {
  const { ready, session } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (ready) router.replace(session ? '/home' : '/login');
  }, [ready, session, router]);
  return <main className="screen no-tabs"><Spinner /></main>;
}
