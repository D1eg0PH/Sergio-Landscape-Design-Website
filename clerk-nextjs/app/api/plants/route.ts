import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Configuración de conexión a Neon
const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    // 1. Validación de imagen (Único campo obligatorio)
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "La imagen es obligatoria" }, { status: 400 });
    }

    // Campos opcionales
    const name_en = (formData.get('name_en') as string)?.trim() || "";
    const name_es = (formData.get('name_es') as string)?.trim() || "";
    const care_level = (formData.get('care_level') as string) || "Easy";
    const category = (formData.get('category') as string)?.trim() || "";

    // 2. Intento de subida a Vercel Blob con diagnóstico
    let finalImageUrl = "";
    try {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("Falta la variable BLOB_READ_WRITE_TOKEN en el servidor");
      }

      const blob = await put(file.name, file, { 
        access: 'public',
        addRandomSuffix: true 
      });
      
      finalImageUrl = blob.url;
      console.log("✅ Imagen subida con éxito:", finalImageUrl);

    } catch (blobError: any) {
      console.error("❌ ERROR DETALLADO DE VERCEL BLOB:", blobError);
      return NextResponse.json({ 
        error: "Failed to upload image to storage", 
        details: blobError.message 
      }, { status: 500 });
    }

    // 3. Inserción en la base de datos Neon
    try {
      const sql = getSql();
      const result = await sql`
        INSERT INTO plants_catalog (name_en, name_es, care_level, image_url, category) 
        VALUES (${name_en}, ${name_es}, ${care_level}, ${finalImageUrl}, ${category})
        RETURNING *
      `;
      return NextResponse.json(result[0], { status: 201 });
    } catch (dbError: any) {
      console.error("❌ ERROR DE BASE DE DATOS:", dbError.message);
      return NextResponse.json({ 
        error: "Error al guardar en base de datos", 
        details: dbError.message 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("❌ ERROR GENERAL:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET y DELETE simplificados
export async function GET() {
  try {
    const sql = getSql();
    const data = await sql`SELECT * FROM plants_catalog ORDER BY id DESC`;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const sql = getSql();
    await sql`DELETE FROM plants_catalog WHERE id = ${id}`;
    return NextResponse.json({ message: "Eliminado" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}