'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ico } from './Icons';

const TABS = [
  { href: '/home', label: 'Home', icon: 'home' },
  { href: '/desideri', label: 'Desideri', icon: 'gift' },
  { href: '/famiglia', label: 'Famiglia', icon: 'family' },
  { href: '/santa-mail', label: 'Santa Mail', icon: 'mail' },
  { href: '/profilo', label: 'Profilo', icon: 'user' },
];

export default function TabBar() {
  const path = usePathname();
  return (
    <nav className="tabbar" aria-label="Navigazione principale">
      {TABS.map((t) => {
        const active = path === t.href || path.startsWith(t.href + '/');
        const I = Ico[t.icon];
        return (
          <Link key={t.href} href={t.href} className="tab" aria-current={active ? 'page' : undefined}>
            <I strokeWidth={active ? 2.4 : 2} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
