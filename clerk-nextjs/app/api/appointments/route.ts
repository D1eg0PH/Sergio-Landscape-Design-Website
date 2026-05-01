import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};

export async function GET() {
  try {
    const sql = getSql();
    
    // 1. Obtener citas
    const appointments = await sql`SELECT * FROM appointments ORDER BY created_at DESC`;
    
    // 2. Obtener items con el nombre y la IMAGEN
    const items = await sql`
      SELECT ai.appointment_id, pc.name_es, pc.image_url
      FROM appointment_items ai
      JOIN plants_catalog pc ON ai.plant_id = pc.id
    `;

    // 3. Mapeo para enviar objetos completos al frontend
    const data = appointments.map(app => {
      // Filtramos las plantas que pertenecen a esta cita
      const plantsDetails = items
        .filter(item => Number(item.appointment_id) === Number(app.id))
        .map(item => ({
          name: item.name_es || "Planta",
          image: item.image_url || "" // Aquí va la URL para la etiqueta <img>
        }));
      
      return {
        ...app,
        // Enviamos el array de objetos para que el frontend pueda iterar y mostrar fotos
        selected_plants: plantsDetails 
      };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("ERROR EN GET:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// Actualizar estatus (Confirmar/Cancelar)
export async function PATCH(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    const { status } = await req.json();

    const sql = getSql();
    const result = await sql`
      UPDATE appointments 
      SET status = ${status} 
      WHERE id = ${BigInt(id!)} 
      RETURNING *`;

    return NextResponse.json(result[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Eliminar cita
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    const sql = getSql();
    await sql`DELETE FROM appointments WHERE id = ${BigInt(id!)}`;
    return NextResponse.json({ message: "Eliminado" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}