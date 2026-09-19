import { requireAdminPage } from '@/lib/admin';

// Panel de administración: solo usuarios con publicMetadata.role === 'admin'.
// Esta verificación corre en el SERVIDOR antes de enviar cualquier HTML.
export default async function AppointmentsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <>{children}</>;
}