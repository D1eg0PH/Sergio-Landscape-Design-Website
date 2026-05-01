'use client';

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs"; 
import { Trash2, Upload, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PlantManager() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  
  const [nameEn, setNameEn] = useState('');
  const [nameEs, setNameEs] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) {
      const role = user?.publicMetadata?.role;
      if (!isSignedIn || role !== 'admin') {
        router.push('/'); 
      } else {
        fetchPlants();
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  async function fetchPlants() {
    try {
      setLoading(true);
      const res = await fetch('/api/plants', { cache: 'no-store' });
      const data = await res.json();
      setPlants(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando plantas");
    } finally {
      setLoading(false);
    }
  }

  async function addPlant(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) return alert("Por favor selecciona una imagen");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('name_en', nameEn);
      formData.append('name_es', nameEs);
      formData.append('category', category);

      const response = await fetch('/api/plants', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // Muestra el error detallado que configuramos en el backend
        throw new Error(result.details || result.error || "Error desconocido");
      }

      // Limpiar formulario tras éxito
      setNameEn(''); setNameEs(''); setCategory('');
      setImageFile(null); setPreviewUrl(null);
      await fetchPlants();
      alert("¡Guardado con éxito!");

    } catch (err: any) {
      console.error(err);
      alert("ERROR: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  if (!isLoaded) return null;

  return (
    <div className="pt-32 px-6 max-w-6xl mx-auto pb-20 font-sans text-black min-h-screen bg-gray-50">
      <header className="bg-emerald-900 rounded-[2.5rem] p-8 text-white mb-10 shadow-xl">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Panel de Inventario</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={addPlant} className="bg-white p-6 .rounded-[2rem] shadow-sm border border-emerald-50 h-fit space-y-4">
          <div className="relative aspect-square bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-200 flex items-center justify-center overflow-hidden hover:bg-emerald-100 transition-colors">
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="text-center text-emerald-800 p-4">
                <Upload className="mx-auto mb-2" size={30} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-tight block">Imagen<br/>Obligatoria</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImageFile(e.target.files[0]);
                  setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                }
              }} 
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            />
          </div>

          <div className="space-y-2">
            <input placeholder="English Name" className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" value={nameEn} onChange={e => setNameEn(e.target.value)} />
            <input placeholder="Nombre Español" className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" value={nameEs} onChange={e => setNameEs(e.target.value)} />
            <input placeholder="Categoría" className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" value={category} onChange={e => setCategory(e.target.value)} />
          </div>

          <button 
            disabled={uploading} 
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            {uploading ? 'PROCESANDO...' : 'AÑADIR AL CATÁLOGO'}
          </button>
        </form>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-900" size={40} /></div>
          ) : (
            plants.map(plant => (
              <div key={plant.id} className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                <img src={plant.image_url} className="w-16 h-16 rounded-xl object-cover bg-gray-100.flex-shrink-0" alt="Plant" />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-xs uppercase truncate text-emerald-950 italic">{plant.name_es}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{plant.category}</p>
                </div>
                <button 
                  onClick={async () => {
                    if(confirm('¿Eliminar esta planta?')) {
                      await fetch(`/api/plants?id=${plant.id}`, { method: 'DELETE' });
                      fetchPlants();
                    }
                  }} 
                  className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}