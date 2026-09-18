import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

/**
 * Verificación de administrador EN EL SERVIDOR.
 *
 * El rol se guarda en Clerk como publicMetadata.role === 'admin'.
 * publicMetadata solo puede modificarse desde el dashboard de Clerk o con la
 * Backend API, así que un usuario normal no puede darse ese rol a sí mismo.
 */

/**
 * Para rutas de API (route.ts). Uso:
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

/**
 * Para páginas/layouts de administración (Server Components).
 * Si no es admin, redirige al inicio.
 */
export async function requireAdminPage(): Promise<void> {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== 'admin') {
    redirect('/');
  }
}