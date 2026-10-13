'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronRight,
  CircleDollarSign,
  Headphones,
  PackageCheck,
  Rocket,
  ShieldCheck,
  Store,
  Users,
  WalletCards,
} from 'lucide-react';

const benefits = [
  {
    icon: Users,
    title: 'Reach ready-to-buy shoppers',
    text: 'Put your products in front of a growing community that is already looking for what you sell.',
  },
  {
    icon: BarChart3,
    title: 'See what is working',
    text: 'Simple insights help you understand your best sellers, traffic, and next growth opportunity.',
  },
  {
    icon: WalletCards,
    title: 'Keep more of every sale',
    text: 'Transparent fees, clear payouts, and no complicated plans standing between you and growth.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create your store',
    text: 'Tell shoppers what makes your business special and set up your seller profile in minutes.',
  },
  {
    number: '02',
    title: 'List your products',
    text: 'Add photos, prices, and stock once. Your catalog stays organized as your business grows.',
  },
  {
    number: '03',
    title: 'Make your next sale',
    text: 'Manage orders, connect with customers, and turn your momentum into a repeatable business.',
  },
];

const sellerFeatures = [
  'Free to get started',
  'Built-in product management',
  'Verified seller profile',
  'Dedicated seller support',
];

export function SellerHome() {
  return (
    <main className="overflow-hidden bg-background">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8 lg:pt-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-foreground px-6 py-12 text-background sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full border border-background/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 top-12 size-56 rounded-full border border-background/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 left-1/3 size-96 rounded-full bg-primary/30 blur-3xl"
          />
          <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1.5 text-sm font-semibold text-background/90">
                <Rocket className="size-4 text-accent" />
                Built for ambitious sellers
              </div>
              <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-6xl sm:leading-[1.05]">
                Turn what you sell into what&apos;s next.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-background/70 sm:text-lg">
                Socio gives independent sellers the tools, audience, and confidence to grow a real
                business online — without the complexity of building it all yourself.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register/vendor"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Start selling today <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-background/20 px-5 py-3.5 font-semibold text-background transition hover:bg-background/10"
                >
                  See how it works
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-background/60">
                <span className="inline-flex items-center gap-2">
                  <Check className="size-4 text-accent" /> No setup fee
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check className="size-4 text-accent" /> You stay in control
                </span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:mr-0">
              <div className="rounded-3xl border border-background/15 bg-background/10 p-4 shadow-2xl backdrop-blur-sm sm:p-5">
                <div className="flex items-center justify-between border-b border-background/10 pb-4">
                  <div>
                    <p className="text-xs text-background/50">Your seller snapshot</p>
                    <p className="mt-1 text-lg font-semibold">Good morning, founder</p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary">
                    <Store className="size-5" />
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-background/10 p-4">
                    <p className="text-xs text-background/50">This month</p>
                    <p className="mt-2 text-2xl font-bold">$12,480</p>
                    <p className="mt-1 text-xs text-accent">+18.4% growth</p>
                  </div>
                  <div className="rounded-2xl bg-background/10 p-4">
                    <p className="text-xs text-background/50">Orders</p>
                    <p className="mt-2 text-2xl font-bold">248</p>
                    <p className="mt-1 text-xs text-background/50">From 4,200 shoppers</p>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl bg-background/10 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Store performance</p>
                    <span className="text-xs text-background/50">Last 30 days</span>
                  </div>
                  <div className="mt-5 flex h-24 items-end gap-2">
                    {[35, 48, 42, 60, 55, 72, 86, 68, 92, 82, 100, 94].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-md bg-primary/80"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-border bg-card p-3 text-foreground shadow-lg sm:flex">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BadgeCheck className="size-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Seller status</p>
                  <p className="text-sm font-semibold">Verified & trusted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-28">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
            More than a storefront
          </p>
          <h2 className="mt-4 max-w-lg text-3xl font-bold tracking-tight sm:text-5xl">
            Everything you need to sell with confidence.
          </h2>
          <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
            Your time should go into your products and your customers — not wrestling with software.
            Socio keeps the important parts clear, connected, and ready for you.
          </p>
          <Link
            href="/register/vendor"
            className="mt-8 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
          >
            Create your seller account <ChevronRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: PackageCheck,
              title: 'Simple catalog tools',
              text: 'Add, edit, and organize products without a learning curve.',
            },
            {
              icon: CircleDollarSign,
              title: 'Clear payouts',
              text: 'Know what you earned and when your money is on the way.',
            },
            {
              icon: ShieldCheck,
              title: 'Trust that converts',
              text: 'Verified profiles and secure checkout help shoppers buy with confidence.',
            },
            {
              icon: Headphones,
              title: 'Human support',
              text: 'Get help when you need it from a team that understands sellers.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-border bg-card p-6">
              <Icon className="size-6 text-primary" />
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              From idea to income in three clear steps.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-3xl border border-border bg-card p-7">
                <span className="text-sm font-bold text-primary">{step.number}</span>
                <h3 className="mt-10 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 rounded-[2rem] bg-primary p-8 text-primary-foreground sm:p-12 lg:grid-cols-[1fr_auto] lg:p-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground/70">
              Your next customer is out there
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
              You bring the ambition. We&apos;ll bring the platform.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-primary-foreground/75">
              Join sellers building memorable brands, one great product and one happy customer at a
              time.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:min-w-52">
            <Link
              href="/register/vendor"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-5 py-3.5 font-semibold text-foreground hover:bg-background/90"
            >
              Become a seller <ArrowRight className="size-4" />
            </Link>
            <ul className="flex flex-col gap-2 text-sm text-primary-foreground/75">
              {sellerFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="size-4" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default SellerHome;
