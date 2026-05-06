'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Calendar, Clock, Tag, CheckCircle2, 
  Clock3, XCircle, Leaf, Sprout, ZoomIn 
} from 'lucide-react';

export default function MyAppointments() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      window.location.href = '/sign-in';
    }

    async function fetchMyApps() {
      try {
        const res = await fetch('/api/my-appointments');
        const data = await res.json();
        if (Array.isArray(data)) setAppointments(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isSignedIn) fetchMyApps();
  }, [isLoaded, isSignedIn]);

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  if (!isLoaded || loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-emerald-900 font-black uppercase tracking-widest text-[10px]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 px-6 max-w-5xl mx-auto pb-20 font-sans min-h-screen bg-gray-50/30">
      <header className="mb-12">
        <h2 className="text-5xl font-black text-emerald-950 uppercase italic tracking-tighter leading-none">
          My <span className="text-emerald-600">History</span>
        </h2>
        <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
          <Leaf size={14} className="text-emerald-500" /> Track your landscaping requests
        </p>
      </header>
      
      <div className="grid gap-8">
        {appointments.map(app => (
          <div key={app.id} className="group bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                
                <div className="flex-1 space-y-6">
                  {/* ESTATUS BADGE */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      app.status === 'cancelled' ? 'bg-red-50 text-red-500 border-red-100' : 
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {app.status === 'confirmed' ? <CheckCircle2 size={12} /> : 
                       app.status === 'cancelled' ? <XCircle size={12} /> : <Clock3 size={12} />}
                      {app.status || 'Pending'}
                    </div>
                  </div>

                  {/* INFO PRINCIPAL */}
                  <div>
                    <h3 className="text-3xl font-black text-emerald-950 uppercase italic tracking-tighter leading-tight group-hover:text-emerald-700 transition-colors">
                      {app.service_type || 'Plant Selection List'}
                    </h3>
                    
                    {/* MINIATURAS DE PLANTAS CON ZOOM */}
                    {app.selected_plants && app.selected_plants.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {app.selected_plants.map((plant: any, i: number) => (
                          <div key={i} className="relative group/img">
                            <button 
                              onClick={() => setSelectedImg(plant.image)}
                              className="w-12 h-12 rounded-xl overflow-hidden border-2 border-emerald-50 hover:border-emerald-500 transition-all shadow-sm"
                            >
                              <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                <ZoomIn size={14} className="text-white" />
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-6 mt-6 pt-6 border-t border-gray-50">
                      {app.appointment_date ? (
                        <>
                          <div className="flex items-center gap-2 text-gray-500 font-bold text-[11px] uppercase tracking-tight">
                            <Calendar size={14} className="text-emerald-600" />
                            {new Date(app.appointment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 font-bold text-[11px] uppercase tracking-tight">
                            <Clock size={14} className="text-emerald-600" />
                            {formatTime(app.appointment_time)}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 font-bold text-[11px] uppercase tracking-tight italic">
                          <Tag size={14} /> Submitted on {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {appointments.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-emerald-100 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl animate-bounce">🌿</div>
            <p className="text-emerald-950 font-black uppercase italic text-xl tracking-tighter">No history yet</p>
          </div>
        )}
      </div>

      {/* MODAL DE ZOOM (IGUAL AL ADMIN) */}
      {selectedImg && (
        <div className="fixed inset-0 z-[100] bg-emerald-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
          <div className="relative max-w-2xl w-full aspect-square bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <img src={selectedImg} className="w-full h-full object-cover" />
            <button className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}