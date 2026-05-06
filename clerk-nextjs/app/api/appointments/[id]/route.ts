import { neon } from '@neondatabase/serverless';
import { NextResponse, NextRequest } from 'next/server';

const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};

// Definimos la interfaz para que TypeScript sepa que params es una Promesa
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext // Cambiamos la estructura aquí
) {
  try {
    // 1. IMPORTANTE: Usar await para obtener los params
    const { id } = await context.params;
    const { status } = await request.json();

    if (!id || id === 'undefined' || !status) {
      return NextResponse.json({ error: "ID o Status faltante" }, { status: 400 });
    }

    const sql = getSql();
    const numericId = BigInt(id);

    const result = await sql`
      UPDATE appointments 
      SET status = ${status} 
      WHERE id = ${numericId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "No se encontró la cita" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Error en PATCH:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext // Cambiamos la estructura aquí también
) {
  try {
    // 2. IMPORTANTE: Usar await para obtener el id
    const { id } = await context.params;
    
    const sql = getSql();
    const numericId = BigInt(id);

    await sql`DELETE FROM appointments WHERE id = ${numericId}`;

    return NextResponse.json({ message: "Registro eliminado" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}