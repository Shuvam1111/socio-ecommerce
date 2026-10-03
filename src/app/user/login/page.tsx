import { UserLoginForm } from '@/features/auth/components/user-login-form';

export default function UserLoginPage() {
  return (
    <main className="container mx-auto flex min-h-[calc(100vh-9rem)] items-center justify-center px-4 py-10">
      <UserLoginForm />
    </main>
  );
}
