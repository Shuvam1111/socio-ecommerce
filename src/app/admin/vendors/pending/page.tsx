import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { PendingVendors } from '@/features/admin/components/pending-vendors';

export default function PendingVendorsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-6 lg:p-8">
        <PendingVendors />
      </main>
    </div>
  );
}
