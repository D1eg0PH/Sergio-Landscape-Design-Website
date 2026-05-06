'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguajeContext'; 
import Link from 'next/link';
import "react-day-picker/dist/style.css";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { 
  CalendarDays, Clock, ChevronLeft, User, 
  MapPin, Phone, CheckCircle2, Mail 
} from "lucide-react";

export default function SchedulePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const content = {
    en: {
      title: 'Book A Design Consultation',
      subtitle: 'Free Quote',
      selectD: 'Select Date',
      yourI: 'Your Information',
      availableH: 'Available Hours',
      namePl: 'Full Name',
      phonePl: 'Phone Number',
      emailPl: 'Email Address',
      addressPl: 'Project Address',
      confirmBtn: 'Confirm Booking',
      sending: 'Processing...',
      success: 'Success! Your appointment has been scheduled.',
      errorTitle: 'Please fill in all required fields',
      back: 'BACK'
    },
    es: {
      title: 'Reserve una consulta de diseño',
      subtitle: 'Presupuesto gratis',
      selectD: 'Elegir Fecha',
      yourI: 'Tu Información',
      availableH: 'Horarios Disponibles',
      namePl: 'Nombre Completo',
      phonePl: 'Número de Teléfono',
      emailPl: 'Correo Electrónico',
      addressPl: 'Dirección del Proyecto',
      confirmBtn: 'Confirmar Cita',
      sending: 'Procesando...',
      success: '¡Éxito! Tu cita ha sido programada.',
      errorTitle: 'Por favor completa todos los campos obligatorios',
      back: 'VOLVER'
    }
  };

  const t = content[lang as 'en' | 'es'] || content.es;

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    time: '',
    service: 'Landscape Design'
  });

  const slots = ["08:00", "10:00","12:00", "14:00","16:00", "18:00"];



 useEffect(() => {
  async function getBusy() {
    try {
      // Apuntamos a la ruta pública que creamos específicamente para esto
      const res = await fetch('/api/busy-slots'); 
      if (!res.ok) throw new Error("Error fetching availability");
      const data = await res.json();
      
      // Guardamos los datos asegurándonos de que sea un array
      if (Array.isArray(data)) {
        setBusy(data);
      }
    } catch (err) {
      console.error("Error cargando disponibilidad:", err);
    }
  }
  getBusy();
}, []);


  /*
  useEffect(() => {
    async function getBusy() {
      try {
        const res = await fetch('/api/appointments?mode=availability');
        if (!res.ok) throw new Error("Error fetching availability");
        const data = await res.json();
        if (Array.isArray(data)) setBusy(data);
      } catch (err) {
        console.error("Error cargando disponibilidad:", err);
      }
    }
    getBusy();
  }, []);
*/


const isBusy = (time: string) => {
  if (!selectedDate || busy.length === 0) return false;
  
  // Generamos el YYYY-MM-DD de la fecha seleccionada por el usuario
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  return busy.some(a => {
    // Si la fecha de la DB ya es string, tomamos los primeros 10 caracteres.
    // Si es un objeto Date, lo formateamos igual que la seleccionada.
    const dbDate = a.appointment_date instanceof Date 
      ? format(a.appointment_date, "yyyy-MM-dd")
      : String(a.appointment_date).slice(0, 10);
    
    const dbTime = a.appointment_time?.slice(0, 5); 

    return dbDate === selectedDateStr && dbTime === time;
  });
};

const isDayFullyBooked = (date: Date) => {
  if (busy.length === 0) return false;
  const dateStr = format(date, "yyyy-MM-dd");
  
  const activeOnDay = busy.filter(a => {
    const dbDate = a.appointment_date instanceof Date 
      ? format(a.appointment_date, "yyyy-MM-dd")
      : String(a.appointment_date).slice(0, 10);
    return dbDate === dateStr;
  });

  return activeOnDay.length >= slots.length;
};



