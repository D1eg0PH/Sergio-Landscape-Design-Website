import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '@/context/LanguajeContext';
import Navbar from '@/components/navbar'; 
import './globals.css' 
import { Montserrat } from 'next/font/google' 
import { esES } from "@clerk/localizations"; // Ya funcionará tras el npm install

import ClerkLocalizationWrapper from '@/components/ClerkLocalizationWrapper';

const montserrat = Montserrat({ subsets: ['latin'] })



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <LanguageProvider>
          <ClerkLocalizationWrapper>
            <Navbar />
            <main>{children}</main>
          </ClerkLocalizationWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}