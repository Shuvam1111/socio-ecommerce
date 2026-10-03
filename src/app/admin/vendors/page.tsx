import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminVendors } from '@/features/admin/components/admin-vendors';

export default function AdminVendorsPage() {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      <AdminSidebar />

      <main className="ml-16 min-w-0 flex-1 overflow-y-auto p-6 sm:ml-64 lg:p-8">
        <AdminVendors />
      </main>
    </div>
  );
}
