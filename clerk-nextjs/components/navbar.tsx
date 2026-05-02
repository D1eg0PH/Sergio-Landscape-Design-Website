'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguajeContext';
import { useUser, useAuth, UserButton, SignInButton } from "@clerk/nextjs";

export default function Navbar() {
  const { lang, setLang } = useLanguage();
  
  // useAuth nos da el estado booleano de la sesión
  const { isSignedIn } = useAuth();
  // useUser nos da los datos del perfil (como la metadata del rol)
  const { user } = useUser();

  const role = user?.publicMetadata?.role as string || 'user';

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-emerald-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link
          href="/"
          className="font-black text-2xl tracking-tighter text-emerald-800 uppercase italic"
        >
          SERGIO LANDSCAPE DESIGN LLC
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/home" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-700 transition-colors">
              {lang === 'en' ? 'Home' : 'Inicio'}
            </Link>
            <Link href="/contact" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-700 transition-colors">
              {lang === 'en' ? 'Contact' : 'Contacto'}
            </Link>
          </div>

          <div className="h-6 .w-[1px] bg-gray-200 hidden md:block"></div>

          <div className="flex items-center gap-3">
            
            {/* Lógica manual: Si NO está iniciado sesión */}
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="bg-emerald-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-800 transition-all">
                  {lang === 'en' ? 'Client Login' : 'Iniciar Sesión'}
                </button>
              </SignInButton>
            )}

            {/* Lógica manual: Si SÍ está iniciado sesión */}
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
                      {lang === 'en' ? 'MyAppointments' : 'Mis citas'}
                    </Link>
                           <Link href="/plants" className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                  {lang === 'en' ? 'Gallery' : 'Galería'}
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