import { requireAdminPage } from '@/lib/admin';

// Inventario de plantas: solo administradores (verificado en el servidor).
export default async function InventoryLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <>{children}</>;
}