import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

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