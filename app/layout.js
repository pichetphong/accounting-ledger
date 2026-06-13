import { Archivo_Black, Work_Sans, Space_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import AuthProvider from '@/components/auth/AuthProvider';
import { DisplayCurrencyProvider } from '@/lib/displayCurrency';
import { ThemeProvider, themeInitScript } from '@/lib/theme';

const archivoBlack = Archivo_Black({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400'],
});

const workSans = Work_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const spaceMono = Space_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata = {
  title: 'Accounting Ledger',
  description: 'Personal accounting ledger across THB, USD, and JPY.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${archivoBlack.variable} ${workSans.variable} ${spaceMono.variable} font-sans min-h-screen flex flex-col`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AuthProvider>
          <DisplayCurrencyProvider>
            <ThemeProvider>
              <Navbar />
              <main className="flex-1 w-full max-w-5xl mx-auto px-4 pb-28 pt-6 md:pb-12">
                {children}
              </main>
              <BottomNav />
            </ThemeProvider>
          </DisplayCurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
