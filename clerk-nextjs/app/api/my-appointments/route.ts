import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// 1. Definir la conexión fuera para reusarla
const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};

// GET: Obtener citas
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode'); // Para diferenciar quién pide la info
    const sql = getSql();

    // CASO A: Calendario Público (Solo fechas/horas ocupadas)
    if (mode === 'availability') {
      const busySlots = await sql`
        SELECT appointment_date, appointment_time 
        FROM appointments 
        WHERE status != 'cancelled'
      `;
      return NextResponse.json(busySlots);
    }

    // CASO B: Historial del Usuario (Requiere Login)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointments = await sql`
      SELECT * FROM appointments 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;

    const items = await sql`
      SELECT ai.appointment_id, pc.name_es, pc.image_url
      FROM appointment_items ai
      JOIN plants_catalog pc ON ai.plant_id = pc.id
    `;

    const data = appointments.map(app => ({
      ...app,
      selected_plants: items
        .filter(item => Number(item.appointment_id) === Number(app.id))
        .map(item => ({ 
          name: item.name_es || "Planta", 
          image: item.image_url || "" 
        }))
    }));

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("ERROR EN GET:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear nueva cita
export async function POST(req: Request) {
  try {
    const { userId } = await auth(); 
    const body = await req.json();
    const sql = getSql();

    const result = await sql`
      INSERT INTO appointments (
        user_id, 
        full_name, 
        phone, 
        email, 
        address_line1, 
        appointment_date, 
        appointment_time, 
        service_type, 
        status
      ) VALUES (
        ${userId || null}, 
        ${body.full_name}, 
        ${body.phone}, 
        ${body.email}, 
        ${body.address_line1}, 
        ${body.appointment_date}, 
        ${body.appointment_time}, 
        ${body.service_type}, 
        'pending'
      ) RETURNING id
    `;

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}