'use client';

/**
 * =====================================================================
 * COMMERCE HOME  (single file, redesigned home page)
 * =====================================================================
 * PAGE ORDER
 *   1. Hero: promo carousel (3 slides, floating product cards) + 2 side tiles
 *            (today's deals countdown, sell on Socio)
 *   2. Trust strip
 *   3. Shop by category (round icon rail)
 *   4. Deals of the day (only shows if some products have a sale price)
 *   5. Featured products, promo banners, Popular with shoppers
 *   6. Become a vendor CTA
 *
 * NOTES FOR ANOTHER AI / DEVELOPER:
 *   1. Props, data fetching, localStorage greeting and links are the SAME as the MVP.
 *      Only the UI changed. `HomeSearch` is still exported unchanged.
 *   2. Hero slides come from HERO_SLIDES below. Edit text, links and tone there.
 *      Product images inside the hero are REAL products from the API (no fake data).
 *      If the API returns nothing, neat placeholder cards are shown instead.
 *   3. Colors use theme tokens only (primary, accent, foreground, card, ...), so the
 *      violet / emerald / rose themes and dark mode keep working. Do not hardcode colors.
 *   4. Search for "CHANGE HERE" to find values most likely to need editing
 *      (query params for deals / sorting, product limit).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  Headset,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Truck,
} from 'lucide-react';
import { ProductCard } from './product-card';
import type { MarketplaceDetailProduct } from '../services/marketplace-service';

type Category = { id: string; name: string; slug: string; icon?: string };

/* ---------------------------------------------------------------------
 * HERO SLIDES  (CHANGE HERE: copy, links, tone)
 * tone: 'primary' (brand gradient) | 'dark' (inverted) | 'accent' (warm)
 * productOffset: which products from the API feed the floating cards.
 * --------------------------------------------------------------------- */
type HeroTone = 'primary' | 'dark' | 'accent';
type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  tone: HeroTone;
  productOffset: number;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'discover',
    eyebrow: 'Trusted local sellers',
    title: 'Discover products you will love.',
    subtitle:
      'Shop quality products from trusted sellers, all in one place. Browse, compare, and checkout with confidence.',
    ctaLabel: 'Shop now',
    ctaHref: '/marketplace',
    secondaryLabel: 'Explore categories',
    secondaryHref: '#categories',
    tone: 'primary',
    productOffset: 0,
  },
  {
    id: 'creators',
    eyebrow: 'Creator picks',
    title: 'Shop what creators actually use.',
    subtitle:
      'Real reviews and recommendations from the Socio community, one tap away from checkout.',
    ctaLabel: 'Browse top rated',
    ctaHref: '/marketplace', // CHANGE HERE: e.g. '/marketplace?sort=rating' if the page supports it
    tone: 'dark',
    productOffset: 3,
  },
  {
    id: 'deals',
    eyebrow: "Today's deals",
    title: 'Big savings, every single day.',
    subtitle: 'Limited-time prices from verified sellers. Grab them before the clock runs out.',
    ctaLabel: 'See deals',
    ctaHref: '/marketplace?sale=true', // CHANGE HERE: match the marketplace "on sale" filter
    tone: 'accent',
    productOffset: 6,
  },
];

const TONES: Record<
  HeroTone,
  { bg: string; text: string; muted: string; cta: string; ghost: string; pill: string }
> = {
  primary: {
    bg: 'bg-gradient-to-br from-primary via-primary to-primary/70',
    text: 'text-primary-foreground',
    muted: 'text-primary-foreground/80',
    cta: 'bg-background text-foreground hover:bg-background/90',
    ghost: 'border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10',
    pill: 'bg-primary-foreground/15 text-primary-foreground',
  },
  dark: {
    bg: 'bg-gradient-to-br from-foreground via-foreground to-foreground/85',
    text: 'text-background',
    muted: 'text-background/70',
    cta: 'bg-primary text-primary-foreground hover:opacity-90',
    ghost: 'border-background/30 text-background hover:bg-background/10',
    pill: 'bg-background/15 text-background',
  },
  accent: {
    bg: 'bg-gradient-to-br from-accent via-accent to-accent/70',
    text: 'text-accent-foreground',
    muted: 'text-accent-foreground/75',
    cta: 'bg-foreground text-background hover:opacity-90',
    ghost: 'border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10',
    pill: 'bg-accent-foreground/10 text-accent-foreground',
  },
};

/* ---------------------------------------------------------------------
 * HELPERS
 * --------------------------------------------------------------------- */
