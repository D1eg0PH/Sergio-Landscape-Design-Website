'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, Calendar, Clock, MapPin, Phone, 
  RotateCcw, MessageSquare, User, Mail, CheckCircle,
  Sprout, ChevronRight
} from 'lucide-react';

export default function AdminPanel() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'messages'>('appointments');
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);

  // 1. Carga de datos desde NEON
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resApp, resMsg] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/contact')
      ]);
      
      const dataApp = resApp.ok ? await resApp.json() : [];
      const dataMsg = resMsg.ok ? await resMsg.json() : [];
      
      console.log("Citas cargadas:", dataApp);

      setAppointments(Array.isArray(dataApp) ? dataApp : []);
      setMessages(Array.isArray(dataMsg) ? dataMsg : []);
    } catch (error) {
      console.error("Error al sincronizar con Neon:", error);
      setAppointments([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. ACTUALIZAR ESTADO
  const updateStatus = async (id: string | number, newStatus: string) => {
    if (!id) return alert("Error: ID no válido");

    setActionLoading(id);
    const previousState = [...appointments];

    try {
      // Update optimista
      setAppointments(prev => 
        prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
      );

      const res = await fetch(`/api/appointments?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Error en el servidor");
      
    } catch (error: any) {
      alert("Error: " + error.message);
      setAppointments(previousState);
    } finally {
      setActionLoading(null);
    }
  };

  // 3. ELIMINAR REGISTRO
  const deleteItem = async (id: string | number, type: 'appointments' | 'messages') => {
    if (!confirm('¿Eliminar permanentemente este registro?')) return;
    
    setActionLoading(id);
    try {
      const endpoint = type === 'appointments' 
        ? `/api/appointments?id=${id}` 
        : `/api/contact?id=${id}`;

      const res = await fetch(endpoint, { method: 'DELETE' });

      if (res.ok) {
        if (type === 'appointments') {
          setAppointments(prev => prev.filter(item => item.id !== id));
        } else {
          setMessages(prev => prev.filter(item => item.id !== id));
        }
      } else {
        throw new Error("No se pudo eliminar de la base de datos");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-emerald-900 font-black uppercase tracking-widest text-[10px]">Cargando Panel de Sergio...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-900 bg-gray-50 min-h-screen">
      <div className="pt-32 px-6 pb-24">
        {/* HEADER */}
        <header className="max-w-6xl mx-auto bg-emerald-900 rounded-[2.5rem] p-10 text-white mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black italic mb-1 uppercase tracking-tighter text-white">Admin Panel</h1>
              <p className="text-emerald-300 font-medium italic uppercase tracking-tighter text-xs">Sergio Landscape Design LLC</p>
            </div>
            
            <div className="flex bg-emerald-800/40 p-1.5 rounded-2xl border border-emerald-700/50 backdrop-blur-sm">
              <button 
                onClick={() => setActiveTab('appointments')}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'appointments' ? 'bg-white text-emerald-900 shadow-lg' : 'text-emerald-100'}`}
              >
                Citas ({appointments.length})
              </button>
              <button 
                onClick={() => setActiveTab('messages')}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'messages' ? 'bg-white text-emerald-900 shadow-lg' : 'text-emerald-100'}`}
              >
                Mensajes ({messages.length})
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto">
          {activeTab === 'appointments' ? (
            <div className="space-y-6">
              {appointments.length === 0 ? <EmptyState text="No hay citas registradas" /> : (
                appointments.map((app) => (
                  <div key={app.id} className={`bg-white rounded-[2rem] border border-emerald-50 shadow-sm p-8 transition-opacity ${actionLoading === app.id ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      
                      {/* INFORMACIÓN DE LA CITA */}
                      <div className="lg:col-span-8 flex gap-6 items-start">
                        <div className={`w-2 h-20 rounded-full flex-shrink-0 ${app.status === 'confirmed' ? 'bg-emerald-500' : app.status === 'cancelled' ? 'bg-red-400' : 'bg-amber-400'}`} />
                        <div className="flex-1">
                          <span className="bg-emerald-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic">
                            {app.service_type || 'General Service'}
                          </span>
                          <h3 className="text-2xl font-black text-emerald-950 uppercase italic mt-2">{app.full_name}</h3>
            <div className="mt-4 flex flex-wrap gap-3">
  {app.selected_plants?.map((plant: any, i: number) => (
    <div key={i} className="group relative">
      <button 
        onClick={() => setSelectedImg(plant.image)}
        className="w-10 h-10 rounded-lg overflow-hidden border-2 border-emerald-100 hover:border-emerald-500 transition-all shadow-sm active:scale-90"
      >
        <img 
          src={plant.image || '/placeholder-plant.png'} 
          alt={plant.name}
          className="w-full h-full object-cover"
        />
      </button>
      {/* Tooltip con el nombre */}
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {plant.name}
      </span>
    </div>
  ))}
</div>

                          <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase">
                            <span className="flex items-center gap-1"><Calendar size={14}/> {app.appointment_date || 'Solo Lista'}</span>
                            <span className="flex items-center gap-1"><Clock size={14}/> {formatTime(app.appointment_time)}</span>
                            <span className="flex items-center gap-1"><Phone size={14}/> {app.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* ACCIONES */}
                      <div className="lg:col-span-4 flex flex-col gap-2">
                        {app.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => updateStatus(app.id, 'confirmed')}
                              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-transform"
                            >Confirmar</button>
                            <button 
                              onClick={() => updateStatus(app.id, 'cancelled')}
                              className="flex-1 bg-white text-red-400 border border-red-100 py-3 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-transform"
                            >Declinar</button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className={`py-3 rounded-xl text-center font-black text-[10px] uppercase border ${app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                              {app.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                            </div>
                            <button 
                              onClick={() => updateStatus(app.id, 'pending')}
                              className="flex items-center justify-center gap-2 py-2 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <RotateCcw size={12} /> Revertir estado
                            </button>
                          </div>
                        )}
                        <button 
                          onClick={() => deleteItem(app.id, 'appointments')} 
                          className="text-[9px] font-black text-gray-300 hover:text-red-500 flex justify-center gap-1 mt-2 uppercase transition-colors"
                        >
                          <Trash2 size={10}/> Eliminar permanentemente
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* SECCIÓN DE MENSAJES */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {messages.length === 0 ? <div className="col-span-2"><EmptyState text="No hay mensajes de contacto" /></div> : (
                messages.map((msg) => (
                  <div key={msg.id} className="bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm p-8 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700"><User size={24} /></div>
                        <div>
                          <h4 className="font-black text-emerald-950 uppercase italic text-lg">{msg.name}</h4>
                          <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-tighter"><Mail size={12}/> {msg.email}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteItem(msg.id, 'messages')} className="text-gray-200 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-[1.5rem] p-5 border border-emerald-50 flex-grow mb-6 italic text-gray-600 text-sm">
                      "{msg.message}"
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-gray-300 uppercase italic">
                        {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'Recientemente'}
                      </span>
                      <a href={`mailto:${msg.email}`} className="bg-emerald-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-md hover:bg-emerald-800 transition-colors">
                        <MessageSquare size={14} /> Responder
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
      {/* MODAL DE ZOOM */}
{selectedImg && (
  <div 
    className="fixed inset-0 z-[100] bg-emerald-950/90 backdrop-blur-md flex items-center justify-center p-4"
    onClick={() => setSelectedImg(null)}
  >
    <div className="relative max-w-3xl w-full aspect-square bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
      <img src={selectedImg} className="w-full h-full object-cover" />
      <button 
        className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-colors"
        onClick={() => setSelectedImg(null)}
      >
        ✕
      </button>
    </div>
  </div>
)}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-emerald-50">
      <p className="text-emerald-200 font-black uppercase italic text-xs tracking-widest">{text}</p>
    </div>
  );
}