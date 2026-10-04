'use client';

/**
 * =====================================================================
 * SITE HEADER  (single file: everything lives here, no extra files)
 * =====================================================================
 * LAYOUT
 *   Row 1 (all screens): [hamburger on mobile] Logo | Search | Theme, Notifications, Cart, Login/Profile
 *   Row 2 (desktop lg+): Category bar -> hover opens full-width mega panel
 *   Mobile (< lg): category bar becomes a left drawer opened by the hamburger.
 *                  Category > Subcategory > Items are FAQ-style accordions.
 *                  Search moves to its own row under Row 1 (below md).
 *
 * NOTES FOR ANOTHER AI / DEVELOPER (read before editing):
 *   1. Auth logic (localStorage keys, logout, buyer/seller state) is UNCHANGED from the MVP. Do not touch it.
 *   2. Category data is the sample constant NAV_CATEGORIES below.
 *      -> To use real data later, replace that constant with data fetched from the
 *         v0 blob / backend. Keep the same shape (see the NavCategory type).
 *   3. Link targets are built ONLY by categoryHref(). If the marketplace page uses
 *      different query param names, change them there (one place).
 *   4. The search form pushes to /marketplace?q=... . Change in handleSearch() if needed.
 *   5. Colors use the existing theme tokens (primary, secondary, accent, popover, border,
 *      muted-foreground...). Do not hardcode colors, dark mode depends on them.
 *   6. Search for "CHANGE HERE" comments to find the spots most likely to need edits.
 *   7. The mobile drawer is rendered with createPortal(..., document.body) ON PURPOSE.
 *      <header> uses backdrop-blur, and backdrop-filter makes `position: fixed` children
 *      size to the header instead of the screen. Do not move the drawer back inside <header>
 *      markup without the portal, or it will be clipped to the header height.
 */

import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { NotificationCenter } from '@/features/notifications/components/notification-center';
import { useCart } from '@/features/marketplace/components/use-cart';
import { useTheme } from '@/components/theme/theme-provider';

/* ---------------------------------------------------------------------
 * 1) CATEGORY DATA  (sample, three levels: Category > Subcategory > Item)
 * ---------------------------------------------------------------------
 * CHANGE HERE: replace NAV_CATEGORIES with backend / v0 blob data later.
 * - A category with an empty `subcategories` array renders as a plain link
 *   (uses `href`), e.g. "Deals".
 * - `featured` is the optional promo tile shown on the right of the mega panel
 *   (desktop only). Remove it from a category to hide the tile.
 * - `badge` on an item shows a small pill, e.g. "New".
 */
type NavItem = { label: string; slug: string; badge?: string };
type NavSubcategory = { label: string; slug: string; items: NavItem[] };
type NavFeatured = { title: string; description: string; href: string; cta: string };
type NavCategory = {
  label: string;
  slug: string;
  href?: string;
  subcategories: NavSubcategory[];
  featured?: NavFeatured;
};

