import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');
    const sql = getSql();

    if (mode === 'availability') {
      const busySlots = await sql`
        SELECT appointment_date, appointment_time, status 
        FROM appointments 
        WHERE status != 'cancelled'
      `;
      return NextResponse.json(busySlots);
    }

    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Traemos todas para el panel de Sergio
    const appointments = await sql`SELECT * FROM appointments ORDER BY created_at DESC`;
    
    const items = await sql`
      SELECT ai.appointment_id, pc.name_es, pc.image_url
      FROM appointment_items ai
      JOIN plants_catalog pc ON ai.plant_id = pc.id
    `;

    const data = appointments.map(app => {
      const plantsDetails = items
        .filter(item => String(item.appointment_id) === String(app.id))
        .map(item => ({
          name: item.name_es || "Planta",
          image: item.image_url || "" 
        }));
      
      return { ...app, selected_plants: plantsDetails };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const sql = getSql();

    const result = await sql`
      INSERT INTO appointments (
        user_id, full_name, phone, email, address_line1, 
        appointment_date, appointment_time, service_type, status
      ) VALUES (
        ${userId || null}, ${body.full_name}, ${body.phone}, 
        ${body.email}, ${body.address_line1}, ${body.appointment_date}, 
        ${body.appointment_time}, ${body.service_type}, 'pending'
      ) RETURNING id
    `;

    return NextResponse.json(result[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ESTA ES LA FUNCIÓN QUE TE FALTABA PARA ACTUALIZAR EL STATUS
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const { status } = await req.json();
    const sql = getSql();

    if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

    const result = await sql`
      UPDATE appointments 
      SET status = ${status} 
      WHERE id = ${BigInt(id)} 
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    const sql = getSql();

    if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

    await sql`DELETE FROM appointments WHERE id = ${BigInt(id)}`;

    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}