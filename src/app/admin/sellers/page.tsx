import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminSellers } from '@/features/admin/components/admin-sellers';

export default function AdminSellersPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-6 lg:p-8">
        <AdminSellers />
      </main>
    </div>
  );
}
