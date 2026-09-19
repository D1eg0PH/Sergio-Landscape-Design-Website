import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAdmin } from '@/lib/admin';
import { badRequest, cleanLine, parseNumericId, serverError } from '@/lib/security';

const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};

// Vercel limita el cuerpo de una función a ~4.5 MB, así que 4 MB es el máximo real
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ---------------------------------------------------------------------------
// POST: agregar planta al catálogo (SOLO ADMIN)
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    // 1. Validación de imagen (único campo obligatorio)
    if (!(file instanceof File) || file.size === 0) {
      return badRequest("La imagen es obligatoria");
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return badRequest("Formato no permitido. Usa JPG, PNG o WebP");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return badRequest("La imagen pesa más de 4 MB");
    }

    // Campos opcionales
    const name_en = cleanLine(formData.get('name_en'));
    const name_es = cleanLine(formData.get('name_es'));
    const care_level = cleanLine(formData.get('care_level')) || "Easy";
    const category = cleanLine(formData.get('category'));

    if (name_en.length > 100 || name_es.length > 100 || category.length > 60 || care_level.length > 30) {
      return badRequest("Texto demasiado largo");
    }

    // 2. Subida a Vercel Blob (nombre de archivo saneado)
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("Falta la variable BLOB_READ_WRITE_TOKEN en el servidor");
      return NextResponse.json({ error: "Storage no configurado" }, { status: 500 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80) || 'plant.jpg';
    let finalImageUrl = "";
    try {
      const blob = await put(`plants/${safeName}`, file, {
        access: 'public',
        addRandomSuffix: true,
        contentType: file.type,
      });
      finalImageUrl = blob.url;
    } catch (blobError) {
      return serverError('plants:blob', blobError);
    }

    // 3. Inserción en Neon
    const sql = getSql();
    const result = await sql`
      INSERT INTO plants_catalog (name_en, name_es, care_level, image_url, category)
      VALUES (${name_en}, ${name_es}, ${care_level}, ${finalImageUrl}, ${category})
      RETURNING *
    `;
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    return serverError('plants:POST', error);
  }
}

// ---------------------------------------------------------------------------
// GET: plantas activas (requiere sesión por proxy.ts)
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const sql = getSql();
    const data = await sql`
      SELECT * FROM plants_catalog
      WHERE is_active = TRUE
      ORDER BY id DESC
    `;
    return NextResponse.json(data);
  } catch (error) {
    return serverError('plants:GET', error);
  }
}

// ---------------------------------------------------------------------------
// DELETE: baja lógica de una planta (SOLO ADMIN)
// ---------------------------------------------------------------------------
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const id = parseNumericId(new URL(req.url).searchParams.get('id'));
    if (!id) return badRequest("ID inválido");

    const sql = getSql();
    const result = await sql`
      UPDATE plants_catalog
      SET is_active = FALSE
      WHERE id = ${BigInt(id)}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "No se encontró la planta" }, { status: 404 });
    }

    return NextResponse.json({ message: "Planta archivada con éxito" });
  } catch (error) {
    return serverError('plants:DELETE', error);
  }
}