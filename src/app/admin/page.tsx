import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminDashboard } from '@/features/admin/components/admin-dashboard';

export default function AdminPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <AdminDashboard />
      </main>
    </div>
  );
}
