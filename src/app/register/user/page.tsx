import { UserRegistrationForm } from '@/features/users/components/user-registration-form';

export default function UserRegistrationPage() {
  return (
    <main className="container mx-auto flex min-h-[calc(100vh-9rem)] items-center justify-center px-4 py-10">
      <UserRegistrationForm />
    </main>
  );
}
