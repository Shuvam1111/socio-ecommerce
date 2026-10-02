'use client';

import { useState } from 'react';
import { Loader2, LogIn, LockKeyhole, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { loginSeller } from '../services/auth-service';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SellerLoginForm() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!identifier.trim() || !password) {
      toast.error('Please enter your username/email and password.');

      return;
    }

    try {
      setLoading(true);

      const result = await loginSeller({
        identifier,
        password,
      });

      localStorage.setItem('socio-seller', JSON.stringify(result.user));
      localStorage.setItem('socio-seller-token', result.token);

      toast.success('Seller login successful.', {
        description: `Welcome back, ${result.user.firstName}!`,
      });

      router.replace('/seller/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Store className="size-6 text-primary" />
          </div>

          <CardTitle className="text-2xl">Seller Login</CardTitle>

          <CardDescription>Sign in to manage your store and products.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="seller-identifier">Username or Email</Label>

              <div className="relative">
                <Store className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="seller-identifier"
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Enter username or email"
                  className="pl-10"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller-password">Password</Label>

              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="seller-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  Sign In as Seller
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
