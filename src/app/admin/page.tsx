import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminDashboard } from '@/features/admin/components/admin-dashboard';

export default function AdminPage() {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      <AdminSidebar />

      <main className="ml-16 box-border flex h-dvh min-h-0 min-w-0 flex-1 overflow-hidden p-4 sm:ml-64 sm:p-6 lg:p-8">
        <AdminDashboard />
      </main>
    </div>
  );
}
