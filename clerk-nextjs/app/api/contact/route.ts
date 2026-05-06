import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// 1. Configuración de conexión (Igual que en Plants y Appointments)
const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};

// 2. OBTENER MENSAJES (GET)
export async function GET() {
  try {
    const sql = getSql();
    // Seleccionamos los mensajes ordenados por fecha de creación
    const data = await sql`SELECT * FROM contact_messages ORDER BY created_at DESC`;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al obtener mensajes:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const sql = getSql();
    
    const result = await sql`
      INSERT INTO contact_messages (name, email, message)
      VALUES (${name}, ${email}, ${message})
      RETURNING *
    `;

    // 2. NOTIFICACIÓN DE NUEVO MENSAJE
    try {
      await resend.emails.send({
        from: 'Sergio Landscape <notifications@sergiolandscape.com>', // Usa tu dominio verificado
        to: ['info@sergiolandscape.com','diegoarmandopehu@gmail.com','sergiolandscapedesign@outlook.com'],
        subject: `✉️ NUEVO MENSAJE: ${name}`,
        html: `
          <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 24px; padding: 30px; background-color: #ffffff;">
            <h2 style="color: #065f46; text-transform: uppercase; letter-spacing: -0.05em; font-style: italic;">Consulta de Contacto</h2>
            <p style="color: #64748b; font-size: 14px;">Has recibido un nuevo mensaje desde el formulario de contacto del sitio web.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;">
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px;">
              <p style="margin: 0 0 10px 0;"><strong>Nombre:</strong> ${name}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 20px 0 5px 0; font-weight: bold; color: #065f46;">Mensaje:</p>
              <p style="margin: 0; line-height: 1.6; color: #334155;">"${message}"</p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <a href="mailto:${email}" style="background-color: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px;">Responder al Cliente</a>
            </div>
          </div>
        `
      });
    } catch (mailError) {
      console.error("Error enviando correo de contacto:", mailError);
    }

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error("Error al insertar mensaje:", error.message);
    return NextResponse.json({ 
      error: "Error al guardar el mensaje", 
      details: error.message 
    }, { status: 500 });
  }
}

/*
export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // Validación básica
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const sql = getSql();
    
    // El ID se genera solo en Neon porque es gen_random_uuid()
    const result = await sql`
      INSERT INTO contact_messages (name, email, message)
      VALUES (${name}, ${email}, ${message})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error("Error al insertar mensaje:", error.message);
    return NextResponse.json({ 
      error: "Error al guardar el mensaje", 
      details: error.message 
    }, { status: 500 });
  }
}

*/

// 3. BORRAR MENSAJE (DELETE)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const sql = getSql();
    
    // ELIMINAMOS BigInt(id) porque aquí el ID es un UUID (texto)
    const result = await sql`
      DELETE FROM contact_messages 
      WHERE id = ${id} 
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "No se encontró el mensaje" }, { status: 404 });
    }

    return NextResponse.json({ message: "Mensaje eliminado" });
  } catch (error: any) {
    console.error("Error al eliminar mensaje:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
}