const NAV_CATEGORIES: NavCategory[] = [
  {
    label: 'Apple',
    slug: 'apple',
    subcategories: [
      {
        label: 'iPhone',
        slug: 'iphone',
        items: [
          { label: 'iPhone 17 Pro Max', slug: 'iphone-17-pro-max', badge: 'New' },
          { label: 'iPhone 17 Pro', slug: 'iphone-17-pro' },
          { label: 'iPhone 17', slug: 'iphone-17' },
          { label: 'iPhone 16', slug: 'iphone-16' },
          { label: 'iPhone 15', slug: 'iphone-15' },
          { label: 'iPhone SE', slug: 'iphone-se' },
          { label: 'Pre-owned iPhones', slug: 'iphone-pre-owned' },
        ],
      },
      {
        label: 'Mac',
        slug: 'mac',
        items: [
          { label: 'MacBook Air', slug: 'macbook-air' },
          { label: 'MacBook Pro', slug: 'macbook-pro' },
          { label: 'iMac', slug: 'imac' },
          { label: 'Mac mini', slug: 'mac-mini' },
          { label: 'Mac Studio', slug: 'mac-studio' },
        ],
      },
      {
        label: 'iPad',
        slug: 'ipad',
        items: [
          { label: 'iPad Pro', slug: 'ipad-pro' },
          { label: 'iPad Air', slug: 'ipad-air' },
          { label: 'iPad mini', slug: 'ipad-mini' },
          { label: 'iPad', slug: 'ipad' },
        ],
      },
      {
        label: 'Watch',
        slug: 'watch',
        items: [
          { label: 'Apple Watch Ultra', slug: 'watch-ultra' },
          { label: 'Apple Watch Series', slug: 'watch-series' },
          { label: 'Apple Watch SE', slug: 'watch-se' },
        ],
      },
      {
        label: 'AirPods',
        slug: 'airpods',
        items: [
          { label: 'AirPods Pro', slug: 'airpods-pro' },
          { label: 'AirPods', slug: 'airpods' },
          { label: 'AirPods Max', slug: 'airpods-max' },
        ],
      },
    ],
    featured: {
      title: 'Verified Apple sellers',
      description: 'Sealed boxes and certified pre-owned, with seller ratings you can check.',
      href: '/marketplace?category=apple',
      cta: 'Shop Apple',
    },
  },
  {
    label: 'Android',
    slug: 'android',
    subcategories: [
      {
        label: 'Samsung',
        slug: 'samsung',
        items: [
          { label: 'Galaxy S Series', slug: 'galaxy-s' },
          { label: 'Galaxy Z Fold and Flip', slug: 'galaxy-z' },
          { label: 'Galaxy A Series', slug: 'galaxy-a' },
          { label: 'Galaxy Tab', slug: 'galaxy-tab' },
        ],
      },
      {
        label: 'Google Pixel',
        slug: 'pixel',
        items: [
          { label: 'Pixel Pro', slug: 'pixel-pro' },
          { label: 'Pixel', slug: 'pixel' },
          { label: 'Pixel a', slug: 'pixel-a' },
        ],
      },
      {
        label: 'Xiaomi and Redmi',
        slug: 'xiaomi',
        items: [
          { label: 'Xiaomi Flagship', slug: 'xiaomi-flagship' },
          { label: 'Redmi Note', slug: 'redmi-note' },
          { label: 'Poco', slug: 'poco' },
        ],
      },
      {
        label: 'OnePlus',
        slug: 'oneplus',
        items: [
          { label: 'OnePlus Flagship', slug: 'oneplus-flagship' },
          { label: 'OnePlus Nord', slug: 'oneplus-nord' },
        ],
      },
    ],
    featured: {
      title: 'Phones under NPR 40,000',
      description: 'Our most reviewed Android phones in the mid range.',
      href: '/marketplace?category=android&maxPrice=40000',
      cta: 'See picks',
    },
  },
  {
    label: 'Photography',
    slug: 'photography',
    subcategories: [
      {
        label: 'Cameras',
        slug: 'cameras',
        items: [
          { label: 'Mirrorless', slug: 'mirrorless' },
          { label: 'DSLR', slug: 'dslr' },
          { label: 'Compact', slug: 'compact' },
          { label: 'Instant', slug: 'instant' },
        ],
      },
      {
        label: 'Lenses',
        slug: 'lenses',
        items: [
          { label: 'Prime Lenses', slug: 'prime' },
          { label: 'Zoom Lenses', slug: 'zoom' },
          { label: 'Wide Angle', slug: 'wide-angle' },
          { label: 'Telephoto', slug: 'telephoto' },
        ],
      },
      {
        label: 'Lighting',
        slug: 'lighting',
        items: [
          { label: 'Softboxes', slug: 'softbox' },
          { label: 'Ring Lights', slug: 'ring-light' },
          { label: 'Flashes', slug: 'flash' },
        ],
      },
      {
        label: 'Tripods and Bags',
        slug: 'tripods-bags',
        items: [
          { label: 'Tripods', slug: 'tripods' },
          { label: 'Camera Bags', slug: 'camera-bags' },
          { label: 'Memory Cards', slug: 'memory-cards' },
        ],
      },
    ],
    featured: {
      title: 'Buy from creators',
      description: 'See the gear photographers on Socio actually shoot with.',
      href: '/marketplace?category=photography',
      cta: 'Browse gear',
    },
  },
  {
    label: 'Videography',
    slug: 'videography',
    subcategories: [
      {
        label: 'Video Cameras',
        slug: 'video-cameras',
        items: [
          { label: 'Cinema Cameras', slug: 'cinema' },
          { label: 'Action Cameras', slug: 'action' },
          { label: 'Camcorders', slug: 'camcorders' },
          { label: 'Drones', slug: 'drones' },
        ],
      },
      {
        label: 'Gimbals',
        slug: 'gimbals',
        items: [
          { label: 'Phone Gimbals', slug: 'phone-gimbals' },
          { label: 'Camera Gimbals', slug: 'camera-gimbals' },
          { label: 'Sliders', slug: 'sliders' },
        ],
      },
      {
        label: 'Microphones',
        slug: 'microphones',
        items: [
          { label: 'Wireless Mics', slug: 'wireless-mics' },
          { label: 'Shotgun Mics', slug: 'shotgun-mics' },
          { label: 'Lavalier Mics', slug: 'lavalier-mics' },
        ],
      },
      {
        label: 'Video Lighting',
        slug: 'video-lighting',
        items: [
          { label: 'LED Panels', slug: 'led-panels' },
          { label: 'Tube Lights', slug: 'tube-lights' },
          { label: 'Backdrops', slug: 'backdrops' },
        ],
      },
    ],
    featured: {
      title: 'Starter kits for creators',
      description: 'Camera, mic and light bundled by sellers, ready for your first shoot.',
      href: '/marketplace?category=videography&subcategory=kits',
      cta: 'View kits',
    },
  },
  {
    label: 'Audio',
    slug: 'audio',
    subcategories: [
      {
        label: 'Headphones',
        slug: 'headphones',
        items: [
          { label: 'Over-ear', slug: 'over-ear' },
          { label: 'In-ear', slug: 'in-ear' },
          { label: 'True Wireless', slug: 'true-wireless' },
        ],
      },
      {
        label: 'Speakers',
        slug: 'speakers',
        items: [
          { label: 'Bluetooth Speakers', slug: 'bluetooth-speakers' },
          { label: 'Soundbars', slug: 'soundbars' },
          { label: 'Party Speakers', slug: 'party-speakers' },
        ],
      },
    ],
  },
  {
    label: 'Gaming',
    slug: 'gaming',
    subcategories: [
      {
        label: 'Consoles',
        slug: 'consoles',
        items: [
          { label: 'PlayStation', slug: 'playstation' },
          { label: 'Xbox', slug: 'xbox' },
          { label: 'Nintendo', slug: 'nintendo' },
        ],
      },
      {
        label: 'PC Gaming',
        slug: 'pc-gaming',
        items: [
          { label: 'Gaming Laptops', slug: 'gaming-laptops' },
          { label: 'Keyboards and Mice', slug: 'keyboards-mice' },
          { label: 'Monitors', slug: 'monitors' },
        ],
      },
    ],
  },
  {
    label: 'Accessories',
    slug: 'accessories',
    subcategories: [
      {
        label: 'Charging',
        slug: 'charging',
        items: [
          { label: 'Chargers', slug: 'chargers' },
          { label: 'Cables', slug: 'cables' },
          { label: 'Power Banks', slug: 'power-banks' },
        ],
      },
      {
        label: 'Protection',
        slug: 'protection',
        items: [
          { label: 'Cases', slug: 'cases' },
          { label: 'Screen Protectors', slug: 'screen-protectors' },
        ],
      },
    ],
  },
  // Plain link category (no dropdown): shows in the primary color.
  { label: 'Deals', slug: 'deals', href: '/marketplace?sale=true', subcategories: [] },
];

