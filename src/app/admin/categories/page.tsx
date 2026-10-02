import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminCategoryManagement } from '@/features/admin/components/admin-category-management';

export default function AdminCategoriesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-6 lg:p-8">
        <AdminCategoryManagement />
      </main>
    </div>
  );
}
