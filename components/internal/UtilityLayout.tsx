import { Archivo, Gochi_Hand, Inter } from 'next/font/google';
import { PreferenceProvider } from '@/components/experience/PreferenceProvider';
import './legacy.css';

const archivo = Archivo({ variable: '--font-archivo', subsets: ['latin'] });
const gochiHand = Gochi_Hand({ variable: '--font-gochi-hand', weight: '400', subsets: ['latin'] });
const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });

// Keep existing management and order tools usable during the public redesign.
export default function UtilityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${archivo.variable} ${gochiHand.variable} ${inter.variable} min-h-screen font-sans antialiased`}>
      <PreferenceProvider>{children}</PreferenceProvider>
    </div>
  );
}
