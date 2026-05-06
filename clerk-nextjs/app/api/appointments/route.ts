import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Resend } from 'resend';


const resend = new Resend(process.env.RESEND_API_KEY);

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

    // 1. Inserción en la base de datos
    const result = await sql`
      INSERT INTO appointments (
        user_id, full_name, phone, email, address_line1, 
        appointment_date, appointment_time, service_type, status
      ) VALUES (
        ${userId || null}, ${body.full_name}, ${body.phone}, 
        ${body.email || null}, ${body.address_line1}, ${body.appointment_date}, 
        ${body.appointment_time}, ${body.service_type}, 'pending'
      ) RETURNING id
    `;

    const appointmentId = result[0].id;

    // 2. LÓGICA DE NOTIFICACIÓN POR CORREO
    try {
      await resend.emails.send({
        from: 'Sergio Landscape <notifications@sergiolandscape.com>',
        to: ['info@sergiolandscape.com','diegoarmandopehu@gmail.com','sergiolandscapedesign@outlook.com'],
        subject: `📅 NUEVA VISITA AGENDADA: ${body.full_name}`,
        html: `
          <div style="font-family: sans-serif; color: #064e3b; max-width: 600px; border: 1px solid #ecfdf5; border-radius: 20px; padding: 25px; background-color: #f0fdf4;">
            <h1 style="text-transform: uppercase; font-style: italic; color: #064e3b;">Nueva Cita Programada</h1>
            <p style="color: #166534;">Se ha registrado una solicitud de visita a domicilio a través del sitio web.</p>
            <hr style="border: 0; border-top: 2px solid #10b981; margin: 20px 0;">
            
            <div style="background-color: white; padding: 20px; border-radius: 15px; border: 1px solid #dcfce7;">
              <p><strong>Cliente:</strong> ${body.full_name}</p>
              <p><strong>Teléfono:</strong> ${body.phone}</p>
              <p><strong>Correo:</strong> ${body.email || 'No proporcionado'}</p>
              <p><strong>Servicio:</strong> ${body.service_type}</p>
              <p style="font-size: 18px; color: #059669;"><strong>Fecha:</strong> ${body.appointment_date}</p>
              <p style="font-size: 18px; color: #059669;"><strong>Hora:</strong> ${body.appointment_time}</p>
              <p><strong>Dirección:</strong> ${body.address_line1}</p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <a href="https://sergiolandscape.com/appointments" style="background-color: #064e3b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
                Ver en el Panel de Administrador
              </a>
            </div>
          </div>
        `
      });
    } catch (mailError) {
      console.error("Error enviando correo de cita:", mailError);
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Error en POST appointments:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


/*
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
  */


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