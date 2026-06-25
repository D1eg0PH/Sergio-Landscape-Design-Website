import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Definimos la estructura exacta que requiere el Frontend para que TypeScript no chille
interface BusySlot {
  appointment_date: string;
  appointment_time: string;
}

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error("[API Error]: DATABASE_URL no está definida en las variables de entorno.");
      return NextResponse.json({ error: "Config Error" }, { status: 500 }); 
    }

    const sql = neon(databaseUrl);
    
    // 1. Intentar traer los datos reales de Neon
    const dbData = await sql`
      SELECT appointment_date, appointment_time 
      FROM appointments 
      WHERE status != 'cancelled'
    `;

    // 2. Lista temporal para estructurar tus bloqueos manuales fijos
    const manualBlocks: Array<{ date: string; time: string }> = [];

    // --- Martes 30 de Junio ---
    manualBlocks.push(
      { date: "2026-06-30", time: "08:00" },
      { date: "2026-06-30", time: "10:00" },
      { date: "2026-06-30", time: "12:00" }
    );

    // --- Miércoles 1 de Julio ---
    manualBlocks.push(
      { date: "2026-07-01", time: "08:00" },
      { date: "2026-07-01", time: "10:00" },
      { date: "2026-07-01", time: "12:00" }
    );

    // --- Viernes 3 y Sábado 4 de Julio ---
    const fullDaySlots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
    fullDaySlots.forEach(slot => {
      manualBlocks.push({ date: "2026-06-25", time:slot})
      manualBlocks.push({ date: "2026-06-26", time:slot})
      manualBlocks.push({ date: "2026-07-03", time: slot });
      manualBlocks.push({ date: "2026-07-04", time: slot });
    });

    // 3. Mapeo seguro con tipado explícito para evitar fallos de compilación
    const formattedBlocks: BusySlot[] = manualBlocks.map(block => ({
      appointment_date: block.date,
      appointment_time: block.time + ":00"
    }));

    // Aseguramos que dbData actúe como un Array plano compatible
    const cleanDbData: BusySlot[] = (dbData || []).map((row: any) => ({
      appointment_date: row.appointment_date,
      appointment_time: row.appointment_time
    }));

    // 4. Combinamos ambos arrays de forma segura
    const allBusySlots: BusySlot[] = [...cleanDbData, ...formattedBlocks];

    return NextResponse.json(allBusySlots, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
    
  } catch (error: any) {
    // ESTO ES CLAVE: Ahora verás en tu consola de VSCode la razón exacta si vuelve a fallar
    console.error("--- [CRITICAL ERROR IN BUSY-SLOTS ROUTE] ---");
    console.error(error);
    console.error("--------------------------------------------");
    return NextResponse.json([], { status: 500 }); 
  }
}
