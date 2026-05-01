import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob'; // Importamos la herramienta de subida

const getSql = () => {
  const rawUrl = process.env.DATABASE_URL || "";
  const connectionString = rawUrl.split('&')[0].trim();
  return neon(connectionString);
};

export async function GET() {
  try {
    const sql = getSql();
    const data = await sql`SELECT * FROM plants_catalog ORDER BY id DESC`;
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const name_en = formData.get('name_en') as string;
    const name_es = formData.get('name_es') as string;
    const care_level = formData.get('care_level') as string;
    const file = formData.get('file') as File;

    // --- LÓGICA DE CARGA REAL ---
    let finalImageUrl = "/garden1.webp"; 

    if (file && file.size > 0) {
      // Subimos el archivo a Vercel Blob
      // El 'access: public' permite que la imagen sea visible en la web
      const blob = await put(file.name, file, {
        access: 'public',
      });
      finalImageUrl = blob.url; // Esta es la URL real de internet (https://...)
    }
    // ----------------------------

    const sql = getSql();
    const result = await sql`
      INSERT INTO plants_catalog (name_en, name_es, care_level, image_url)
      VALUES (${name_en}, ${name_es}, ${care_level}, ${finalImageUrl})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });

  } catch (error: any) {
    console.error("Error al subir:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE se mantiene igual...
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const sql = getSql();
    await sql`DELETE FROM plants_catalog WHERE id = ${id}`;
    return NextResponse.json({ message: "Planta eliminada" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}