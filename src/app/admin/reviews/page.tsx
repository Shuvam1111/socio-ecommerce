import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminReviews } from '@/features/reviews/components/admin-reviews';
export default function AdminReviewsPage() {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <main className="ml-16 h-screen min-w-0 flex-1 overflow-y-auto p-6 sm:ml-64 lg:p-8">
        <AdminReviews />
      </main>
    </div>
  );
}
