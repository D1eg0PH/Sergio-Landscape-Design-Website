'use client';
import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs"; // Cambiado de Supabase a Clerk
import { useLanguage } from '@/context/LanguajeContext';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar, Send, CheckCircle2, X } from 'lucide-react';

export default function CatalogPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser(); // Clerk Hook
  const { lang = 'en' } = useLanguage() || {};
  
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  // Estados de Control
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Estados de Datos
  const [plants, setPlants] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<number[]>([]);
  const [userIntent, setUserIntent] = useState<string>(''); 

  // Estados de Formulario/Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    serviceType: 'Landscape Design Consultation',
    date: new Date().toISOString().split('T')[0],
    time: '',
    city: 'Lakeland',
    address_line1: '',
    zip_code: '',
    phone: '',
    email: '',
  });

  const timeSlots = ["08:00:00", "10:00:00", "12:00:00", "14:00:00", "16:00:00"];

  // 1. Inicialización (Reemplazando Supabase por tus APIs de Neon)
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/login');
      } else {
        fetchData();
      }
    }
  }, [isLoaded, isSignedIn, router]);
async function fetchData() {
  try {
    setLoading(true);
    
    // Ejecutamos ambas pero verificamos individualmente
    const [resPlants, resSlots] = await Promise.all([
      fetch('/api/plants'),
      fetch('/api/appointments/busy-slots')
    ]);

    // Verificación de Plantas
    let dataPlants = [];
    if (resPlants.ok) {
      dataPlants = await resPlants.json();
    } else {
      console.error("Error en /api/plants:", await resPlants.text());
    }

    // Verificación de Slots (Donde está el error según tu imagen)
    let dataSlots = [];
    if (resSlots.ok) {
      dataSlots = await resSlots.json();
    } else {
      const errorText = await resSlots.text();
      console.error("Error en /api/appointments/busy-slots:", errorText);
    }

    setPlants(Array.isArray(dataPlants) ? dataPlants : []);
    setAppointments(Array.isArray(dataSlots) ? dataSlots : []);
    
  } catch (e) {
    console.error("Error crítico en fetchData:", e);
  } finally {
    setLoading(false);
  }
}
  const togglePlant = (id: number) => {
    setSelectedPlants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const isSlotBusy = (date: string, time: string) => {
    return appointments.some(app => app.appointment_date === date && app.appointment_time === time);
  };

  // 2. Acción Final (Hacia tu API de Neon)
  const handleAction = async () => {
    if (!formData.fullName || !formData.phone) {
      alert(lang === 'en' ? "Required fields missing" : "Campos obligatorios faltantes");
      return;
    }

   setProcessing(true);
  try {
    // 1. Crea un objeto limpio SIN la propiedad 'id'
    const { id, ...dataToSend } = formData as any; // Esto quita el id si existiera en formData

    const response = await fetch('/api/appointments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...dataToSend, // Enviamos el resto de los datos
        userIntent,
        userId: user?.id,
        selectedPlants,
        lang
      }),
    });

     if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Error al guardar');
    }
      
      alert(lang === 'en' ? "Your request has been sent!" : "¡Tu solicitud ha sido enviada!");
      setIsModalOpen(false);
      setSelectedPlants([]);
      setUserIntent('');
      router.push('/myappointments');
      router.refresh();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Render de carga e interfaz (Mantenemos tu estilo visual premium)
  if (!isLoaded || loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-800 mb-4" size={48} />
        <p className="text-emerald-900 font-black uppercase tracking-widest text-[10px] italic">
          {lang === 'en' ? 'Opening Catalog...' : 'Abriendo Catálogo...'}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-32 px-6 bg-gray-50 min-h-screen pb-20 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header (Mantenido igual) */}
        <header className="bg-emerald-900 rounded-[2.5rem] p-10 text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              {lang === 'en' ? 'Plant Catalog' : 'Catálogo de Plantas'}
            </h1>
            <p className="text-emerald-300 font-bold text-xs uppercase tracking-widest mt-2 italic">Sergio Landscape Design LLC</p>
          </div>
        </header>

        {/* Action Bar (Mantenido igual con la lógica de steps) */}
        <div className="mb-12 bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-emerald-50 p-4 rounded-2xl text-center .min-w-[100px] border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Selected</p>
              <h2 className="text-3xl font-black text-emerald-900 italic leading-none">{selectedPlants.length}</h2>
            </div>
            
            <div className="space-y-2">
              <select 
                value={userIntent}
                onChange={(e) => setUserIntent(e.target.value)}
                className="w-full bg-gray-50 border border-emerald-100 rounded-xl px-4 py-3 text-xs font-bold text-emerald-900 outline-none"
              >
                <option value="">{lang === 'en' ? '-- Select Action --' : '-- Selecciona Acción --'}</option>
                <option value="schedule">{lang === 'en' ? '📅 Schedule Home Visit' : '📅 Agendar Visita'}</option>
                <option value="list_only">{lang === 'en' ? '📩 Just Send My List' : '📩 Solo Enviar Lista'}</option>
              </select>
            </div>
          </div>

          <button 
            disabled={selectedPlants.length === 0 || userIntent === '' || processing}
            onClick={() => {
                if(userIntent === 'list_only') setFormStep(2);
                else setFormStep(1);
                setIsModalOpen(true);
            }}
            className={`px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl flex items-center gap-3 ${
              (selectedPlants.length > 0 && userIntent !== '') 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {userIntent === 'list_only' ? <Send size={16}/> : <Calendar size={16}/>}
            {userIntent === 'list_only' ? 'Send Selection' : 'Choose Date →'}
          </button>
        </div>

        {/* Grid de Plantas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {plants.map((plant) => (
            <div key={plant.id} className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all ${selectedPlants.includes(plant.id) ? 'border-emerald-500 shadow-2xl' : 'border-transparent shadow-sm'}`}>
              <div onClick={() => setSelectedImg(plant.image_url)} className="aspect-square bg-gray-100 rounded-3xl mb-6 overflow-hidden relative cursor-pointer group">
                <img src={plant.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={plant.name_es} />
                {selectedPlants.includes(plant.id) && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg z-10">
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-black text-emerald-950 uppercase italic tracking-tighter truncate">
                {lang === 'en' ? (plant.name_en || plant.name_es) : (plant.name_es || plant.name_en)}
              </h3>
              <button onClick={() => togglePlant(plant.id)} className={`w-full mt-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest ${selectedPlants.includes(plant.id) ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-700'}`}>
                {selectedPlants.includes(plant.id) ? 'Remove' : 'Add to List'}
              </button>
            </div>
          ))}
        </div>

        {/* Zoom Modal */}
        {selectedImg && (
          <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 cursor-pointer" onClick={() => setSelectedImg(null)}>
            <img src={selectedImg} className="max-w-full max-h-full rounded-lg" alt="Zoom" />
          </div>
        )}
      </div>

      {/* Modal Multi-paso Rediseñado para Neon */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-950/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-emerald-900"><X size={24} /></button>

            {formStep === 1 && userIntent === 'schedule' ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-black text-emerald-900 italic uppercase">Select Visit Date</h2>
                </div>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]} 
                  className="w-full bg-gray-50 border-2 border-emerald-50 p-5 rounded-2xl font-bold"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value, time: ''})} 
                />
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      disabled={isSlotBusy(formData.date, slot)}
                      onClick={() => setFormData({...formData, time: slot})}
                      className={`p-4 rounded-2xl text-xs font-black border-2 transition-all ${isSlotBusy(formData.date, slot) ? 'bg-gray-100 text-gray-300 line-through' : formData.time === slot ? 'bg-emerald-600 text-white' : 'bg-white border-emerald-50 text-emerald-900'}`}
                    >
                      {slot.slice(0,5)}
                    </button>
                  ))}
                </div>
                <button disabled={!formData.time} onClick={() => setFormStep(2)} className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest disabled:opacity-30">
                  Confirm Time →
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center">
                  {userIntent === 'schedule' && (
                    <button onClick={() => setFormStep(1)} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-2 block">← Back</button>
                  )}
                  <h2 className="text-2xl font-black text-emerald-900 italic uppercase">Final Details</h2>
                </div>
                <div className="space-y-3">
                  <input placeholder="Full Name" className="w-full bg-gray-50 border-2 border-emerald-50 p-4 rounded-2xl font-bold" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                  <input placeholder="Phone" className="w-full bg-gray-50 border-2 border-emerald-50 p-4 rounded-2xl font-bold" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  <input placeholder="Address" className="w-full bg-gray-50 border-2 border-emerald-50 p-4 rounded-2xl font-bold" value={formData.address_line1} onChange={(e) => setFormData({...formData, address_line1: e.target.value})} />
                </div>
                <button onClick={handleAction} disabled={processing} className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3">
                  {processing ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {processing ? 'Processing...' : 'Confirm & Schedule'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}