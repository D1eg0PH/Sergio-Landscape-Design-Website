import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// 1. Agregamos la función que falta (la que viste en el archivo de Plants)
const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status } = await request.json();

    if (!id || id === 'undefined' || !status) {
      return NextResponse.json({ error: "ID o Status faltante" }, { status: 400 });
    }

    // 2. Usamos getSql() igual que en el archivo de plantas
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const sql = getSql();
    const numericId = BigInt(id);

    await sql`DELETE FROM appointments WHERE id = ${numericId}`;

    return NextResponse.json({ message: "Registro eliminado" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}