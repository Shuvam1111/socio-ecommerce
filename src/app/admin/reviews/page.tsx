import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminReviews } from '@/features/reviews/components/admin-reviews';
export default function AdminReviewsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-6 lg:p-8">
        <AdminReviews />
      </main>
    </div>
  );
}