/*
 const isBusy = (time: string) => {
    if (!selectedDate) return false;
    
    // 1. Usamos format para tener YYYY-MM-DD local
    const d = format(selectedDate, "yyyy-MM-dd");

    return busy.some(a => {
      // 2. Limpiamos la fecha de la DB: a veces Neon devuelve "2026-05-01T00:00:00Z"
      // Extraemos solo los primeros 10 caracteres (YYYY-MM-DD)
      const dbDate = a.appointment_date instanceof Date 
        ? format(a.appointment_date, "yyyy-MM-dd")
        : String(a.appointment_date).slice(0, 10);
      
      // 3. Limpiamos la hora: "10:00:00" -> "10:00"
      const dbTime = a.appointment_time?.slice(0, 5); 

      // Comparación estricta
      return dbDate === d && dbTime === time && a.status !== 'cancelled';
    });
  };

 

  const isDayFullyBooked = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const activeOnDay = busy.filter(a => a.appointment_date === dateStr && a.status !== 'cancelled');
    return activeOnDay.length >= slots.length;
  };

   

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !formData.time || !formData.fullName || !formData.phone || !formData.address) {
      alert(t.errorTitle);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          appointment_time: formData.time + ":00",
          full_name: formData.fullName,
          address_line1: formData.address,
          service_type: formData.service
        })
      });

      if (res.ok) {
        alert(t.success);
        router.push('/');
      } else {
        const err = await res.json();
        alert(err.error || "Error");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  */

  const send = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Añadimos !formData.email a la lista de obligatorios
  if (!selectedDate || !formData.time || !formData.fullName || !formData.phone || !formData.address || !formData.email) {
    alert(t.errorTitle);
    return;
  }

  setLoading(true);
  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: formData.time + ":00",
        full_name: formData.fullName,
        address_line1: formData.address,
        service_type: formData.service,
        // El email se envía tal cual esté (vacío o lleno)
      })
    });

    if (res.ok) {
      alert(t.success);
      router.push('/');
    } else {
      const err = await res.json();
      alert(err.error || "Error");
    }
  } catch (err) {
    alert("Error de conexión");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="p-6 bg-white border-b flex justify-between items-center max-w-6xl mx-auto">
        <Link href="/" className="text-sm font-bold text-gray-400 flex items-center gap-1 uppercase">
          <ChevronLeft size={16} /> {t.back}
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <header className="bg-emerald-900 .rounded-[2rem] p-10 text-white mb-8 shadow-xl">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">{t.title}</h1>
          <p className="text-emerald-300 text-[10px] uppercase tracking-[0.2em]">{t.subtitle}</p>
        </header>

        <form onSubmit={send} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 .rounded-[2rem] shadow-sm border border-emerald-50">
            <h2 className="font-bold text-emerald-900 flex items-center gap-2 uppercase mb-6">
              <CalendarDays size={20} /> 1. {t.selectD}
            </h2>
            <div className="flex justify-center">
              <DayPicker 
                mode="single"
                selected={selectedDate}
                onSelect={(d) => { setSelectedDate(d); setFormData({...formData, time: ''}); }}
                disabled={[{ before: new Date() }, { dayOfWeek: [0] }, (date) => isDayFullyBooked(date)]}
              />
            </div>

            {selectedDate && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase text-emerald-800 mb-4 flex items-center gap-2">
                  <Clock size={14} /> {t.availableH}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {slots.map(s => {
                    const occupied = isBusy(s);
                    const selected = formData.time === s;
                    return (
                      <button
                        key={s} type="button" disabled={occupied}
                        onClick={() => setFormData({...formData, time: s})}
                        className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                          selected ? 'bg-emerald-900 border-emerald-600 text-white' : 
                          occupied ? 'bg-red-50 border-red-50 text-red-200 cursor-not-allowed line-through' : 
                          'bg-white border-emerald-50 text-emerald-900 hover:border-emerald-300'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-8 .rounded-[2rem] shadow-sm border border-emerald-50 space-y-4">
            <h2 className="font-bold text-emerald-900 flex items-center gap-2 uppercase mb-2">
              <User size={20} /> 2. {t.yourI}
            </h2>
            <input required placeholder={t.namePl} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-emerald-100"
              value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            
                <div className="grid grid-cols-2 gap-4">
                <input 
                  required // El teléfono es obligatorio
                  placeholder={t.phonePl} 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
                <input 
                  type="email" // Sin "required", es opcional
                  required
                  placeholder={t.emailPl} 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>

            <input required placeholder={t.addressPl} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-emerald-100"
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            
            <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-emerald-700 disabled:opacity-50 mt-6 flex items-center justify-center gap-2">
              {loading ? t.sending : <><CheckCircle2 size={18}/> {t.confirmBtn}</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}