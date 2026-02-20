import { getAllProducts } from '@/lib/data';
import { getAllVisibilityStates } from '@/lib/db';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const products = getAllProducts();
  const visibilityStates = await getAllVisibilityStates();

  // Convert Map to plain object for client component
  const visibility: Record<number, boolean> = {};
  for (const [id, visible] of visibilityStates) {
    visibility[id] = visible;
  }

  return <AdminDashboard products={products} initialVisibility={visibility} />;
}
