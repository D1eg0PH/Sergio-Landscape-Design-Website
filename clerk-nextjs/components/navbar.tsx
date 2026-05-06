'use client';

import Link from 'next/link';
import Image from 'next/image'; // 1. Importar Image
import { useLanguage } from '@/context/LanguajeContext';
import { useUser, useAuth, UserButton, SignInButton } from "@clerk/nextjs";

export default function Navbar() {
  const { lang, setLang } = useLanguage();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const role = user?.publicMetadata?.role as string || 'user';

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-emerald-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* 2. Contenedor del Logo + Texto */}
        <Link
          href="/"
          className="flex items-center gap-3 font-black text-2xl tracking-tighter text-emerald-800 uppercase italic hover:opacity-80 transition-opacity"
        >
          <Image 
            src="/icon.png" 
            alt="Logo Sergio Landscape" 
            width={40} 
            height={40} 
            className="object-contain"
          />
          <span className="hidden sm:inline">SERGIO LANDSCAPE DESIGN LLC</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 items-center">
            {/* ... resto de tus links (Inicio, Contacto) ... */}
            <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-700 transition-colors">
              {lang === 'en' ? 'Home' : 'Inicio'}
            </Link>
            <Link href="/contact" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-700 transition-colors">
              {lang === 'en' ? 'Contact' : 'Contacto'}
            </Link>
          </div>

          <div className="h-6 w-[1px] bg-gray-200 hidden md:block"></div>

          <div className="flex items-center gap-3">
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="bg-emerald-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-800 transition-all">
                  {lang === 'en' ? 'Login' : 'Iniciar Sesión'}
                </button>
              </SignInButton>
            )}

            {isSignedIn && (
              <div className="flex items-center gap-3">
                {role === 'admin' && (
                  <>
                    <Link href="/appointments" className="text-[10px] font-black uppercase tracking-widest text-emerald-800 hover:text-emerald-600 transition-colors">
                      {lang === 'en' ? 'Appointments' : 'Citas'}
                    </Link>
                    <Link href="/inventory" className="text-[10px] font-black uppercase tracking-widest text-emerald-800 hover:text-emerald-600 transition-colors">
                      {lang === 'en' ? 'Inventory' : 'Inventario'}
                    </Link>
                    <Link href="/myappointments" className="text-[10px] font-black uppercase tracking-widest text-emerald-800 hover:text-emerald-600 transition-colors">
                      {lang === 'en' ? 'My Appointments' : 'Mis citas'}
                    </Link>
                    <Link href="/plants" className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                      {lang === 'en' ? 'Gallery' : 'Galería'}
                    </Link>
                     <Link href="/portfolio" className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                      {lang === 'en' ? 'Portfolio' : 'Portafolio'}
                    </Link>
                  </>
                )}

                {role === 'user' && (
                  <>  
                    <Link href="/myappointments" className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                      {lang === 'en' ? 'My Appointments' : 'Mis Citas'}
                    </Link>
                    <Link href="/plants" className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                      {lang === 'en' ? 'Gallery' : 'Galería'}
                    </Link>
                    <Link href="/portfolio" className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                      {lang === 'en' ? 'Portfolio' : 'Portafolio'}
                    </Link>
                  </>
                )}
                <UserButton/>
              </div>
            )}

            <button
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="bg-gray-100 px-3 py-2 rounded-full text-[10px] font-black border border-gray-200 hover:bg-gray-200 transition-colors"
            >
              {lang === 'en' ? 'EN' : 'ES'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}