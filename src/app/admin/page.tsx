import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminDashboard } from '@/features/admin/components/admin-dashboard';

export default function AdminPage() {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <AdminSidebar />

      <main className="ml-16 h-screen min-w-0 flex-1 overflow-hidden p-4 sm:ml-64 sm:p-6 lg:p-8">
        <AdminDashboard />
      </main>
    </div>
  );
}
