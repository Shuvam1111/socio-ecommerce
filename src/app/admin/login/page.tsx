import { AdminLoginForm } from '@/features/auth';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 px-4 py-10">
      <AdminLoginForm />
    </main>
  );
}
