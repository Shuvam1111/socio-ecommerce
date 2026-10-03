import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { PendingVendors } from '@/features/admin/components/pending-vendors';

export default function PendingVendorsPage() {
  return (
    <div className="fixed inset-0 box-border overflow-hidden bg-background">
      <AdminSidebar />

      <main className="ml-16 h-screen min-w-0 overflow-hidden p-6 sm:ml-64 lg:p-8">
        <PendingVendors />
      </main>
    </div>
  );
}
