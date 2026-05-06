import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};



// Inicializamos Resend con tu API Key de las variables de entorno


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      fullName, serviceType, date, time, city, 
      address_line1, zip_code, phone, email, userId, 
      selectedPlants, userIntent 
    } = body;

    const sql = getSql();

    // Inserción en la tabla de citas
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

    const appointmentId = result[0].id;

    // Inserción de los items del portafolio/plantas
    if (selectedPlants && selectedPlants.length > 0) {
      for (const plantId of selectedPlants) {
        await sql`
          INSERT INTO appointment_items (appointment_id, plant_id)
          VALUES (${appointmentId}, ${plantId})
        `;
      }
    }

    // 2. LÓGICA DE NOTIFICACIÓN POR CORREO
    try {
      await resend.emails.send({
        from: 'Sergio Landscape <notifications@sergiolandscape.com>', // Email por defecto de prueba
        to: ['info@sergiolandscape.com','diegoarmandopehu@gmail.com','sergiolandscapedesign@outlook.com'], // PONE TU CORREO AQUÍ
        subject: `🚨 ${userIntent === 'schedule' ? 'Nueva Cita' : 'Nueva Lista de Plantas'}: ${fullName}`,
        html: `
          <div style="font-family: sans-serif; color: #064e3b; max-width: 600px; border: 1px solid #ecfdf5; border-radius: 20px; padding: 20px;">
            <h1 style="text-transform: uppercase; font-style: italic;">Nueva Solicitud Recibida</h1>
            <hr style="border: 0; border-top: 2px solid #10b981; margin: 20px 0;">
            <p><strong>Cliente:</strong> ${fullName}</p>
            <p><strong>Teléfono:</strong> ${phone}</p>
            <p><strong>Correo:</strong> ${email || 'N/A'}</p>
            <p><strong>Acción:</strong> ${userIntent === 'schedule' ? '📅 Visita Agendada' : '📩 Solo envío de lista'}</p>
            ${userIntent === 'schedule' ? `<p><strong>Fecha y Hora:</strong> ${date} a las ${time}</p>` : ''}
            <p><strong>Plantas en la lista:</strong> ${selectedPlants?.length || 0}</p>
            <p><strong>Ubicación:</strong> ${address_line1}, ${city}, ${zip_code}</p>
            <div style="margin-top: 30px;">
              <a href="https://sergiolandscape.com/appointments" style="background-color: #064e3b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold;">Ver en el Panel</a>
            </div>
          </div>
        `
      });
    } catch (mailError) {
      // Si el correo falla, no detenemos la respuesta del cliente
      console.error("Error enviando el correo:", mailError);
    }

    return NextResponse.json({ 
      success: true, 
      id: appointmentId,
      message: "Cita guardada y notificación enviada" 
    });

  } catch (error: any) {
    console.error("Error en Neon:", error.message);
    return NextResponse.json({ 
      error: "Error al guardar", 
      details: error.message 
    }, { status: 500 });
  }
}
/*
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
  */