import { neon } from '@neondatabase/serverless';
import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import {
  badRequest,
  isAllowedStatus,
  parseNumericId,
  readJson,
  serverError,
} from '@/lib/security';

const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};

// params es una Promesa en Next.js 15/16
interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH: cambiar estado de una cita (SOLO ADMIN)
export async function PATCH(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id: rawId } = await context.params;
    const id = parseNumericId(rawId);
    if (!id) return badRequest('ID inválido');

    const body = await readJson(request);
    if (!body || !isAllowedStatus(body.status)) return badRequest('Estado inválido');

    const sql = getSql();
    const result = await sql`
      UPDATE appointments
      SET status = ${body.status}
      WHERE id = ${BigInt(id)}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "No se encontró la cita" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return serverError('appointments/[id]:PATCH', error);
  }
}

// DELETE: borrar una cita (SOLO ADMIN)
export async function DELETE(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id: rawId } = await context.params;
    const id = parseNumericId(rawId);
    if (!id) return badRequest('ID inválido');

    const sql = getSql();
    await sql`DELETE FROM appointments WHERE id = ${BigInt(id)}`;

    return NextResponse.json({ message: "Registro eliminado" });
  } catch (error) {
    return serverError('appointments/[id]:DELETE', error);
  }
}