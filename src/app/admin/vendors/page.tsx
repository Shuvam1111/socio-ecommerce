import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminVendors } from '@/features/admin/components/admin-vendors';

export default function AdminVendorsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-6 lg:p-8">
        <AdminVendors />
      </main>
    </div>
  );
}
