// components/ClerkLocalizationWrapper.tsx
'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { esES, enUS } from "@clerk/localizations";
import { useLanguage } from '@/context/LanguajeContext';

export default function ClerkLocalizationWrapper({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();

  return (
    <ClerkProvider
      // Aquí ocurre la magia: si lang es 'en', usa enUS, si no, esES
      localization={lang === 'en' ? enUS : esES}
      appearance={{
        variables: {
          colorPrimary: '#065f46',
          colorTextOnPrimaryBackground: 'white',
        },
        elements: {
          card: "shadow-2xl border-2 border-emerald-50 rounded-[2rem]",
          formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-sm uppercase font-bold tracking-widest",
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
}