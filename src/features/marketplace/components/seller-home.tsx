'use client';

/**
 * =====================================================================
 * SELLER HOME  (landing page focused on attracting SELLERS)
 * =====================================================================
 * PAGE ORDER
 *   1. Hero: headline + CTAs + live-looking seller dashboard mockup with floating notifications
 *   2. Facts strip (real platform facts, no invented numbers)
 *   3. Features bento: stories, creator commissions, POS/barcode, wallet payouts, logistics
 *   4. Sample product showcase (how a seller's listings look)
 *   5. "Let creators sell for you" flow
 *   6. How it works (4 steps) + "What you will need" checklist
 *   7. Seller stories (SAMPLE testimonials)
 *   8. FAQ accordion
 *   9. Final call to action
 *
 * NOTES FOR ANOTHER AI / DEVELOPER:
 *   1. Exports are unchanged: named `SellerHome` and default export. It renders its own <main>.
 *   2. ALL content lives in the data blocks at the top (FACTS, FEATURES_STRIP, SAMPLE_PRODUCTS,
 *      FLOW, STEPS, REQUIREMENTS, TESTIMONIALS, FAQS). Edit text there, not in the JSX.
 *   3. SAMPLE DATA: the dashboard numbers, the sample products and the seller stories are
 *      illustrative only. Replace TESTIMONIALS with real seller quotes (or delete that section)
 *      before launch. Search "CHANGE HERE".
 *   4. Primary CTA goes to /register/vendor and the login link goes to /seller/login.
 *   5. Colors use theme tokens only (primary, accent, card, border, success, info ...), so all
 *      themes and dark mode keep working. Do not hardcode colors.
 *   6. Motion respects prefers-reduced-motion.
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Camera,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock,
  Headphones,
  MessageCircle,
  PackageCheck,
  Percent,
  Rocket,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Truck,
  Users,
  WalletCards,
  Watch,
  type LucideIcon,
} from 'lucide-react';

/* =====================================================================
 * CONTENT  (CHANGE HERE)
 * ===================================================================== */

// Real platform facts (from the product spec), not invented metrics.
const FACTS: { value: string; label: string }[] = [
  { value: 'NPR 0', label: 'Setup fee to get started' },
  { value: '24 hrs', label: 'Stories with an Order Now button' },
  { value: '3 ways', label: 'To get paid: eSewa, Khalti or bank' },
  { value: '1 place', label: 'Products, orders and payouts' },
];

const FEATURES_STRIP: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: BarChart3, title: 'Sales dashboard', text: 'See what sells and when.' },
  { icon: Percent, title: 'Flash sales', text: 'Time-bound deals and free shipping.' },
  { icon: BadgeCheck, title: 'Verified profile', text: 'A trust badge shoppers notice.' },
  { icon: Headphones, title: 'Seller support', text: 'Tickets and direct messages.' },
];

// SAMPLE listings, illustrative only.
type SampleProduct = {
  brand: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  commission: number;
  icon: LucideIcon;
  tile: string;
};
const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    brand: 'Samsung',
    name: 'Galaxy A55 5G 8/256GB',
    price: 52999,
    oldPrice: 58999,
    rating: 4.8,
    commission: 8,
    icon: Smartphone,
    tile: 'from-primary/25 to-primary/5',
  },
  {
    brand: 'Sony',
    name: 'Alpha ZV-E10 Vlog Camera Kit',
    price: 89500,
    rating: 4.9,
    commission: 6,
    icon: Camera,
    tile: 'from-accent/40 to-accent/10',
  },
  {
    brand: 'JBL',
    name: 'Tune 770NC Wireless Headphones',
    price: 11990,
    oldPrice: 14990,
    rating: 4.6,
    commission: 10,
    icon: Headphones,
    tile: 'from-success/25 to-success/5',
  },
  {
    brand: 'Amazfit',
    name: 'GTR 4 Smart Watch',
    price: 24900,
    rating: 4.7,
    commission: 7,
    icon: Watch,
    tile: 'from-info/25 to-info/5',
  },
];