function priceOf(product: MarketplaceDetailProduct) {
  const { regularPrice, salePrice, currency } = product.pricing;
  const onSale = Boolean(salePrice) && Number(salePrice) < Number(regularPrice);
  const current = onSale ? Number(salePrice) : Number(regularPrice);
  const percentOff = onSale ? Math.round((1 - Number(salePrice) / Number(regularPrice)) * 100) : 0;
  return { currency, current, onSale, percentOff };
}

function pickProducts(products: MarketplaceDetailProduct[], offset: number, count = 3) {
  if (!products.length) return [];
  const n = Math.min(count, products.length);
  return Array.from({ length: n }, (_, i) => products[(offset + i) % products.length]);
}

/** Milliseconds until local midnight, ticking every second. null until mounted (avoids hydration mismatch). */
function useCountdownToMidnight() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      setLeft(end.getTime() - now.getTime());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

const pad = (n: number) => String(n).padStart(2, '0');

/* ---------------------------------------------------------------------
 * MAIN COMPONENT
 * --------------------------------------------------------------------- */
export function CommerceHome({
  categories,
  buyerOnly = false,
}: {
  categories: Category[];
  buyerOnly?: boolean;
}) {
  const [products, setProducts] = useState<MarketplaceDetailProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const timeLeft = useCountdownToMidnight();

  useEffect(() => {
    // CHANGE HERE: limit raised from 8 to 12 so the hero, deals and sections all have products.
    fetch('/api/marketplace/products?page=1&limit=12&sort=rating')
      .then((response) => response.json())
      .then((result) => setProducts(result.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = localStorage.getItem('socio-user');
      if (stored) {
        try {
          setFirstName(JSON.parse(stored).firstName ?? '');
        } catch {
          setFirstName('');
        }
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const featured = useMemo(() => products.slice(0, 4), [products]);
  const popular = useMemo(() => products.slice(4, 8), [products]);
  const deals = useMemo(() => products.filter((p) => priceOf(p).onSale).slice(0, 4), [products]);

  const greeting = buyerOnly && firstName ? `Hi ${firstName}, find your next favorite.` : null;

  return (
    <div className="bg-background">
      {/* ============ 1. HERO ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-4">
          <HeroCarousel products={products} greeting={greeting} />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:grid-rows-2 lg:gap-4">
            <DealsTile timeLeft={timeLeft} />
            <SellerTile />
          </div>
        </div>

        {/* ============ 2. TRUST STRIP ============ */}
        <div className="mt-3 grid grid-cols-2 gap-3 lg:mt-4 lg:grid-cols-4 lg:gap-4">
          {[
            { icon: Truck, title: 'Fast delivery', text: 'Tracked from shop to door' },
            { icon: ShieldCheck, title: 'Secure checkout', text: 'Your payments stay protected' },
            { icon: BadgeCheck, title: 'Verified sellers', text: 'Approved before they sell' },
            { icon: Headset, title: 'Buyer support', text: 'Help when you need it' },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 sm:p-4"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{title}</p>
                <p className="hidden truncate text-xs text-muted-foreground sm:block">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 3. CATEGORIES ============ */}
      <section id="categories" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-10 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Browse" title="Shop by category" href="/marketplace" />
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-8 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
         {categories.map((category) => (
            <Link
              key={category.id}
              href={`/marketplace?categoryId=${category.id}`}
              className="group flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24 lg:w-auto"
            >
              <span className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-border bg-card shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-primary group-hover:shadow-md sm:size-20">
                <img
                  src={category.icon}
                  alt={category.name}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </span>
          
              <span className="line-clamp-2 text-center text-xs font-semibold text-foreground">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ 4. DEALS (only when sale products exist) ============ */}
      {deals.length > 0 && (
        <ProductSection
          eyebrow="Limited time"
          title="Deals of the day"
          products={deals}
          loading={false}
          aside={
            timeLeft !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-bold tabular-nums text-destructive">
                <Flame className="size-3.5" />
                Ends in {pad(Math.floor(timeLeft / 3_600_000))}:
                {pad(Math.floor((timeLeft % 3_600_000) / 60_000))}:
                {pad(Math.floor((timeLeft % 60_000) / 1000))}
              </span>
            )
          }
        />
      )}

      {/* ============ 5. PRODUCT SECTIONS + PROMO BANNERS ============ */}
      <ProductSection
        eyebrow="Curated for you"
        title="Featured products"
        products={featured}
        loading={loading}
      />

      <section className="mx-auto grid max-w-7xl gap-3 px-4 sm:px-6 md:grid-cols-2 md:gap-4 lg:px-8">
        {/* CHANGE HERE: hrefs below assume ?sort= works on /marketplace */}
        <PromoBanner
          eyebrow="Community favorites"
          title="Top rated picks"
          text="Products shoppers keep recommending."
          href="/marketplace?sort=rating"
          className="bg-secondary text-secondary-foreground"
        />
        <PromoBanner
          eyebrow="Just landed"
          title="New arrivals"
          text="Fresh listings from sellers you can trust."
          href="/marketplace?sort=newest"
          className="bg-muted text-foreground"
        />
      </section>

      <ProductSection
        eyebrow="Trending"
        title="Popular with shoppers"
        products={popular}
        loading={loading}
      />

      {/* ============ 6. SELL CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/75 p-6 text-primary-foreground sm:p-10">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-24 size-72 rounded-full border border-current opacity-20" />
            <div className="absolute -right-8 -top-12 size-48 rounded-full border border-current opacity-20" />
            <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-current opacity-[0.07] blur-3xl" />
          </div>
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70">
                Grow with Socio
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Have products to sell?</h2>
              <p className="mt-2 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
                Reach new customers and manage your store with our seller tools.
              </p>
            </div>
            <Link
              href="/register/vendor"
              className="inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3.5 text-sm font-semibold text-foreground shadow-lg transition hover:bg-background/90"
            >
              Become a vendor <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------------
 * HERO CAROUSEL
 * Cross-fading slides stacked in one grid cell (height = tallest slide).
 * Autoplay pauses on hover/focus; swipe on touch; respects reduced motion.
 * --------------------------------------------------------------------- */
function HeroCarousel({
  products,
  greeting,
}: {
  products: MarketplaceDetailProduct[];
  greeting: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = HERO_SLIDES.length;

  const go = useCallback((next: number) => setIndex((next + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => clearInterval(id);
  }, [paused, count]);

  const activeTone = TONES[HERO_SLIDES[index].tone];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="relative overflow-hidden rounded-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const delta = event.changedTouches[0].clientX - touchX.current;
        if (Math.abs(delta) > 50) go(index + (delta < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <style>{`
        @keyframes socio-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        .socio-float { animation: socio-float 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .socio-float { animation: none; } }
      `}</style>

      <div className="grid">
        {HERO_SLIDES.map((slide, i) => {
          const tone = TONES[slide.tone];
          const active = i === index;
          const slideProducts = pickProducts(products, slide.productOffset);
          const title = i === 0 && greeting ? greeting : slide.title;

          return (
            <article
              key={slide.id}
              aria-hidden={!active}
              aria-label={`${i + 1} of ${count}`}
              className={`relative col-start-1 row-start-1 flex min-h-[29rem] flex-col transition-[opacity,visibility] duration-700 lg:min-h-[31rem] lg:grid lg:grid-cols-[1.05fr_0.95fr] ${tone.bg} ${tone.text} ${
                active ? 'visible opacity-100' : 'invisible opacity-0'
              }`}
            >
              {/* Background graphics */}
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-24 -top-24 size-96 rounded-full bg-current opacity-[0.08] blur-3xl" />
                <div className="absolute -bottom-32 left-1/4 size-80 rounded-full bg-current opacity-[0.06] blur-3xl" />
                <div className="absolute -right-24 top-1/2 size-[30rem] -translate-y-1/2 rounded-full border border-current opacity-15" />
                <div className="absolute -right-4 top-1/2 size-[21rem] -translate-y-1/2 rounded-full border border-current opacity-15" />
                <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px]" />
              </div>

              {/* Copy */}
              <div className="relative z-10 flex flex-1 flex-col justify-center p-6 pb-2 sm:p-10 lg:p-12 lg:pb-12">
                <span
                  className={`mb-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur ${tone.pill}`}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {slide.eyebrow}
                </span>
                {i === 0 ? (
                  <h1 className="max-w-xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                    {title}
                  </h1>
                ) : (
                  <h2 className="max-w-xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                    {title}
                  </h2>
                )}
                <p className={`mt-4 max-w-md text-sm leading-6 sm:text-base sm:leading-7 ${tone.muted}`}>
                  {slide.subtitle}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={slide.ctaHref}
                    tabIndex={active ? 0 : -1}
                    className={`inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-lg transition ${tone.cta}`}
                  >
                    {slide.ctaLabel} <ArrowRight className="size-4" />
                  </Link>
                  {slide.secondaryLabel && slide.secondaryHref && (
                    <Link
                      href={slide.secondaryHref}
                      tabIndex={active ? 0 : -1}
                      className={`hidden items-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-semibold transition sm:inline-flex ${tone.ghost}`}
                    >
                      {slide.secondaryLabel}
                    </Link>
                  )}
                </div>
              </div>

              {/* Floating product collage */}
              <div className="relative z-10 h-60 lg:h-auto">
                <FloatingProducts products={slideProducts} />
              </div>
            </article>
          );
        })}
      </div>

      {/* Controls */}
      <div
        className={`absolute inset-x-0 bottom-4 z-20 flex items-center justify-between px-6 sm:px-10 lg:px-12 ${activeTone.text}`}
      >
        <div className="flex items-center gap-2">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={`h-2 rounded-full bg-current transition-all duration-300 ${
                i === index ? 'w-7 opacity-100' : 'w-2 opacity-40 hover:opacity-70'
              }`}
            />
          ))}
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="flex size-9 items-center justify-center rounded-full border border-current/30 bg-current/10 backdrop-blur transition hover:bg-current/20"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="flex size-9 items-center justify-center rounded-full border border-current/30 bg-current/10 backdrop-blur transition hover:bg-current/20"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Overlapping, gently floating product cards. Uses real products; placeholders when empty. */
function FloatingProducts({ products }: { products: MarketplaceDetailProduct[] }) {
  // Position + rotation for up to 3 cards. The third is desktop only.
  const slots = [
    'left-[6%] top-[8%] w-[8.5rem] -rotate-6 lg:left-[4%] lg:top-[14%] lg:w-44',
    'right-[6%] top-[3%] w-[8.5rem] rotate-6 lg:right-[6%] lg:top-[7%] lg:w-44',
    'hidden lg:block left-[27%] bottom-[10%] w-44 rotate-2 z-10',
  ];
  const delays = ['0s', '-2s', '-4s'];

  return (
    <div className="absolute inset-0">
      {slots.map((position, i) => {
        const product = products[i];
        return (
          <div key={i} className={`absolute ${position}`}>
            <div className="socio-float" style={{ animationDelay: delays[i] }}>
              {product ? <MiniProduct product={product} /> : <MiniPlaceholder />}
            </div>
          </div>
        );
      })}

      {/* Floating chips (desktop) */}
      <div className="absolute bottom-[22%] right-[4%] z-20 hidden items-center gap-2 rounded-full bg-card px-3 py-2 text-xs font-semibold text-card-foreground shadow-xl lg:flex">
        <Star className="size-4 fill-accent text-accent" /> Top rated
      </div>
      <div className="absolute bottom-[6%] right-[8%] z-20 hidden items-center gap-2 rounded-full bg-card px-3 py-2 text-xs font-semibold text-card-foreground shadow-xl lg:flex">
        <ShieldCheck className="size-4 text-primary" /> Secure checkout
      </div>
    </div>
  );
}

function MiniProduct({ product }: { product: MarketplaceDetailProduct }) {
  const { currency, current, onSale, percentOff } = priceOf(product);
  return (
    <Link
      href={`/products/${product.slug}`}
      className="block rounded-2xl bg-card p-2.5 text-card-foreground shadow-2xl shadow-black/25 transition hover:scale-[1.03]"
    >
      <div className="relative flex aspect-square items-center justify-center rounded-xl bg-muted/70 p-2">
        <img
          src={product.images[0] || '/images/product-placeholder.svg'}
          alt=""
          className="max-h-full w-full object-contain"
        />
        {onSale && percentOff > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold leading-none text-destructive-foreground">
            -{percentOff}%
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-1 text-xs font-semibold">{product.name}</p>
      <p className="mt-0.5 text-xs font-bold text-primary">
        {currency} {current.toLocaleString()}
      </p>
    </Link>
  );
}

function MiniPlaceholder() {
  return (
    <div className="rounded-2xl bg-card p-2.5 shadow-2xl shadow-black/25">
      <div className="flex aspect-square items-center justify-center rounded-xl bg-muted/70 text-muted-foreground">
        <ShoppingBag className="size-8" />
      </div>
      <div className="mt-2 h-2.5 w-3/4 rounded-full bg-muted" />
      <div className="mt-1.5 h-2.5 w-1/3 rounded-full bg-primary/30" />
    </div>
  );
}

/* ---------------------------------------------------------------------
 * HERO SIDE TILES
 * --------------------------------------------------------------------- */
function DealsTile({ timeLeft }: { timeLeft: number | null }) {
  const parts =
    timeLeft === null
      ? [
          ['--', 'hrs'],
          ['--', 'min'],
          ['--', 'sec'],
        ]
      : [
          [pad(Math.floor(timeLeft / 3_600_000)), 'hrs'],
          [pad(Math.floor((timeLeft % 3_600_000) / 60_000)), 'min'],
          [pad(Math.floor((timeLeft % 60_000) / 1000)), 'sec'],
        ];

  return (
    <Link
      href="/marketplace?sale=true" // CHANGE HERE: match the marketplace "on sale" filter
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-md sm:p-5"
    >
      <div aria-hidden className="absolute -right-10 -top-10 size-32 rounded-full bg-destructive/10 blur-2xl" />
      <div className="relative">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-destructive">
          <Flame className="size-4" /> Today&apos;s deals
        </p>
        <p className="mt-2 hidden text-lg font-bold leading-snug text-foreground sm:block">
          Prices drop.
          <br />
          The clock is ticking.
        </p>
      </div>
      <div className="relative mt-3">
        <div className="flex gap-1.5">
          {parts.map(([value, label]) => (
            <div key={label} className="min-w-0 flex-1 rounded-xl bg-secondary px-1 py-1.5 text-center">
              <p className="text-sm font-bold tabular-nums text-foreground sm:text-lg">{value}</p>
              <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Shop deals
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function SellerTile() {
  return (
    <Link
      href="/register/vendor"
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-secondary p-4 text-secondary-foreground transition hover:shadow-md sm:p-5"
    >
      <div aria-hidden className="absolute -bottom-12 -right-12 size-40 rounded-full border border-current opacity-15" />
      <div aria-hidden className="absolute -bottom-4 -right-4 size-24 rounded-full border border-current opacity-15" />
      <div className="relative">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Store className="size-5" />
        </span>
        <p className="mt-3 text-base font-bold leading-snug sm:text-lg">Sell on Socio</p>
        <p className="mt-1 hidden text-sm opacity-75 sm:block">
          Open your shop and reach new buyers with creator-powered selling.
        </p>
      </div>
      <span className="relative mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Become a vendor
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/* ---------------------------------------------------------------------
 * SHARED SECTION PIECES
 * --------------------------------------------------------------------- */
function SectionHeading({
  eyebrow,
  title,
  href = '/marketplace',
  aside,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary sm:text-sm">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {aside}
        <Link
          href={href}
          className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-primary"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function ProductSection({
  eyebrow,
  title,
  products,
  loading,
  aside,
}: {
  eyebrow: string;
  title: string;
  products: MarketplaceDetailProduct[];
  loading: boolean;
  aside?: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading eyebrow={eyebrow} title={title} aside={aside} />
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-secondary" />
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-secondary" />
          <div className="hidden aspect-[4/5] animate-pulse rounded-2xl bg-secondary lg:block" />
          <div className="hidden aspect-[4/5] animate-pulse rounded-2xl bg-secondary lg:block" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

function PromoBanner({
  eyebrow,
  title,
  text,
  href,
  className,
}: {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center justify-between overflow-hidden rounded-3xl p-6 transition hover:shadow-md sm:p-8 ${className}`}
    >
      <div aria-hidden className="absolute -right-10 top-1/2 size-48 -translate-y-1/2 rounded-full border border-current opacity-15" />
      <div aria-hidden className="absolute -right-2 top-1/2 size-28 -translate-y-1/2 rounded-full border border-current opacity-15" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
        <p className="mt-1 text-xl font-bold sm:text-2xl">{title}</p>
        <p className="mt-1 text-sm opacity-75">{text}</p>
      </div>
      <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition group-hover:translate-x-1">
        <ArrowRight className="size-5" />
      </span>
    </Link>
  );
}

/* ---------------------------------------------------------------------
 * HomeSearch: unchanged from the MVP (still exported in case it is used elsewhere)
 * --------------------------------------------------------------------- */
export function HomeSearch() {
  return (
    <form
      action="/marketplace"
      className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm"
    >
      <Search className="ml-2 size-4 text-muted-foreground" />
      <input
        name="search"
        placeholder="Search products, brands, and more"
        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Search
      </button>
    </form>
  );
}
