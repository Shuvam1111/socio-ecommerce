import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminSellers } from '@/features/admin/components/admin-sellers';

export default function AdminSellersPage() {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <AdminSidebar />

      <main className="ml-16 h-screen min-w-0 flex-1 overflow-hidden p-6 sm:ml-64 lg:p-8">
        <AdminSellers />
      </main>
    </div>
  );
}
