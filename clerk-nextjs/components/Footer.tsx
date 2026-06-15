'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Globe, Layout } from 'lucide-react';
import { useLanguage } from '@/context/LanguajeContext';
import { useUser, useAuth } from "@clerk/nextjs";

export default function Footer() {
  const { lang } = useLanguage();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const role = user?.publicMetadata?.role as string || 'user';

  const content = {
    en: {
      desc: "Transforming outdoor spaces with professional landscaping and design in Lakeland, FL.",
      services: "Services",
      quick: "Quick Links",
      contact: "Contact Us",
      rights: "All rights reserved.",
      adminLinks: "Admin Panel"
    },
    es: {
      desc: "Transformando espacios exteriores con diseño y paisajismo profesional en Lakeland, FL.",
      services: "Servicios",
      quick: "Enlaces Rápidos",
      contact: "Contáctanos",
      rights: "Todos los derechos reservados.",
      adminLinks: "Panel de Administración"
    }
  };

  const t = content[lang as 'en' | 'es'] || content.es;

  return (
    <footer className="bg-emerald-900 text-white pt-16 pb-8 px-6 font-sans border-t border-emerald-900/50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        
        {/* COLUMNA 1: LOGO Y DESCRIPCIÓN */}
        <div className="space-y-6">
          <div className="flex gap-5 pt-2">
            <a href="#" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-100/40 hover:text-emerald-400 transition-colors">
              <Globe size={16}/> Instagram
            </a>
            <a href="#" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-100/40 hover:text-emerald-400 transition-colors">
              <Layout size={16}/> Facebook
            </a>
          </div>
        </div>

        {/* COLUMNA 2: ENLACES DINÁMICOS */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-emerald-500 mb-6">{t.quick}</h4>
            <ul className="space-y-3 text-[11px] font-bold uppercase tracking-widest text-emerald-100/70">
              <li><Link href="/" className="hover:text-white transition-colors">{lang === 'en' ? 'Home' : 'Inicio'}</Link></li>
              
              {isSignedIn && role === 'admin' && (
                <>
                  <li><Link href="/appointments" className="hover:text-white transition-colors text-emerald-400">{t.adminLinks}</Link></li>
                  <li><Link href="/inventory" className="hover:text-white transition-colors">Inventory</Link></li>
                </>
              )}

            {isSignedIn && role === 'user' && (
                <>
                <li>
                    <Link href="/myappointments" className="hover:text-white transition-colors">
                    {lang === 'en' ? 'My Appointments' : 'Mis Citas'}
                    </Link>
                </li>
                <li>
                    <Link href="/plants" className="hover:text-white transition-colors">
                    {lang === 'en' ? 'Plant Gallery' : 'Galería de Plantas'}
                    </Link>
                </li>

               <li>
                    <Link href="/portfolio" className="hover:text-white transition-colors">
                    {lang === 'en' ? 'Portfolio' : 'Portafolio'}
                    </Link>
                </li>
                
                </>
            )}

              
                <li><Link href="/contact" className="hover:text-white transition-colors italic text-emerald-400">Contact</Link></li>

              <li><Link href="/schedule" className="hover:text-white transition-colors italic text-emerald-400">Free Quote</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-emerald-500 mb-6">{t.services}</h4>
            <ul className="space-y-3 text-[11px] font-bold uppercase tracking-widest text-emerald-100/70">
              <li>Design</li>
              <li>Maintenance</li>
              <li>Installation</li>
            </ul>
          </div>
        </div>

        {/* COLUMNA 3: CONTACTO */}
        <div>
          <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-emerald-500 mb-6">{t.contact}</h4>
          <ul className="space-y-4 text-xs font-medium text-emerald-100/80">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-emerald-500 shrink-0" />
              <span>Lakeland, Florida</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-emerald-500 shrink-0" />
              <a href="tel:+18636701484" className="hover:text-white transition-colors">(863) 670-1484</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-emerald-500 shrink-0" />
              <a href="mailto:info@sergiolandscape.com" className="hover:text-white transition-colors text-[11px]">info@sergiolandscape.com</a>
            </li>
            
          </ul>
        </div>
      </div>

      {/* BARRA INFERIOR COMERCIAL */}
      <div className="max-w-6xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
        <p>© 2026 SERGIO LANDSCAPE DESIGN LLC. {t.rights}</p>
      </div>
    </footer>
  );
}