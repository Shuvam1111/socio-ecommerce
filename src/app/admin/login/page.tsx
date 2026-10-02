import { AdminLoginForm } from '@/features/auth';

export default function AdminLoginPage() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border-2 border-primary bg-primary/10 px-4 py-3 text-center text-sm font-semibold tracking-wide text-primary shadow-sm">
        <p>{'🚀 DEPLOYMENT TEST — Blob v0'}</p>
        {commit ? <p className="mt-1 font-mono text-xs font-normal">Commit {commit}</p> : null}
      </div>
      <AdminLoginForm />
    </main>
  );
}
