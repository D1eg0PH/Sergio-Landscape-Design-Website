import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Resend } from 'resend';
import { requireAdmin } from '@/lib/admin';
import {
  badRequest,
  cleanLine,
  escapeHtml,
  isAllowedStatus,
  isBookableDate,
  isEmail,
  isPhone,
  isSlotTaken,
  isUniqueViolation,
  normalizeSlot,
  parseNumericId,
  rateLimit,
  readJson,
  serverError,
  tooManyRequests,
} from '@/lib/security';

const resend = new Resend(process.env.RESEND_API_KEY);

const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};

// ---------------------------------------------------------------------------
// GET
//  - ?mode=availability  -> público (solo fechas/horas ocupadas, para el calendario)
//  - sin mode            -> SOLO ADMIN (panel de Sergio, con datos de clientes)
// ---------------------------------------------------------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');
    const sql = getSql();

    if (mode === 'availability') {
      const busySlots = await sql`
        SELECT appointment_date, appointment_time, status
        FROM appointments
        WHERE status != 'cancelled'
      `;
      return NextResponse.json(busySlots);
    }

    const denied = await requireAdmin();
    if (denied) return denied;

    const appointments = await sql`SELECT * FROM appointments ORDER BY created_at DESC`;

    const items = await sql`
      SELECT ai.appointment_id, pc.name_es, pc.image_url
      FROM appointment_items ai
      JOIN plants_catalog pc ON ai.plant_id = pc.id
    `;

    const data = appointments.map(app => {
      const plantsDetails = items
        .filter(item => String(item.appointment_id) === String(app.id))
        .map(item => ({
          name: item.name_es || "Planta",
          image: item.image_url || ""
        }));

      return { ...app, selected_plants: plantsDetails };
    });

    return NextResponse.json(data);
  } catch (error) {
    return serverError('appointments:GET', error);
  }
}

// ---------------------------------------------------------------------------
// POST: agendar una visita (público, lo usa /schedule)
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  if (!rateLimit(req, 'appointments')) return tooManyRequests();

  try {
    const { userId } = await auth();
    const body = await readJson(req);
    if (!body) return badRequest('Solicitud inválida / Invalid request');

    const fullName = cleanLine(body.full_name);
    const phone = cleanLine(body.phone);
    const email = cleanLine(body.email);
    const address = cleanLine(body.address_line1);
    const service = cleanLine(body.service_type) || 'Landscape Design Consultation';
    const date = body.appointment_date;
    const time = normalizeSlot(body.appointment_time);

    if (!fullName || fullName.length > 100) return badRequest('Nombre inválido / Invalid name');
    if (!isPhone(phone)) return badRequest('Teléfono inválido / Invalid phone');
    if (email && !isEmail(email)) return badRequest('Correo inválido / Invalid email');
    if (!address || address.length > 200) return badRequest('Dirección inválida / Invalid address');
    if (service.length > 100) return badRequest('Servicio inválido / Invalid service');
    if (!isBookableDate(date)) return badRequest('Fecha inválida / Invalid date');
    if (!time) return badRequest('Horario inválido / Invalid time slot');

    const sql = getSql();

    if (await isSlotTaken(sql, date, time)) {
      return NextResponse.json(
        { error: 'Ese horario ya no está disponible / That time slot is no longer available' },
        { status: 409 }
      );
    }

    let result;
    try {
      result = await sql`
        INSERT INTO appointments (
          user_id, full_name, phone, email, address_line1,
          appointment_date, appointment_time, service_type, status
        ) VALUES (
          ${userId || null}, ${fullName}, ${phone},
          ${email || null}, ${address}, ${date},
          ${time}, ${service}, 'pending'
        ) RETURNING id
      `;
    } catch (dbError) {
      if (isUniqueViolation(dbError)) {
        return NextResponse.json(
          { error: 'Ese horario ya no está disponible / That time slot is no longer available' },
          { status: 409 }
        );
      }
      throw dbError;
    }

    // Notificación por correo (todo lo que viene del usuario va escapado)
    try {
      await resend.emails.send({
        from: 'Sergio Landscape <notifications@sergiolandscape.com>',
        to: ['info@sergiolandscape.com','diegoarmandopehu@gmail.com','sergiolandscapedesign@outlook.com'],
        subject: `📅 NUEVA VISITA AGENDADA: ${fullName}`,
        html: `
          <div style="font-family: sans-serif; color: #064e3b; max-width: 600px; border: 1px solid #ecfdf5; border-radius: 20px; padding: 25px; background-color: #f0fdf4;">
            <h1 style="text-transform: uppercase; font-style: italic; color: #064e3b;">Nueva Cita Programada</h1>
            <p style="color: #166534;">Se ha registrado una solicitud de visita a domicilio a través del sitio web.</p>
            <hr style="border: 0; border-top: 2px solid #10b981; margin: 20px 0;">

            <div style="background-color: white; padding: 20px; border-radius: 15px; border: 1px solid #dcfce7;">
              <p><strong>Cliente:</strong> ${escapeHtml(fullName)}</p>
              <p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>
              <p><strong>Correo:</strong> ${escapeHtml(email || 'No proporcionado')}</p>
              <p><strong>Servicio:</strong> ${escapeHtml(service)}</p>
              <p style="font-size: 18px; color: #059669;"><strong>Fecha:</strong> ${escapeHtml(date)}</p>
              <p style="font-size: 18px; color: #059669;"><strong>Hora:</strong> ${escapeHtml(time)}</p>
              <p><strong>Dirección:</strong> ${escapeHtml(address)}</p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <a href="https://sergiolandscape.com/appointments" style="background-color: #064e3b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
                Ver en el Panel de Administrador
              </a>
            </div>
          </div>
        `
      });
    } catch (mailError) {
      console.error("Error enviando correo de cita:", mailError);
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return serverError('appointments:POST', error);
  }
}

// ---------------------------------------------------------------------------
// PATCH: cambiar estado de una cita (SOLO ADMIN)  ->  /api/appointments?id=123
// ---------------------------------------------------------------------------
export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const id = parseNumericId(new URL(req.url).searchParams.get('id'));
    if (!id) return badRequest('ID inválido');

    const body = await readJson(req);
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
    return serverError('appointments:PATCH', error);
  }
}

// ---------------------------------------------------------------------------
// DELETE: borrar una cita (SOLO ADMIN)  ->  /api/appointments?id=123
// ---------------------------------------------------------------------------
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const id = parseNumericId(new URL(req.url).searchParams.get('id'));
    if (!id) return badRequest('ID inválido');

    const sql = getSql();
    await sql`DELETE FROM appointments WHERE id = ${BigInt(id)}`;

    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error) {
    return serverError('appointments:DELETE', error);
  }
}