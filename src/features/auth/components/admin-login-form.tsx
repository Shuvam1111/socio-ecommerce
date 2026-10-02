'use client';

import { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { loginAdmin } from '../services/auth-service';

export function AdminLoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!identifier.trim()) {
      toast.error('Username or email is required.');
      return;
    }

    if (!password) {
      toast.error('Password is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      await loginAdmin({
        identifier,
        password,
      });

      toast.success('Admin login successful.');

      window.location.href = '/admin';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to login. Please try again.';

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="size-6" />
        </div>

        <div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>

          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access the Socio Commerce administration panel.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="identifier">Username or Email</Label>

            <Input
              id="identifier"
              type="text"
              value={identifier}
              placeholder="Enter username or email"
              autoComplete="username"
              disabled={isSubmitting}
              onChange={(event) => setIdentifier(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              value={password}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}

            {isSubmitting ? 'Signing in...' : 'Sign in as Admin'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
