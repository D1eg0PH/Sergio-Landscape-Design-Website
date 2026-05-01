import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error("DATABASE_URL no encontrada en las variables de entorno");
      return NextResponse.json([]); 
    }

    const sql = neon(databaseUrl);
    
    // Consultamos las citas que NO estén canceladas para bloquear esos horarios
    const data = await sql`
      SELECT appointment_date, appointment_time 
      FROM appointments 
      WHERE status != 'cancelled'
    `;

    // Retornamos los datos o un array vacío si no hay registros
    return NextResponse.json(data || []);
    
  } catch (error) {
    console.error("Error en la API de busy-slots:", error);
    // Devolvemos [] para que el frontend no truene si hay un error de red o DB
    return NextResponse.json([]); 
  }
}