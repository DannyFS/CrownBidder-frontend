import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { SiteProvider } from '@/contexts/SiteContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SocketProvider } from '@/contexts/SocketContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Crown Bidder - Multi-Tenant Auction Platform',
  description: 'Professional live auction platform for auctioneers and organizations',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider>
            <SiteProvider>
              <ThemeProvider>
                {children}
              </ThemeProvider>
            </SiteProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