const FLOW: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Store, title: 'You list and set a rate', text: 'Choose a commission per product or campaign.' },
  { icon: Share2, title: 'Creators share it', text: 'Influencers and affiliates promote through posts, stories and links.' },
  { icon: Users, title: 'Shoppers buy', text: 'One tap from a story or link to checkout.' },
  { icon: CircleDollarSign, title: 'Everyone earns', text: 'Sales are tracked and attributed automatically.' },
];

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Store, title: 'Create your store', text: 'Register with your business details in a few quick steps.' },
  { icon: BadgeCheck, title: 'Get approved', text: 'An administrator reviews your application and activates your account.' },
  { icon: PackageCheck, title: 'List your products', text: 'Add photos, prices and stock once. Inventory stays in sync.' },
  { icon: WalletCards, title: 'Sell and get paid', text: 'Manage orders and withdraw earnings to a verified account.' },
];

const REQUIREMENTS = [
  'Your name, email and phone number',
  'Business type and legal business name',
  'PAN number (and registration number if registered)',
  'Business, pickup and return addresses',
  'An eSewa, Khalti or bank account in your name for payouts',
];

// CHANGE HERE: SAMPLE stories. Replace with real seller quotes before launch, or remove the section.
const TESTIMONIALS: { quote: string; name: string; business: string; city: string }[] = [
  {
    quote: 'Posting a story with an Order Now button brought me customers I never reached from my shop alone.',
    name: 'Sample Seller',
    business: 'Gadget store',
    city: 'Kathmandu',
  },
  {
    quote: 'Setting a commission and letting creators promote my products saved me hours of marketing.',
    name: 'Sample Seller',
    business: 'Camera gear',
    city: 'Pokhara',
  },
  {
    quote: 'Inventory in one place and clear payouts. I finally know what I earned and when.',
    name: 'Sample Seller',
    business: 'Accessories',
    city: 'Biratnagar',
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I start selling on Socio?',
    a: 'Register as a vendor with your account, store and business details. An administrator reviews your application, and once approved you can log in and list products.',
  },
  {
    q: 'How long does approval take?',
    a: 'Applications are reviewed by an administrator. Your account stays in a pending status until it is approved, and you can follow up with support if you need help.',
  },
  {
    q: 'What documents or details do I need?',
    a: 'Your legal business name, business type, PAN number (and registration number if you have one), plus your business, pickup and return addresses.',
  },
  {
    q: 'How do I get paid?',
    a: 'Your earnings go to your Socio wallet. You can withdraw to eSewa, Khalti or a bank account. We verify that the linked account belongs to you before withdrawals are enabled.',
  },
  {
    q: 'Can creators and affiliates promote my products?',
    a: 'Yes. You assign a commission rate per product or campaign. Influencers and affiliate marketers share your products, and sales are attributed to them automatically.',
  },
  {
    q: 'Can I sell in my physical shop too?',
    a: 'Yes. A point-of-sale view with barcode scanning keeps your in-store and online inventory in sync, and items with zero stock cannot be checked out.',
  },
];

/* =====================================================================
 * PAGE
 * ===================================================================== */
export function SellerHome() {
  return (
    <main className="overflow-hidden bg-background">
      <style>{`
        @keyframes sell-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        .sell-float { animation: sell-float 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .sell-float { animation: none; } }
      `}</style>

      <Hero />
      <FactsStrip />
      <Features />
      <Showcase />
      <CreatorsFlow />
      <HowItWorks />
      <Stories />
      <Faq />
      <FinalCta />
    </main>
  );
}

/* =====================================================================
 * 1. HERO
 * ===================================================================== */
