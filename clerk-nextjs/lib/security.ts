import { NextResponse } from 'next/server';
import type { NeonQueryFunction } from '@neondatabase/serverless';

/* -------------------------------------------------------------------------- */
/*  Texto y HTML                                                              */
/* -------------------------------------------------------------------------- */

/** Escapa texto del usuario antes de meterlo en HTML (correos). */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Texto de una sola línea: quita saltos de línea y caracteres de control. */
export function cleanLine(value: unknown): string {
  if (typeof value !== 'string') return '';
  let out = '';
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    out += code < 32 || code === 127 ? ' ' : ch;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** Texto multilínea (mensajes): conserva \n, quita el resto de control. */
export function cleanText(value: unknown): string {
  if (typeof value !== 'string') return '';
  let out = '';
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code === 10) out += ch;
    else if (code === 13) continue;
    else out += code < 32 || code === 127 ? ' ' : ch;
  }
  return out.trim();
}

/* -------------------------------------------------------------------------- */
/*  Validadores                                                               */
/* -------------------------------------------------------------------------- */

export function isEmail(v: string): boolean {
  return v.length <= 254 && /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(v);
}

export function isPhone(v: string): boolean {
  return /^[0-9+()\-.\s]{7,20}$/.test(v) && (v.match(/\d/g)?.length ?? 0) >= 7;
}

export function isUuid(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  );
}

/** Devuelve el id como string numérico seguro, o null si no es válido. */
export function parseNumericId(v: unknown): string | null {
  return typeof v === 'string' && /^\d{1,15}$/.test(v) ? v : null;
}

export const ALLOWED_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;
export type AppointmentStatus = (typeof ALLOWED_STATUSES)[number];

export function isAllowedStatus(v: unknown): v is AppointmentStatus {
  return typeof v === 'string' && (ALLOWED_STATUSES as readonly string[]).includes(v);
}

/* -------------------------------------------------------------------------- */
/*  Fechas y horarios de citas                                                */
/* -------------------------------------------------------------------------- */

/**
 * Horarios permitidos. Deben coincidir con `slots` en app/schedule/page.tsx.
 * Si algún día agregas o quitas horarios allá, actualízalos aquí también.
 */
export const ALLOWED_SLOTS = [
  '08:00:00',
  '10:00:00',
  '12:00:00',
  '14:00:00',
  '16:00:00',
  '18:00:00',
] as const;

/** Acepta "08:00" o "08:00:00" y devuelve "08:00:00" si es un horario válido. */
export function normalizeSlot(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = /^\d{2}:\d{2}$/.test(v) ? `${v}:00` : v;
  return (ALLOWED_SLOTS as readonly string[]).includes(t) ? t : null;
}

/** Fecha de hoy (yyyy-MM-dd) en la zona horaria del negocio (Lakeland, FL). */
function todayInBusinessTz(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

/** Válida "yyyy-MM-dd", que exista en el calendario, que no sea pasada y que esté a ≤ 1 año. */
export function isBookableDate(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;

  const parsed = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== v) return false;

  const today = todayInBusinessTz();
  const max = new Date(`${today}T00:00:00Z`);
  max.setUTCDate(max.getUTCDate() + 366);

  return v >= today && v <= max.toISOString().slice(0, 10);
}

/** true si ya existe una cita activa en esa fecha y hora. */
export async function isSlotTaken(
  sql: NeonQueryFunction<false, false>,
  date: string,
  time: string
): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM appointments
    WHERE appointment_date = ${date}
      AND appointment_time = ${time}
      AND status != 'cancelled'
    LIMIT 1
  `;
  return rows.length > 0;
}

/** Error de restricción única de Postgres (por si creas el índice opcional de horarios). */
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === '23505';
}

/* -------------------------------------------------------------------------- */
/*  Límite de peticiones (por IP)                                             */
/* -------------------------------------------------------------------------- */

/**
 * Límite en memoria, por instancia. Frena el spam básico, pero en serverless
 * cada instancia tiene su propio contador. Para una protección más firme,
 * agrega además una regla de Rate Limiting en Vercel → Firewall.
 */
const buckets = new Map<string, number[]>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return (forwarded?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown').trim();
}

/** true = permitido, false = se pasó del límite. */
export function rateLimit(
  req: Request,
  scope: string,
  limit = 5,
  windowMs = 10 * 60 * 1000
): boolean {
  const now = Date.now();
  const key = `${scope}:${getClientIp(req)}`;
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);

  // Limpieza para que el Map no crezca indefinidamente
  if (buckets.size > 5000) {
    for (const [k, stamps] of buckets) {
      if (stamps.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}

/* -------------------------------------------------------------------------- */
/*  Respuestas                                                                */
/* -------------------------------------------------------------------------- */

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const data: unknown = await req.json();
    return data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function tooManyRequests(): NextResponse {
  return NextResponse.json(
    { error: 'Demasiados intentos, intenta más tarde / Too many requests, try again later' },
    { status: 429 }
  );
}

/** Registra el error real en los logs y responde algo genérico al cliente. */
export function serverError(scope: string, error: unknown): NextResponse {
  console.error(`[${scope}]`, error instanceof Error ? error.message : error);
  return NextResponse.json({ error: 'Error interno / Internal error' }, { status: 500 });
}