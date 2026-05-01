'use client';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguajeContext';

export default function ContactPage() {
  const context = useLanguage();
  const lang = context?.lang || 'es';
  
  const content = {
    en: {
      contact: 'Contact Us',
      subtitle: 'Professional landscaping services in Florida',
      received: '¡Received!',
      emex: 'email@example.com',
      btn: 'Send Message',
      btnSending: 'Sending...'
    },
    es: {
      contact: 'Contactános',
      subtitle: 'Servicios profesionales en Florida',
      received: '¡Recibido!',
      emex: 'correo@ejemplo.com',
      btn: 'Enviar Mensaje',
      btnSending: 'Enviando...'
    }
  };

  const t = content[lang as 'en' | 'es'];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert(lang === 'en' ? "Please fill all fields" : "Por favor llena todos los campos");
      return;
    }

    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Error al enviar');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error("Fetch Error:", error);
      setStatus('error');
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="font-sans text-gray-900 bg-gray-50 min-h-screen">
      <div className="pt-32 px-6">
        <header className="max-w-4xl mx-auto bg-emerald-900 rounded-[2.5rem] p-10 text-white mb-10 shadow-2xl">
          <h1 className="text-4xl font-black italic mb-1 uppercase tracking-tighter">
            {t.contact}
          </h1>
          <p className="text-emerald-300 font-medium italic uppercase tracking-widest text-[10px]">
            {t.subtitle}
          </p>
        </header>

        <main className="max-w-4xl mx-auto pb-24">
          <div className="bg-white rounded-[2.5rem] border border-emerald-50 shadow-xl p-8 md:p-12">
            
            {status === 'success' ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🌿</div>
                <h2 className="text-2xl font-black text-emerald-900 uppercase italic">
                  {t.received}
                </h2>
                <button 
                  onClick={() => setStatus('idle')} 
                  className="mt-6 text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline"
                >
                  {lang === 'en' ? 'Send another' : 'Enviar otro'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] ml-2">
                      {lang === 'en' ? 'Full Name' : 'Nombre Completo'}
                    </label>
                    <input
                      required 
                      type="text" 
                      className="w-full bg-gray-50 border border-emerald-50 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] ml-2 flex justify-between">
                      <span>{lang === 'en' ? 'Email' : 'Correo'}</span>
                      <span className="text-red-500 text-[8px] italic">{lang === 'en' ? '* REQUIRED' : '* OBLIGATORIO'}</span>
                    </label>
                    <input 
                      required 
                      type="email" 
                      placeholder={t.emex} 
                      className="w-full bg-gray-50 border border-emerald-50 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] ml-2">
                    {lang === 'en' ? 'Message' : 'Mensaje'}
                  </label>
                  <textarea
                    required 
                    rows={5} 
                    className="w-full bg-gray-50 border border-emerald-50 .rounded-[2rem] p-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none resize-none" 
                    value={formData.message} 
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex justify-center">
                  <button 
                    disabled={status === 'sending'} 
                    type="submit" 
                    className="cursor-pointer bg-emerald-900 text-white w-full md:w-72 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-emerald-800 transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {status === 'sending' ? t.btnSending : t.btn}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}