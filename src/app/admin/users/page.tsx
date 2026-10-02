import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminUsers } from '@/features/admin/components/admin-users';

export default function AdminUsersPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-6 lg:p-8">
        <AdminUsers />
      </main>
    </div>
  );
}
