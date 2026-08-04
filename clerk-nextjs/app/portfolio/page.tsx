'use client'; // Sigue siendo Client Component para idioma y estado

import Image from 'next/image';
import { useUser } from "@clerk/nextjs";
import { useLanguage } from '@/context/LanguajeContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react'; // Importa el icono de cerrar

const photos = [
  '/portfolio/trabajo1.jpeg', '/portfolio/trabajo2.jpeg', '/portfolio/trabajo3.jpeg',
  '/portfolio/trabajo4.jpeg', '/portfolio/trabajo5.jpeg', '/portfolio/trabajo6.jpeg',
  '/portfolio/trabajo7.jpeg','/portfolio/trabajo8.jpeg','/portfolio/trabajo9.jpeg',
  '/portfolio/trabajo10.jpeg','/portfolio/trabajo11.jpeg','/portfolio/trabajo12.jpeg',
  '/portfolio/trabajo13.jpg','/portfolio/trabajo14.jpg','/portfolio/trabajo15.jpg',
  '/portfolio/trabajo16.jpg','/portfolio/trabajo17.jpg','/portfolio/trabajo18.jpg'

];

export default function PortfolioPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { lang } = useLanguage();
  const router = useRouter();

  // 1. Estado para rastrear la imagen seleccionada para zoom
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 2. Traducciones locales
  const t = {
    en: {
      title: "Exclusive Portfolio",
      subtitle: "Gallery for Sergio Landscape Design LLC clients.",
      close: "Close"
    },
    es: {
      title: "Portafolio Exclusivo",
      subtitle: "Galería para clientes de Sergio Landscape Design LLC.",
      close: "Cerrar"
    }
  };

  const text = lang === 'en' ? t.en : t.es;

  // 3. Protección de ruta (lado del cliente)
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/'); 
    }
  }, [isLoaded, isSignedIn, router]);

  // Cerrar modal al presionar 'Esc' (opcional, muy profesional)
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-900"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-20 bg-gray-50 font-sans relative">
      <div className="container mx-auto px-6">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-emerald-900 uppercase italic tracking-tighter">
            {text.title}
          </h1>
          <p className="text-emerald-700/60 font-bold uppercase text-[10px] tracking-widest mt-2">
            {text.subtitle}
          </p>
          <div className="h-1.5 w-24 bg-emerald-600 mx-auto mt-4 rounded-full shadow-sm"></div>
        </header>

        {/* Galería Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((path, index) => (
            <div key={index} 
              // 4. Añadimos el evento onClick para abrir el modal
              onClick={() => setSelectedImage(path)}
              className="group relative h-80 w-full overflow-hidden rounded-[2.5rem] bg-white shadow-xl border-8 border-white hover:border-emerald-100 transition-all duration-300 cursor-pointer"
            >
              <Image
                src={path}
                alt="Sergio Landscape Project"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Overlay suave al hover */}
              <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <span className="bg-white/80 text-emerald-900 font-bold px-4 py-2 rounded-full text-xs uppercase tracking-widest backdrop-blur-sm">Zoom</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. El MODAL (Lightbox) */}
      {selectedImage && (
        // Overlay oscuro de fondo
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
          onClick={() => setSelectedImage(null)} // Cerrar al hacer clic fuera
        >
          {/* Botón Cerrar */}
          <button 
            onClick={() => setSelectedImage(null)} 
            className="absolute top-6 right-6 z-[110] bg-white text-black p-3 rounded-full hover:bg-emerald-100 transition-colors shadow-lg"
            title={text.close}
          >
            <X size={24} />
          </button>

          {/* Contenedor de la Imagen Agigantada */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic en la imagen
          >
            <Image
              src={selectedImage}
              alt="Sergio Landscape Project Zoom"
              // Usamos objectContain para que se vea la foto entera sin cortar
              fill
              className="object-contain rounded-2xl shadow-2xl"
              priority // Cargar esta imagen rápido
            />
          </div>
        </div>
      )}
    </main>
  );
}