'use client';

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useLanguage } from '@/context/LanguajeContext';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar, Send, CheckCircle2, X } from 'lucide-react';

export default function CatalogPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { lang = 'en' } = useLanguage() || {};
  
  // Estados de UI
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
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
    phone: '',
    email: '',
  });

  const timeSlots = ["08:00:00", "10:00:00", "12:00:00", "14:00:00", "16:00:00"];

  // 1. Inicialización de Datos desde Neon (via API)
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        
        // Usamos cache: 'no-store' para forzar la lectura de la base de datos
        // Usamos Promise.allSettled para que si una API falla, la otra siga funcionando
        const results = await Promise.allSettled([
          fetch('/api/plants', { cache: 'no-store' }).then(res => res.json()),
          fetch('/api/appointments/busy-slots', { cache: 'no-store' }).then(res => res.json())
        ]);

        // Procesar resultado de Plantas
        if (results[0].status === 'fulfilled') {
          setPlants(Array.isArray(results[0].value) ? results[0].value : []);
        } else {
          console.error("Error en API de plantas");
        }

        // Procesar resultado de Citas
        if (results[1].status === 'fulfilled') {
          setAppointments(Array.isArray(results[1].value) ? results[1].value : []);
        }

      } catch (error) {
        console.error("Error crítico de red:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isLoaded, isSignedIn, router]);

  const togglePlant = (id: number) => {
    setSelectedPlants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const isSlotBusy = (date: string, time: string) => {
    return appointments.some(app => app.appointment_date === date && app.appointment_time === time);
  };

  const handleAction = async () => {
    if (!formData.fullName || !formData.phone) {
      alert(lang === 'en' ? "Full Name and Phone are required" : "Nombre y Teléfono son requeridos");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userIntent,
          userId: user?.id,
          selectedPlants,
          lang
        }),
      });

      if (!response.ok) throw new Error('Error al guardar');

      alert(lang === 'en' ? "Your request has been sent!" : "¡Tu solicitud ha sido enviada!");
      setIsModalOpen(false);
      setSelectedPlants([]);
      router.push('/myappointments');
      router.refresh();

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

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
        {/* Header */}
        <header className="bg-emerald-900 rounded-[2.5rem] p-10 text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              {lang === 'en' ? 'Plant Catalog' : 'Catálogo de Plantas'}
            </h1>
            <p className="text-emerald-300 font-bold text-xs uppercase tracking-widest mt-2 italic">Sergio Landscape Design LLC</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -mr-20 -mt-20 opacity-50"></div>
        </header>

        {/* Action Bar */}
        <div className="mb-12 bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-emerald-50 p-4 rounded-2xl text-center min-w-[100px] border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Selected</p>
              <h2 className="text-3xl font-black text-emerald-900 italic leading-none">{selectedPlants.length}</h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center sm:text-left">
                {lang === 'en' ? 'Next Step' : 'Siguiente Paso'}
              </label>
              <select 
                value={userIntent}
                onChange={(e) => setUserIntent(e.target.value)}
                className="w-full bg-gray-50 border border-emerald-100 rounded-xl px-4 py-3 text-xs font-bold text-emerald-900 outline-none transition-all focus:ring-2 focus:ring-emerald-500"
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
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-1' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {userIntent === 'list_only' ? <Send size={16}/> : <Calendar size={16}/>}
            {userIntent === 'list_only' ? (lang === 'en' ? 'Send Selection' : 'Enviar Selección') : (lang === 'en' ? 'Choose Date →' : 'Elegir Fecha →')}
          </button>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plants.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border border-dashed border-emerald-200">
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                 {lang === 'en' ? 'No plants found in Neon database.' : 'No se encontraron plantas en Neon.'}
               </p>
            </div>
          ) : (
            plants.map((plant) => (
              <div 
                  key={plant.id} 
                  className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${
                    selectedPlants.includes(plant.id) 
                    ? 'border-emerald-500 shadow-2xl scale-[1.02]' 
                    : 'border-transparent shadow-sm hover:shadow-md'
                  }`}
              >
                  <div 
                    onClick={() => setSelectedImg(plant.image_url || "/garden1.webp")}
                    className="aspect-square bg-gray-100 rounded-3xl mb-6 overflow-hidden relative group cursor-pointer shadow-lg"
                  >
                    <img 
                      src={plant.image_url || "/garden1.webp"} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt="Plant" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white text-4xl font-light">+</span>
                    </div>
                    
                    {selectedPlants.includes(plant.id) && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg z-10">
                        <CheckCircle2 size={20} />
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-emerald-950 uppercase italic tracking-tighter truncate">
                    {lang === 'en' ? (plant.name_en || plant.name_es) : (plant.name_es || plant.name_en)}
                  </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {plant.care_level || 'General Care'}
                </p>
                
                <button 
                  onClick={() => togglePlant(plant.id)}
                  className={`w-full mt-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                    selectedPlants.includes(plant.id) 
                    ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {selectedPlants.includes(plant.id) ? (lang === 'en' ? 'Remove' : 'Quitar') : (lang === 'en' ? 'Add to List' : 'Agregar')}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modals ... (igual que tu código previo) */}
      </div>
    </div>
  );
}