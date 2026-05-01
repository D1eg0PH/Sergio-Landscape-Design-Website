import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      fullName, serviceType, date, time, city, 
      address_line1, zip_code, phone, email, userId, 
      selectedPlants, userIntent 
    } = body;

    const sql = getSql();

    // ✅ CORRECCIÓN 1: Eliminamos 'id' del INSERT. 
    // Usamos 'RETURNING id' para obtener el que genere Neon.
    const result = await sql`
      INSERT INTO appointments (
        service_type, appointment_date, appointment_time, 
        full_name, city, zip_code, address_line1, 
        status, phone, email, user_id
      )
      VALUES (
        ${serviceType || 'Landscape Design Consultation'}, 
        ${userIntent === 'list_only' ? null : date}, 
        ${userIntent === 'list_only' ? null : time}, 
        ${fullName}, 
        ${city || 'Lakeland'}, 
        ${zip_code || null}, 
        ${address_line1 || null}, 
        'pending', 
        ${phone}, 
        ${email}, 
        ${userId}
      )
      RETURNING id;
    `;

    const appointmentId = result[0].id; // El ID real generado por la DB

    // ✅ CORRECCIÓN 2: Insertar items sin generar 'id' manual.
    if (selectedPlants && selectedPlants.length > 0) {
      for (const plantId of selectedPlants) {
        await sql`
          INSERT INTO appointment_items (appointment_id, plant_id)
          VALUES (${appointmentId}, ${plantId})
        `;
      }
    }

    return NextResponse.json({ 
      success: true, 
      id: appointmentId,
      message: "Cita y plantas guardadas con éxito" 
    });

  } catch (error: any) {
    console.error("Error en Neon:", error.message);
    return NextResponse.json({ 
      error: "Error al guardar", 
      details: error.message 
    }, { status: 500 });
  }
}