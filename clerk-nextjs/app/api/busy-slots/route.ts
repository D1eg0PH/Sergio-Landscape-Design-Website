import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// 1. CRÍTICO: Fuerza a Next.js a no usar caché. 
// Sin esto, el navegador siempre verá la misma lista de horarios aunque haya citas nuevas.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({ error: "Config Error" }, { status: 500 }); 
    }

    const sql = neon(databaseUrl);
    
    // 2. Ejecutamos la consulta
    const data = await sql`
      SELECT appointment_date, appointment_time 
      FROM appointments 
      WHERE status != 'cancelled'
    `;

    // 3. Agregamos cabeceras para evitar caché en el navegador
    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
    
  } catch (error: any) {
    console.error("Error en busy-slots:", error.message);
    return NextResponse.json([]); 
  }
}