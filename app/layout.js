import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ToastProvider } from '@/components/UI';
import Snow from '@/components/Snow';
import SWRegister from '@/components/SWRegister';

export const metadata = {
  title: 'Secret Santa di Famiglia',
  description: 'Il Secret Santa della nostra famiglia: estrazione segreta, wishlist e Santa Mail.',
  manifest: '/manifest.json',
  applicationName: 'Secret Santa',
  appleWebApp: { capable: true, title: 'Secret Santa', statusBarStyle: 'default' },
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F7F3EC',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        <Snow />
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
        <SWRegister />
      </body>
    </html>
  );
}
