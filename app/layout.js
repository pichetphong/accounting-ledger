import { DM_Serif_Display, Work_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import AuthProvider from '@/components/auth/AuthProvider';
import { DisplayCurrencyProvider } from '@/lib/displayCurrency';

const dmSerif = DM_Serif_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400'],
});

const workSans = Work_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const ibmMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata = {
  title: 'Accounting Ledger',
  description: 'Personal accounting ledger across THB, USD, and JPY.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${dmSerif.variable} ${workSans.variable} ${ibmMono.variable} font-sans min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <DisplayCurrencyProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-3xl mx-auto px-4 pb-32 pt-6 md:pb-12">
              {children}
            </main>
            <BottomNav />
          </DisplayCurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
