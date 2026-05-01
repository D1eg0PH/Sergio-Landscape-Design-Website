'use client';

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs"; 
import { Trash2, Upload, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PlantManager() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [authorized, setAuthorized] = useState(false);
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();
  
  const [nameEn, setNameEn] = useState('');
  const [nameEs, setNameEs] = useState('');
  const [careLevel, setCareLevel] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 1. Verificación de Seguridad
  useEffect(() => {
    if (isLoaded) {
      const role = user?.publicMetadata?.role;
      if (!isSignedIn || role !== 'admin') {
        router.push('/'); 
      } else {
        setAuthorized(true);
        fetchPlants();
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  // 2. Cargar plantas
  async function fetchPlants() {
    try {
      setLoading(true);
      const res = await fetch('/api/plants', { cache: 'no-store' });
      if (!res.ok) throw new Error("Error al obtener datos");
      const data = await res.json();
      setPlants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar plantas:", error);
    } finally {
      setLoading(false);
    }
  }

  // MANTENIDO: Lógica de selección de fotos original
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 3. Agregar Planta (Sincronizado con Neon)
  async function addPlant(e: React.FormEvent) {
    e.preventDefault();
    
    if (!imageFile) {
      alert("Por favor, selecciona una imagen");
      return;
    }

    setUploading(true);
    try {
      // MANTENIDO: Uso de FormData para enviar el archivo
      const formDataToSend = new FormData();
      formDataToSend.append('file', imageFile);
      
      // Sincronizado con nombres de columna de Neon
      formDataToSend.append('name_en', nameEn.trim() || "Unnamed Plant");
      formDataToSend.append('name_es', nameEs.trim() || "Planta sin nombre");
      formDataToSend.append('care_level', careLevel || "Easy");

      const response = await fetch('/api/plants', { // Asegúrate que tu API maneje FormData
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error("Error al guardar en el servidor");

      // Limpiar formulario
      setNameEn('');
      setNameEs('');
      setCareLevel('');
      setImageFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      
      await fetchPlants();
      alert("¡Planta agregada con éxito!");

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  // 4. Eliminar Planta
  async function deletePlant(id: number) {
    if (!confirm("¿Eliminar esta planta del catálogo?")) return;
    try {
      const res = await fetch(`/api/plants?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("No se pudo eliminar");
      await fetchPlants();
    } catch (error: any) {
      alert(error.message);
    }
  }

  if (!isLoaded || !authorized) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-800" size={40} /></div>;
  }

  return (
    <div className="pt-32 px-6 max-w-6xl mx-auto pb-20 font-sans text-black">
      <header className="bg-emerald-900 rounded-[2.5rem] p-10 text-white mb-10 shadow-xl">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Gestor de Catálogo</h1>
        <p className="text-emerald-300 font-bold text-xs uppercase tracking-widest mt-2">Inventario Sergio Landscape</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <form onSubmit={addPlant} className="bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm sticky top-32">
            <h2 className="text-xl font-black text-emerald-900 uppercase italic mb-6">Nueva Entrada</h2>
            
            <div className="space-y-4">
              {/* MANTENIDO: Input de archivo y Preview */}
              <div className="relative group">
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${previewUrl ? 'border-emerald-500' : 'border-gray-200 group-hover:border-emerald-300'}`}>
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover rounded-3xl" alt="Preview" />
                  ) : (
                    <>
                      <Upload className="text-gray-300 mb-2" size={32} />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center px-4">Subir foto</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <input placeholder="English Name" className="w-full bg-gray-50 border border-emerald-50 p-4 rounded-xl font-bold text-sm" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
                <input placeholder="Nombre Español" className="w-full bg-gray-50 border border-emerald-50 p-4 rounded-xl font-bold text-sm" value={nameEs} onChange={(e) => setNameEs(e.target.value)} />
                <select value={careLevel} onChange={(e) => setCareLevel(e.target.value)} className="w-full bg-gray-50 border border-emerald-50 p-4 rounded-xl font-bold text-sm">
                  <option value="">Care Level</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <button type="submit" disabled={uploading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                {uploading ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                {uploading ? 'GUARDANDO...' : 'AÑADIR'}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de plantas similar a la anterior pero con soporte para el array de Neon */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-900" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plants.map((plant) => (
                <div key={plant.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={plant.image_url || "/garden1.webp"} className="w-full h-full object-cover" alt={plant.name_en} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-emerald-950 uppercase italic text-sm truncate">{plant.name_es}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{plant.name_en}</p>
                  </div>
                  <button onClick={() => deletePlant(plant.id)} className="p-3 text-gray-200 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}