import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '@/context/LanguajeContext';
import Navbar from '@/components/navbar'; // Asegúrate de que la ruta sea correcta
import './globals.css' // Asegúrate de importar tus estilos de Tailwind
import { Montserrat } from 'next/font/google' // O la fuente que prefieras para el diseño

const montserrat = Montserrat({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   <ClerkProvider>
      <LanguageProvider>
        <html lang="en">
          <body className="antialiased">
            {/* El Navbar aparece en todas las páginas automáticamente */}
            <Navbar />
            
            {/* El contenido de cada página se renderiza aquí */}
            <main>
              {children}
            </main>
          </body>
        </html>
      </LanguageProvider>
    </ClerkProvider>
  )
}