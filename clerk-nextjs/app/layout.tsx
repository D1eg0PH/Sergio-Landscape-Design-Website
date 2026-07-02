import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '@/context/LanguajeContext';
import Navbar from '@/components/navbar'; 
import './globals.css' 
import { Montserrat } from 'next/font/google' 
import { esES } from "@clerk/localizations"; 
import Footer from '@/components/Footer'; 
import ClerkLocalizationWrapper from '@/components/ClerkLocalizationWrapper';
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next"


const montserrat = Montserrat({ subsets: ['latin'] })

// --- AQUÍ LA CORRECCIÓN CLAVE ---
export const metadata: Metadata = {
  title: "Sergio Landscape Design LLC",
  description: "Professional gardening and landscaping services",
  // Esta línea reemplaza la etiqueta <meta> que tenías suelta:
  appleWebApp: {
    title: "Sergio Landscape",
  },
  // Esto asegura que el navegador encuentre los iconos generados
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${montserrat.className} antialiased`}>
        
        <LanguageProvider>
          <ClerkLocalizationWrapper>
            <Navbar />
            <main className="min-h-screen">{children}</main> 
            <Footer />
          </ClerkLocalizationWrapper>
        </LanguageProvider>

        <Analytics />
      </body>
    </html>
  );
}