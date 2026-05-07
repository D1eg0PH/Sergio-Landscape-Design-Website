import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '@/context/LanguajeContext';
import Navbar from '@/components/navbar'; 
import './globals.css' 
import { Montserrat } from 'next/font/google' 
import { esES } from "@clerk/localizations"; // Ya funcionará tras el npm install
import Footer from '@/components/Footer'; // Importa el nuevo componente

import ClerkLocalizationWrapper from '@/components/ClerkLocalizationWrapper';


import type { Metadata } from "next";

const montserrat = Montserrat({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: "Sergio Landscape Design LLC", // Esto es lo que sale en la pestaña
  description: "Professional gardening and landscaping services",
  icons: {
      icon: [
        {
          url: "/icon.png?v=2", // Agregamos ?v=2 para romper la caché
          href: "/icon.png?v=2",
        },
      ],
      shortcut: "/icon.png?v=2",
      apple: "/icon.png?v=2",
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
            <Footer /> {/* Ponlo aquí fuera del main */}
          </ClerkLocalizationWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}