import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAdmin } from '@/lib/admin';
import {
  badRequest,
  cleanLine,
  cleanText,
  escapeHtml,
  isEmail,
  isUuid,
  rateLimit,
  readJson,
  serverError,
  tooManyRequests,
} from '@/lib/security';

const getSql = () => {
  const connectionString = (process.env.DATABASE_URL || "").split('&')[0].trim();
  return neon(connectionString);
};

const resend = new Resend(process.env.RESEND_API_KEY);

// ---------------------------------------------------------------------------
// GET: leer mensajes (SOLO ADMIN)
// ---------------------------------------------------------------------------
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const sql = getSql();
    const data = await sql`SELECT * FROM contact_messages ORDER BY created_at DESC`;
    return NextResponse.json(data);
  } catch (error) {
    return serverError('contact:GET', error);
  }
}

// ---------------------------------------------------------------------------
// POST: enviar mensaje desde el formulario (público)
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  if (!rateLimit(req, 'contact')) return tooManyRequests();

  try {
    const body = await readJson(req);
    if (!body) return badRequest('Solicitud inválida / Invalid request');

    const name = cleanLine(body.name);
    const email = cleanLine(body.email);
    const message = cleanText(body.message);

    if (!name || !email || !message) {
      return badRequest('Todos los campos son obligatorios / All fields are required');
    }
    if (name.length > 100 || message.length > 3000) {
      return badRequest('Texto demasiado largo / Text too long');
    }
    if (!isEmail(email)) {
      return badRequest('Correo inválido / Invalid email');
    }

    const sql = getSql();
    await sql`
      INSERT INTO contact_messages (name, email, message)
      VALUES (${name}, ${email}, ${message})
    `;

    // Notificación por correo (todo lo que viene del usuario va escapado)
    try {
      await resend.emails.send({
        from: 'Sergio Landscape <notifications@sergiolandscape.com>',
        to: ['info@sergiolandscape.com','diegoarmandopehu@gmail.com','sergiolandscapedesign@outlook.com'],
        subject: `✉️ NUEVO MENSAJE: ${name}`,
        html: `
          <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 24px; padding: 30px; background-color: #ffffff;">
            <h2 style="color: #065f46; text-transform: uppercase; letter-spacing: -0.05em; font-style: italic;">Consulta de Contacto</h2>
            <p style="color: #64748b; font-size: 14px;">Has recibido un nuevo mensaje desde el formulario de contacto del sitio web.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;">

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px;">
              <p style="margin: 0 0 10px 0;"><strong>Nombre:</strong> ${escapeHtml(name)}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p style="margin: 20px 0 5px 0; font-weight: bold; color: #065f46;">Mensaje:</p>
              <p style="margin: 0; line-height: 1.6; color: #334155;">${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <a href="mailto:${escapeHtml(email)}" style="background-color: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px;">Responder al Cliente</a>
            </div>
          </div>
        `
      });
    } catch (mailError) {
      console.error("Error enviando correo de contacto:", mailError);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return serverError('contact:POST', error);
  }
}

// ---------------------------------------------------------------------------
// DELETE: borrar mensaje (SOLO ADMIN)
// ---------------------------------------------------------------------------
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!isUuid(id)) return badRequest('ID inválido');

    const sql = getSql();
    const result = await sql`
      DELETE FROM contact_messages
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "No se encontró el mensaje" }, { status: 404 });
    }

    return NextResponse.json({ message: "Mensaje eliminado" });
  } catch (error) {
    return serverError('contact:DELETE', error);
  }
}