function Hero() {
  return (
    <section className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-44 left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 size-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary">
            <Rocket className="size-4" />
            Built for ambitious sellers
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl sm:leading-[1.05]">
            Turn what you sell into{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              what&apos;s next.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Socio is the social commerce marketplace where your products meet shoppers, creators and
            affiliates. List once and sell through stories, your storefront and your physical shop.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register/vendor"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-90"
            >
              Start selling today <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 font-semibold text-foreground transition hover:bg-secondary"
            >
              See how it works
            </Link>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Already selling with us?{' '}
            <Link href="/seller/login" className="font-semibold text-primary hover:underline">
              Log in to your seller account
            </Link>
          </p>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {['No setup fee', 'You stay in control', 'Verified seller profile'].map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="size-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <DashboardMockup />
      </div>
    </section>
  );
}

function DashboardMockup() {
  const bars = [35, 48, 42, 60, 55, 72, 86, 68, 92, 82, 100, 94];

  return (
    <div className="relative mx-auto w-full max-w-lg lg:mr-0">
      {/* Floating notifications (hidden on small screens to keep it clean) */}
      <div className="sell-float absolute -right-3 -top-5 z-20 hidden items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-xl sm:flex">
        <span className="flex size-9 items-center justify-center rounded-xl bg-success/15 text-success">
          <PackageCheck className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold text-foreground">New order received</p>
          <p className="text-[11px] text-muted-foreground">JBL Tune 770NC · NPR 11,990</p>
        </div>
      </div>

      <div
        className="sell-float absolute -left-5 bottom-10 z-20 hidden items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-xl sm:flex"
        style={{ animationDelay: '-2s' }}
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold text-foreground">Your story: 1.2k views</p>
          <p className="text-[11px] text-muted-foreground">86 taps on Order Now</p>
        </div>
      </div>

      <div
        className="sell-float absolute -bottom-6 right-6 z-20 hidden items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-xl sm:flex"
        style={{ animationDelay: '-4s' }}
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent/30 text-accent-foreground">
          <WalletCards className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold text-foreground">Payout sent to eSewa</p>
          <p className="text-[11px] text-muted-foreground">NPR 48,000</p>
        </div>
      </div>

      {/* Dashboard window */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-warning/70" />
            <span className="size-2.5 rounded-full bg-success/70" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">Seller dashboard</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            Sample data
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <p className="text-lg font-bold text-foreground">Ram Electronics</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Store className="size-5" />
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
            {[
              { label: 'Sales (month)', value: 'NPR 1.24L', note: '+18.4%', up: true },
              { label: 'Orders', value: '248', note: '+32 today', up: true },
              { label: 'Via creators', value: '36%', note: 'of sales', up: false },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl bg-secondary/60 p-3">
                <p className="truncate text-[11px] text-muted-foreground">{kpi.label}</p>
                <p className="mt-1.5 text-base font-bold tabular-nums text-foreground sm:text-lg">
                  {kpi.value}
                </p>
                <p className={`mt-0.5 text-[11px] font-semibold ${kpi.up ? 'text-success' : 'text-muted-foreground'}`}>
                  {kpi.note}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Store performance</p>
              <span className="text-[11px] text-muted-foreground">Last 12 weeks</span>
            </div>
            <div className="mt-4 flex h-24 items-end gap-1.5">
              {bars.map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-primary/60"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {[
              ['#1042', 'Galaxy A55 5G', 'Shipped'],
              ['#1041', 'Tune 770NC', 'Packed'],
            ].map(([id, product, status]) => (
              <li
                key={id}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-muted-foreground">{id}</span>
                  <span className="font-medium text-foreground">{product}</span>
                </span>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                  {status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
 * 2. FACTS STRIP
 * ===================================================================== */
function FactsStrip() {
  return (
    <section className="border-y border-border bg-card">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {FACTS.map((fact) => (
          <div key={fact.label} className="text-center lg:border-r lg:border-border lg:last:border-r-0">
            <dt className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {fact.value}
            </dt>
            <dd className="mt-1.5 px-2 text-sm text-muted-foreground">{fact.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* =====================================================================
 * 3. FEATURES BENTO
 * ===================================================================== */
function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-5xl sm:leading-[1.08]">
        {title}
      </h2>
      {text && <p className="mt-4 leading-7 text-muted-foreground">{text}</p>}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
  className = '',
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg sm:p-8 ${className}`}
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 text-xl font-bold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{text}</p>
      {children && <div className="mt-6 flex-1">{children}</div>}
    </article>
  );
}

function Features() {
  const barcode = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2];

  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        eyebrow="More than a storefront"
        title="Everything you need to sell with confidence."
        text="Your time should go into your products and your customers, not wrestling with software. Socio keeps the important parts clear, connected and ready for you."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-6">
        {/* Stories */}
        <FeatureCard
          icon={Sparkles}
          title="Sell through stories"
          text="Post a 24-hour story with an Order Now, Book Now or Inquiry button. Shoppers tap once and land on your product."
          className="lg:col-span-3"
        >
          <div className="flex items-end gap-5">
            <div className="w-36 shrink-0 rounded-3xl border border-border bg-background p-2 shadow-lg">
              <div className="relative flex aspect-[9/15] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-2.5 text-primary-foreground">
                <div className="h-1 overflow-hidden rounded-full bg-primary-foreground/30">
                  <div className="h-full w-2/3 rounded-full bg-primary-foreground" />
                </div>
                <Headphones className="mx-auto size-12 opacity-90" />
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold leading-tight">Tune 770NC · 20% off</p>
                  <span className="block rounded-full bg-background py-1.5 text-center text-[11px] font-bold text-foreground">
                    Order Now
                  </span>
                </div>
              </div>
            </div>
            <ul className="space-y-2 pb-1 text-sm">
              {[
                [Clock, 'Disappears after 24 hours'],
                [Star, 'Like, comment, share, rate'],
                [ArrowRight, 'One tap to your product'],
              ].map(([Icon, text]) => {
                const I = Icon as LucideIcon;
                return (
                  <li key={text as string} className="flex items-center gap-2.5 text-muted-foreground">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-primary">
                      <I className="size-3.5" />
                    </span>
                    {text as string}
                  </li>
                );
              })}
            </ul>
          </div>
        </FeatureCard>

        {/* Creators */}
        <FeatureCard
          icon={Users}
          title="Creators and affiliates sell for you"
          text="Set a commission per product or campaign. Influencers and affiliate marketers promote your products and sales are attributed automatically."
          className="lg:col-span-3"
        >
          <div className="space-y-3">
            {[
              { who: 'Influencer', initials: 'IN', rate: 8, width: '80%' },
              { who: 'Affiliate marketer', initials: 'AM', rate: 5, width: '50%' },
              { who: 'Content creator', initials: 'CC', rate: 6, width: '60%' },
            ].map((row) => (
              <div key={row.who} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {row.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{row.who}</span>
                    <span className="font-bold text-primary">{row.rate}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: row.width }} />
                  </div>
                </div>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">Sample rates. You decide your own.</p>
          </div>
        </FeatureCard>

        {/* POS */}
        <FeatureCard
          icon={PackageCheck}
          title="POS and barcode scanning"
          text="Sell in your shop and online from the same stock. Inventory syncs in real time."
          className="lg:col-span-2"
        >
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex h-14 items-stretch justify-center gap-[3px]">
              {barcode.map((w, i) => (
                <span key={i} className="rounded-[1px] bg-foreground" style={{ width: `${w * 2}px` }} />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Galaxy A55 5G</span>
              <span className="rounded-full bg-success/15 px-2 py-0.5 font-semibold text-success">
                In stock · 24
              </span>
            </div>
          </div>
        </FeatureCard>

        {/* Wallet */}
        <FeatureCard
          icon={WalletCards}
          title="Wallet and clear payouts"
          text="Track every earning in your ledger and withdraw to a verified account."
          className="lg:col-span-2"
        >
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-4 text-primary-foreground">
            <p className="text-[11px] text-primary-foreground/70">Available to withdraw</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">NPR 48,000</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['eSewa', 'Khalti', 'Bank'].map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-semibold"
                >
                  <Check className="size-3" /> {name}
                </span>
              ))}
            </div>
          </div>
        </FeatureCard>

        {/* Logistics */}
        <FeatureCard
          icon={Truck}
          title="Logistics built in"
          text="Orders route to the right branch or delivery partner, with tracking for you and your buyer."
          className="lg:col-span-2"
        >
          <ol className="relative space-y-3 border-l border-border pl-5">
            {[
              ['Order packed', true],
              ['Rider picked up', true],
              ['Out for delivery', false],
            ].map(([label, done]) => (
              <li key={label as string} className="relative text-sm">
                <span
                  className={`absolute -left-[1.62rem] top-0.5 flex size-4 items-center justify-center rounded-full border-2 ${
                    done ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'
                  }`}
                >
                  {done && <Check className="size-2.5" />}
                </span>
                <span className={done ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                  {label as string}
                </span>
              </li>
            ))}
          </ol>
        </FeatureCard>
      </div>

      {/* Small features */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES_STRIP.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =====================================================================
 * 4. PRODUCT SHOWCASE (sample listings)
 * ===================================================================== */
function Showcase() {
  return (
    <section className="bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Your products, front and center"
            title="Listings that shoppers actually want to tap."
            text="Clear photos, honest prices, sale badges and creator commissions. Here is how a seller's catalog can look."
          />
          <Link
            href="/register/vendor"
            className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            List your first product <ArrowRight className="size-4" />
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {SAMPLE_PRODUCTS.map((product) => {
            const Icon = product.icon;
            const percentOff = product.oldPrice
              ? Math.round((1 - product.price / product.oldPrice) * 100)
              : 0;
            return (
              <li key={product.name}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                  <div className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${product.tile}`}>
                    <span className="flex size-20 items-center justify-center rounded-3xl bg-card/80 text-foreground/80 shadow-sm backdrop-blur transition group-hover:scale-105 sm:size-24">
                      <Icon className="size-10 sm:size-12" />
                    </span>
                    {percentOff > 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-1 text-[10px] font-bold leading-none text-destructive-foreground sm:left-3 sm:top-3 sm:text-xs">
                        -{percentOff}%
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-[10px] font-semibold text-primary shadow-sm backdrop-blur sm:bottom-3 sm:left-3 sm:text-xs">
                      <Percent className="size-3" /> Creators earn {product.commission}%
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-1 p-3 sm:gap-1.5 sm:p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                      {product.brand}
                    </p>
                    <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-card-foreground sm:text-[15px]">
                      {product.name}
                    </h3>
                    <p className="flex items-center gap-1 text-xs">
                      <Star className="size-3.5 fill-accent text-accent" />
                      <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
                    </p>
                    <div className="mt-auto pt-1">
                      {product.oldPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          NPR {product.oldPrice.toLocaleString()}
                        </p>
                      )}
                      <p className="flex items-baseline gap-1 font-bold text-foreground">
                        <span className="text-[11px] font-semibold text-muted-foreground sm:text-xs">NPR</span>
                        <span className="text-base sm:text-lg">{product.price.toLocaleString()}</span>
                      </p>
                    </div>
                    <span className="mt-2 hidden h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground sm:flex">
                      Add to cart
                    </span>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Sample listings for illustration. Your catalog, your prices.
        </p>
      </div>
    </section>
  );
}

/* =====================================================================
 * 5. CREATORS FLOW
 * ===================================================================== */
function CreatorsFlow() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        center
        eyebrow="Social commerce, working for you"
        title="Let creators sell for you."
        text="You do not need a big ad budget. Share a slice of every sale with the people who bring you buyers."
      />

      <ol className="relative mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {FLOW.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="relative">
            <div className="h-full rounded-3xl border border-border bg-card p-6 text-center">
              <span className="relative mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
                <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
              </span>
              <h3 className="mt-5 font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
            {index < FLOW.length - 1 && (
              <ArrowRight
                aria-hidden
                className="absolute -right-4 top-1/2 z-10 hidden size-6 -translate-y-1/2 rounded-full bg-background p-1 text-primary lg:block"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* =====================================================================
 * 6. HOW IT WORKS + REQUIREMENTS
 * ===================================================================== */
function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="How it works"
          title="From idea to income in four clear steps."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
          <ol className="space-y-4">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className="flex gap-5 rounded-3xl border border-border bg-card p-5 transition hover:border-primary/40 sm:p-6"
              >
                <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Icon className="size-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-foreground">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>

          <aside className="h-fit rounded-3xl border border-border bg-card p-6 sm:p-8 lg:sticky lg:top-32">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-accent/30 text-accent-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <h3 className="mt-5 text-xl font-bold text-foreground">What you will need</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Keep these handy and registration takes just a few minutes.
            </p>
            <ul className="mt-5 space-y-3">
              {REQUIREMENTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="size-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/register/vendor"
              className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Create your seller account <ArrowRight className="size-4" />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
 * 7. SELLER STORIES (SAMPLE, replace before launch)
 * ===================================================================== */
function Stories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        center
        eyebrow="Seller stories"
        title="Built for sellers like you."
      />

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((item, index) => (
          <figure key={index} className="flex flex-col rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex gap-0.5 text-accent">
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} className="size-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-sm leading-6 text-foreground sm:text-base sm:leading-7">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {item.name.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.business} · {item.city}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-5 text-center text-xs text-muted-foreground">
        Sample stories shown for design purposes.
      </p>
    </section>
  );
}

/* =====================================================================
 * 8. FAQ
 * ===================================================================== */
function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-muted/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8 lg:py-28">
        <div>
          <SectionHeading
            eyebrow="Questions"
            title="Good to know before you start."
            text="Can't find what you need? Reach out after you register and our seller support team will help."
          />
          <MessageCircle className="mt-8 hidden size-10 text-primary/40 lg:block" />
        </div>

        <ul className="space-y-3">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            return (
              <li key={item.q} className="overflow-hidden rounded-2xl border border-border bg-card">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold text-foreground"
                >
                  {item.q}
                  <ChevronDown
                    className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-6 text-muted-foreground">{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* =====================================================================
 * 9. FINAL CTA
 * ===================================================================== */
function FinalCta() {
  const perks = ['Free to get started', 'Built-in product management', 'Verified seller profile', 'Dedicated seller support'];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary to-primary/70 p-8 text-primary-foreground sm:p-12 lg:p-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-32 size-96 rounded-full border border-current opacity-20" />
          <div className="absolute -right-8 top-12 size-56 rounded-full border border-current opacity-20" />
          <div className="absolute -bottom-40 left-1/3 size-96 rounded-full bg-current opacity-[0.08] blur-3xl" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px]" />
        </div>

        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground/70">
              Your next customer is out there
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl sm:leading-[1.08]">
              You bring the ambition. We&apos;ll bring the platform.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-primary-foreground/80">
              Join sellers building memorable brands, one great product and one happy customer at a
              time.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:min-w-64">
            <Link
              href="/register/vendor"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-6 font-semibold text-foreground shadow-lg transition hover:bg-background/90"
            >
              Become a seller <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/seller/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-primary-foreground/30 px-6 font-semibold transition hover:bg-primary-foreground/10"
            >
              Seller login
            </Link>
            <ul className="mt-1 space-y-2 text-sm text-primary-foreground/80">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <Check className="size-4" /> {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SellerHome;