/**
 * CHANGE HERE: single place that builds every category link.
 * Output example: /marketplace?category=apple&subcategory=iphone&item=iphone-17-pro
 * Rename the query params if the marketplace page expects different ones.
 */
function categoryHref(parts: { category: string; sub?: string; item?: string }) {
  const params = new URLSearchParams({ category: parts.category });
  if (parts.sub) params.set('subcategory', parts.sub);
  if (parts.item) params.set('item', parts.item);
  return `/marketplace?${params.toString()}`;
}

/* ---------------------------------------------------------------------
 * 2) DESKTOP MEGA MENU  (visible lg and up, rendered in Row 2)
 * ---------------------------------------------------------------------
 * The panel is `absolute inset-x-0 top-full`, so it is positioned against the
 * sticky <header> (nearest positioned ancestor) and spans the full width.
 * Do NOT add `relative` to any wrapper between this and <header>, or the panel
 * will shrink to that wrapper's width.
 */
const CLOSE_DELAY_MS = 140; // hover-intent delay so the panel does not flicker

function MegaMenu() {
  const pathname = usePathname();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [shownSlug, setShownSlug] = useState<string | null>(null); // keeps content while fading out
  const [activeSub, setActiveSub] = useState<Record<string, string>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const open = useCallback(
    (slug: string) => {
      cancelClose();
      setOpenSlug(slug);
      setShownSlug(slug);
    },
    [cancelClose],
  );

  const scheduleClose = useCallback(() => {
    cancelClose();
    timer.current = setTimeout(() => setOpenSlug(null), CLOSE_DELAY_MS);
  }, [cancelClose]);

  useEffect(() => {
    setOpenSlug(null);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenSlug(null);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      cancelClose();
    };
  }, [cancelClose]);

  const shown = NAV_CATEGORIES.find((c) => c.slug === shownSlug) ?? null;
  const isOpen = openSlug !== null;
  const sub =
    shown &&
    (shown.subcategories.find((s) => s.slug === activeSub[shown.slug]) ?? shown.subcategories[0]);

  return (
    <div
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenSlug(null);
      }}
    >
      {/* Category bar */}
      <nav aria-label="Product categories" className="flex items-center gap-1">
        {NAV_CATEGORIES.map((category) => {
          if (category.subcategories.length === 0) {
            return (
              <Link
                key={category.slug}
                href={category.href ?? categoryHref({ category: category.slug })}
                onMouseEnter={() => setOpenSlug(null)}
                className="rounded-md px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                {category.label}
              </Link>
            );
          }
          const active = openSlug === category.slug;
          return (
            <button
              key={category.slug}
              type="button"
              aria-haspopup="true"
              aria-expanded={active}
              onMouseEnter={() => open(category.slug)}
              onFocus={() => open(category.slug)}
              onClick={() => (active ? setOpenSlug(null) : open(category.slug))}
              className={`relative flex items-center gap-1 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {category.label}
              <ChevronDown
                className={`size-3.5 transition-transform duration-200 ${active ? 'rotate-180' : ''}`}
              />
              <span
                className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary transition-opacity ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Mega panel: [subcategories] [items of hovered subcategory] [featured tile] */}
      <div
        aria-hidden={!isOpen}
        className={`absolute inset-x-0 top-full border-b border-border bg-popover shadow-2xl shadow-black/10 transition-all duration-200 ${
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
        }`}
      >
        {shown && sub && (
          <div className="mx-auto grid max-w-7xl grid-cols-[15rem_1fr] px-4 sm:px-6 lg:grid-cols-[15rem_1fr_18rem] lg:px-8">
            {/* Level 2: subcategories (hover or focus switches the middle column) */}
            <ul className="border-r border-border py-5 pr-4">
              {shown.subcategories.map((s) => {
                const selected = s.slug === sub.slug;
                return (
                  <li key={s.slug}>
                    <Link
                      href={categoryHref({ category: shown.slug, sub: s.slug })}
                      onMouseEnter={() => setActiveSub((prev) => ({ ...prev, [shown.slug]: s.slug }))}
                      onFocus={() => setActiveSub((prev) => ({ ...prev, [shown.slug]: s.slug }))}
                      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        selected
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s.label}
                      <ChevronRight
                        className={`size-4 transition-all ${
                          selected ? 'translate-x-0 text-primary opacity-100' : '-translate-x-1 opacity-0'
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Level 3: items */}
            <div className="px-8 py-5">
              <Link
                href={categoryHref({ category: shown.slug, sub: sub.slug })}
                className="mb-3 inline-flex items-center gap-1 text-base font-semibold text-foreground hover:text-primary"
              >
                All {sub.label}
                <ChevronRight className="size-4" />
              </Link>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5 xl:grid-cols-3">
                {sub.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={categoryHref({ category: shown.slug, sub: sub.slug, item: item.slug })}
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {item.label}
                      {item.badge && (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Featured tile (optional per category) */}
            {shown.featured && (
              <div className="hidden py-5 pl-2 lg:block">
                <Link
                  href={shown.featured.href}
                  className="flex h-full min-h-48 flex-col justify-end rounded-2xl bg-secondary p-5 transition-colors hover:bg-accent"
                >
                  <p className="text-base font-semibold text-foreground">{shown.featured.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{shown.featured.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {shown.featured.cta}
                    <ChevronRight className="size-4" />
                  </span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
 * 3) MOBILE MENU  (hamburger + left drawer, hidden on lg and up)
 * ---------------------------------------------------------------------
 * Accordion behaviour: one category open at a time, one subcategory open at a time.
 * `showAuthLinks` hides the Login / Sign up buttons when someone is already logged in.
 */
function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  // Smooth height animation with grid rows (no fixed heights needed).
  return (
    <div
      aria-hidden={!open}
      className={`grid transition-[grid-template-rows,visibility] duration-200 ease-out ${
        open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
      }`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

function MobileMenu({ showAuthLinks }: { showAuthLinks: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false); // portal needs document, so wait for the client
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // lock page scroll while drawer is open
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    // If the screen grows to desktop width while open, close the drawer and unlock scroll.
    const desktop = window.matchMedia('(min-width: 1024px)');
    function onResize() {
      if (desktop.matches) setIsOpen(false);
    }
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Open categories"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="-ml-2 rounded-lg p-2 text-foreground hover:bg-secondary lg:hidden"
      >
        <Menu className="size-6" />
      </button>

      {mounted &&
        createPortal(
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${isOpen ? 'visible' : 'invisible'}`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={isOpen ? 0 : -1}
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Categories"
          className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="text-lg font-bold tracking-tight">
              Socio<span className="text-primary">.</span>
            </span>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav aria-label="Product categories" className="flex-1 overflow-y-auto overscroll-contain">
            <ul className="divide-y divide-border">
              {NAV_CATEGORIES.map((category) => {
                if (category.subcategories.length === 0) {
                  return (
                    <li key={category.slug}>
                      <Link
                        href={category.href ?? categoryHref({ category: category.slug })}
                        className="flex items-center px-4 py-4 text-base font-semibold text-primary"
                      >
                        {category.label}
                      </Link>
                    </li>
                  );
                }

                const categoryOpen = openCategory === category.slug;
                return (
                  <li key={category.slug}>
                    <button
                      type="button"
                      aria-expanded={categoryOpen}
                      onClick={() => {
                        setOpenCategory(categoryOpen ? null : category.slug);
                        setOpenSub(null);
                      }}
                      className="flex w-full items-center justify-between px-4 py-4 text-left text-base font-semibold"
                    >
                      {category.label}
                      <ChevronDown
                        className={`size-5 text-muted-foreground transition-transform duration-200 ${
                          categoryOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <Collapse open={categoryOpen}>
                      <ul className="bg-secondary/50 pb-2">
                        <li>
                          <Link
                            href={categoryHref({ category: category.slug })}
                            className="block px-6 py-3 text-sm font-medium text-primary"
                          >
                            Shop all {category.label}
                          </Link>
                        </li>
                        {category.subcategories.map((sub) => {
                          const key = `${category.slug}/${sub.slug}`;
                          const subOpen = openSub === key;
                          return (
                            <li key={key}>
                              <button
                                type="button"
                                aria-expanded={subOpen}
                                onClick={() => setOpenSub(subOpen ? null : key)}
                                className="flex w-full items-center justify-between px-6 py-3 text-left text-sm font-medium"
                              >
                                {sub.label}
                                <ChevronDown
                                  className={`size-4 text-muted-foreground transition-transform duration-200 ${
                                    subOpen ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                              <Collapse open={subOpen}>
                                <ul className="ml-6 border-l border-border pb-2">
                                  <li>
                                    <Link
                                      href={categoryHref({ category: category.slug, sub: sub.slug })}
                                      className="block py-2.5 pl-4 text-sm font-medium text-primary"
                                    >
                                      All {sub.label}
                                    </Link>
                                  </li>
                                  {sub.items.map((item) => (
                                    <li key={item.slug}>
                                      <Link
                                        href={categoryHref({
                                          category: category.slug,
                                          sub: sub.slug,
                                          item: item.slug,
                                        })}
                                        className="flex items-center gap-2 py-2.5 pl-4 text-sm text-muted-foreground hover:text-foreground"
                                      >
                                        {item.label}
                                        {item.badge && (
                                          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
                                            {item.badge}
                                          </span>
                                        )}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </Collapse>
                            </li>
                          );
                        })}
                      </ul>
                    </Collapse>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="shrink-0 space-y-2 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Link
              href="/register/vendor"
              className="block rounded-lg border border-border px-4 py-3 text-center text-sm font-semibold hover:bg-secondary"
            >
              Become a vendor
            </Link>
            {showAuthLinks && (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/user/login"
                  className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/register/user"
                  className="rounded-lg border border-border px-4 py-3 text-center text-sm font-semibold hover:bg-secondary"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>,
          document.body,
        )}
    </>
  );
}

/* ---------------------------------------------------------------------
 * 4) SITE HEADER  (exported; used by the layout)
 * ---------------------------------------------------------------------
 * Auth / cart / theme logic below is the ORIGINAL MVP code. Do not change it.
 */
export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart } = useCart();
  const { mode, setMode } = useTheme();
  const cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  const [buyer, setBuyer] = useState<{ firstName?: string } | null>(null);
  const [sellerLoggedIn, setSellerLoggedIn] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const storedUser = localStorage.getItem('socio-user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.roles?.includes('buyer')) setBuyer(parsed);
        } catch {
          setBuyer(null);
        }
      }
      setSellerLoggedIn(Boolean(localStorage.getItem('socio-seller')));
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  async function handleLogout() {
    if (buyer) {
      localStorage.removeItem('socio-user');
      localStorage.removeItem('socio-user-token');
      setBuyer(null);
      router.replace('/');
      return;
    }
    await fetch('/api/auth/seller/logout', { method: 'POST' });
    localStorage.removeItem('socio-seller');
    localStorage.removeItem('socio-seller-token');
    setSellerLoggedIn(false);
    router.replace('/');
  }

  // CHANGE HERE: search destination. Currently goes to /marketplace?q=<text>.
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/marketplace?q=${encodeURIComponent(q)}`);
  }

  // Shared by the desktop search (inside Row 1) and the mobile search (own row).
  const searchForm = (className: string) => (
    <form
      role="search"
      onSubmit={handleSearch}
      className={`flex h-10 items-center rounded-full md:h-11 border border-border bg-secondary/60 pl-5 pr-1.5 transition-colors focus-within:border-primary focus-within:bg-background focus-within:ring-4 focus-within:ring-primary/15 ${className}`}
    >
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search phones, cameras, creators, stores"
        aria-label="Search products"
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Search className="size-4" />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* ROW 1: [hamburger] logo | search | actions */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 sm:h-16 sm:gap-3 px-4 sm:px-6 lg:gap-8 lg:px-8">
        <div className="flex shrink-0 items-center gap-2">
          <MobileMenu showAuthLinks={!buyer && !sellerLoggedIn} />
          <Link
            href="/"
            aria-label="Socio Commerce home"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            Socio<span className="text-primary">.</span>
          </Link>
        </div>

        {/* Desktop / tablet search (md and up) */}
        {searchForm('mx-auto hidden w-full max-w-2xl flex-1 md:flex')}

        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
          <button
            type="button"
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {mode === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          {buyer && <NotificationCenter />}
          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {/* AUTH AREA: original MVP markup, unchanged */}
          {buyer ? (
            <>
              <Link
                href="/user/profile"
                aria-label="Profile"
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <CircleUserRound className="size-5" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary sm:block"
              >
                Logout
              </button>
            </>
          ) : sellerLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              <LogOut className="size-4" />
            </button>
          ) : (
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full bg-primary px-3.5 py-2 sm:px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 [&::-webkit-details-marker]:hidden">
                Login
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-border bg-popover p-2 shadow-xl">
                <Link
                  href="/user/login"
                  className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Login as buyer
                </Link>
                <Link
                  href="/seller/login"
                  className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Seller login
                </Link>
                <Link
                  href="/admin/login"
                  className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Admin login
                </Link>
                <Link
                  href="/register/user"
                  className="mt-1 block rounded-lg border-t border-border px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
                >
                  Create account
                </Link>
              </div>
            </details>
          )}
        </div>
      </div>

      {/* Mobile search row (below md). */}
      <div className="px-4 pb-2.5 sm:px-6 md:hidden">{searchForm('w-full')}</div>

      {/* ROW 2 (desktop only): mega menu. See MegaMenu notes about `relative`. */}
      <div className="hidden border-t border-border/60 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <MegaMenu />
          <Link
            href="/register/vendor"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Become a vendor
          </Link>
        </div>
      </div>
    </header>
  );
}
