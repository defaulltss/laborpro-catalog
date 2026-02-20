import { getAllBaseProducts, getCategories } from '@/lib/data';
import { getAllVisibilityStates, getProductOverrides } from '@/lib/db';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const baseProducts = getAllBaseProducts();
  const [visibilityStates, overridesMap, categories] = await Promise.all([
    getAllVisibilityStates(),
    getProductOverrides(),
    Promise.resolve(getCategories()),
  ]);

  // Convert Maps to plain objects for client component
  const visibility: Record<number, boolean> = {};
  for (const [id, visible] of visibilityStates) {
    visibility[id] = visible;
  }

  const overrides: Record<number, Record<string, unknown>> = {};
  for (const [id, ov] of overridesMap) {
    overrides[id] = ov;
  }

  return (
    <AdminDashboard
      baseProducts={baseProducts}
      initialVisibility={visibility}
      initialOverrides={overrides}
      categories={categories}
    />
  );
}
