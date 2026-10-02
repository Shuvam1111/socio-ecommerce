import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminResourcePage } from '@/features/admin/components/admin-resource-page';

export default function AdminProductsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-6 lg:p-8">
        <AdminResourcePage resource="products" />
      </main>
    </div>
  );
}
