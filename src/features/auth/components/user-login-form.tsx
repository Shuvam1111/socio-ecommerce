'use client';

/**
 * =====================================================================
 * USER (BUYER) LOGIN  (redesigned UI, same login logic as the MVP)
 * =====================================================================
 * DESIGN SYSTEM FOR ALL THREE LOGINS (seller, buyer, admin):
 *   The layout, field components, social buttons and footer below are generic. To build the
 *   buyer or admin login, copy this file and change ONLY the `ROLE` config block (texts, icon,
 *   features, links) and the login logic inside handleSubmit(). Everything else stays identical,
 *   so the three logins look consistent.
 *
 * NOTES FOR ANOTHER AI / DEVELOPER:
 *   1. LOGIC IS UNCHANGED: same validation message, loginUser({ identifier, password }),
 *      localStorage keys (socio-user, socio-user-token), toasts and router.push('/user/dashboard').
 *      (The MVP note stays true: production auth should use secure HttpOnly cookies/session storage.)
 *   2. "Forgot password" links to ROLE.forgotHref. That page may not exist yet, create it or change the href.
 *   3. Colors use theme tokens only (primary, card, border, muted-foreground ...), so all themes
 *      and dark mode keep working.
 *   4. The page file does not need changes. It still renders <UserLoginForm />.
 */

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { loginUser } from '../services/auth-service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/* ---------------------------------------------------------------------
 * ROLE CONFIG  (the only block that differs between seller / buyer / admin)
 * CHANGE HERE for another login: texts, icon, features, links.
 * --------------------------------------------------------------------- */
const ROLE: {
  badge: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  headline: string;
  intro: string;
  features: [LucideIcon, string][];
  submitLabel: string;
  forgotHref: string;
  signup: { prompt: string; label: string; href: string };
} = {
  badge: 'Shopper account',
  icon: ShoppingBag,
  title: 'User login',
  subtitle: 'Sign in to your Socio Commerce account.',
  headline: 'Welcome back, happy shopping.',
  intro: 'Pick up where you left off. Your cart, orders and favorite creators are waiting.',
  features: [
    [ShoppingBag, 'Track your orders and deliveries'],
    [Wallet, 'Earn and spend coins with your wallet'],
    [Users, 'Follow creators and shop from their stories'],
  ],
  submitLabel: 'Sign In',
  forgotHref: '/user/forgot-password',
  signup: { prompt: 'New to Socio?', label: 'Create an account', href: '/register/user' },
};

/* ---------------------------------------------------------------------
 * MAIN FORM
 * --------------------------------------------------------------------- */
export function UserLoginForm() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false); // highlights empty fields after a failed submit

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!identifier.trim() || !password) {
      setAttempted(true);
      toast.error('Please enter your username/email and password.');

      return;
    }

    try {
      setLoading(true);

      const result = await loginUser({
        identifier,
        password,
      });

      /*
       * Demo session.
       *
       * Production authentication should use
       * secure HttpOnly cookies/session storage.
       */
      localStorage.setItem('socio-user', JSON.stringify(result.user));

      localStorage.setItem('socio-user-token', result.token);

      toast.success('Login successful.', {
        description: `Welcome back, ${result.user.firstName}!`,
      });

      router.push('/user/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to login.');
    } finally {
      setLoading(false);
    }
  }

  const RoleIcon = ROLE.icon;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid rounded-3xl border border-border bg-card shadow-lg lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* ============ Brand panel (desktop) ============ */}
        <aside className="relative hidden overflow-hidden rounded-l-3xl bg-gradient-to-br from-primary via-primary to-primary/70 p-10 text-primary-foreground lg:flex lg:flex-col">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-24 size-72 rounded-full border border-current opacity-20" />
            <div className="absolute -right-8 -top-8 size-44 rounded-full border border-current opacity-20" />
            <div className="absolute -bottom-28 -left-20 size-80 rounded-full bg-current opacity-[0.07] blur-3xl" />
            <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px]" />
          </div>

          <div className="relative flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Socio<span className="opacity-70">.</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <RoleIcon className="size-3.5" /> {ROLE.badge}
            </span>
          </div>

          <div className="relative mt-auto pb-2 pt-16">
            <h2 className="text-3xl font-bold leading-tight">{ROLE.headline}</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-primary-foreground/80">{ROLE.intro}</p>

            <ul className="mt-8 space-y-3">
              {ROLE.features.map(([Icon, text]) => (
                <li key={text} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
                    <Icon className="size-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            <p className="mt-10 flex items-center gap-2 text-xs text-primary-foreground/70">
              <ShieldCheck className="size-4" /> Secure sign-in. Your data stays protected.
            </p>
          </div>
        </aside>

        {/* ============ Form ============ */}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <div className="mb-8">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <RoleIcon className="size-6" />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {ROLE.title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{ROLE.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <IconField
              id="user-identifier"
              label="Username or Email"
              icon={UserRound}
              type="text"
              value={identifier}
              onChange={setIdentifier}
              placeholder="Enter username or email"
              autoComplete="username"
              disabled={loading}
              invalid={attempted && !identifier.trim()}
            />

            <PasswordField
              id="user-password"
              label="Password"
              value={password}
              onChange={setPassword}
              disabled={loading}
              invalid={attempted && !password}
              forgotHref={ROLE.forgotHref}
            />

            <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  {ROLE.submitLabel}
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {ROLE.signup.prompt}{' '}
            <Link
              href={ROLE.signup.href}
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              {ROLE.signup.label} <ArrowRight className="size-3.5" />
            </Link>
          </p>

          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
 * SHARED UI PIECES (identical across seller / buyer / admin logins)
 * --------------------------------------------------------------------- */
function IconField({
  id,
  label,
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  invalid,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  disabled: boolean;
  invalid: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={invalid}
          className={`h-11 pl-10 ${invalid ? 'border-destructive' : ''}`}
        />
      </div>
      {invalid && <p className="text-xs font-medium text-destructive">This field is required.</p>}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  invalid,
  forgotHref,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  invalid: boolean;
  forgotHref: string;
}) {
  const [visible, setVisible] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <Link
          href={forgotHref}
          className="text-xs font-semibold text-primary hover:underline"
          tabIndex={disabled ? -1 : 0}
        >
          Forgot password?
        </Link>
      </div>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyUp={(event) => setCapsOn(event.getModifierState('CapsLock'))}
          onBlur={() => setCapsOn(false)}
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={disabled}
          aria-invalid={invalid}
          className={`h-11 pl-10 pr-11 ${invalid ? 'border-destructive' : ''}`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {capsOn && <p className="text-xs font-medium text-warning">Caps Lock is on.</p>}
      {invalid && <p className="text-xs font-medium text-destructive">This field is required.</p>}
    </div>
  );
}
