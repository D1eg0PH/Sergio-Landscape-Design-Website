'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguajeContext';
import { SignIn, SignUp } from "@clerk/nextjs";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const { lang } = useLanguage();
  
  const t = {
    en: {
      login: 'Login',
      register: 'Register',
      dhacc: "Don't have an account?",
      ahancc: 'Already have an account?',
      welcome: 'Welcome Back',
      createA: 'Create Account',
      subtitle: 'Sergio Landscape Design LLC'
    },
    es: {
      login: 'Iniciar Sesión',
      register: 'Regístrate',
      dhacc: '¿No tienes una cuenta?',
      ahancc: '¿Ya tienes una cuenta?',
      welcome: 'Bienvenido de nuevo',
      createA: 'Crear Cuenta',
      subtitle: 'Sergio Landscape Design LLC'
    }
  }[lang as 'en' | 'es'];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 font-sans py-20">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-emerald-50 overflow-hidden">
        
        {/* CABECERA ESTILIZADA */}
        <div className="bg-emerald-900 p-8 text-white text-center">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            {isRegister ? t.createA : t.welcome}
          </h2>
          <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest mt-2">
            {t.subtitle}
          </p>
        </div>

        <div className="p-8 flex flex-col items-center">
          
          {/* COMPONENTES DE CLERK */}
          {/* Se encargan de todo: campos, validación, "olvidé mi contraseña" y registro */}
          {isRegister ? (
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-emerald-900 hover:bg-emerald-800 text-xs uppercase tracking-widest',
                  card: 'shadow-none border-none p-0',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  footer: 'hidden'
                }
              }}
              routing="hash"
            />
          ) : (
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-emerald-900 hover:bg-emerald-800 text-xs uppercase tracking-widest',
                  card: 'shadow-none border-none p-0',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  footer: 'hidden'
                }
              }}
              routing="hash"
            />
          )}

          {/* SELECTOR DE MODO (LOGIN / REGISTER) */}
          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-100 w-full">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {isRegister ? t.ahancc : t.dhacc}
            </p>
            <button 
              type="button" 
              onClick={() => setIsRegister(!isRegister)} 
              className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:underline"
            >
              {isRegister ? t.login : t.register}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}