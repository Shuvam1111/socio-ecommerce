'use client';

/**
 * =====================================================================
 * SITE FOOTER  (single file mega footer, no extra files needed)
 * =====================================================================
 * LAYOUT (top to bottom)
 *   1. Newsletter / community band
 *   2. Brand block + 4 link columns (accordions on phones, open columns on md+)
 *   3. Popular category chips
 *   4. Company information panel (registered business details + payments)
 *   5. Bottom bar: copyright, legal links, back-to-top
 *
 * NOTES FOR ANOTHER AI / DEVELOPER:
 *   1. All editable content lives in the CONFIG block right below the imports
 *      (COMPANY, SOCIALS, FOOTER_COLUMNS, CATEGORY_CHIPS, LEGAL_LINKS). Edit data there,
 *      not in the JSX.
 *   2. COMPANY values are SAMPLE PLACEHOLDERS. Replace them with the real registered
 *      business details before launch (search "CHANGE HERE").
 *   3. Some link targets (help, about, privacy, terms ...) may not exist as pages yet.
 *      Create those pages or update the hrefs in the CONFIG block.
 *   4. The newsletter form is UI-only right now. Wire it to the backend inside
 *      handleSubscribe() (search "CHANGE HERE").
 *   5. The logo is text ("Socio" + primary dot), same as the header. When a real logo
 *      exists, replace <FooterLogo /> (one place).
 *   6. Colors use theme tokens only (primary, card, border, muted-foreground ...), so
 *      all themes and dark mode keep working. Do not hardcode colors.
 *   7. Social icons are small inline SVGs so no extra icon package version is needed.
 */

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  Building2,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  Hash,
  Headset,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

/* =====================================================================
 * CONFIG  (edit content here)
 * ===================================================================== */

/**
 * CHANGE HERE: replace every value with the real registered business details.
 * These are sample placeholders only.
 */
const COMPANY = {
  brandName: 'Socio Commerce',
  legalName: 'Socio Commerce Pvt. Ltd.',
  registrationNo: 'Reg. No. 000000/000/000',
  panVat: 'PAN / VAT: 000000000',
  address: 'Putalisadak, Kathmandu 44600, Nepal',
  phone: '+977-1-0000000',
  phoneHref: 'tel:+97710000000',
  email: 'support@socio.example',
  grievanceEmail: 'complaints@socio.example',
  hours: 'Sun to Fri, 9:00 AM to 6:00 PM (NPT)',
  tagline: 'Shop. Share. Earn.',
  description:
    'Nepal’s social commerce marketplace where verified sellers, creators and shoppers meet. Discover products, watch stories, earn rewards and buy with confidence.',
};

type SocialLink = { label: string; href: string; icon: 'facebook' | 'instagram' | 'youtube' | 'x' };
/** CHANGE HERE: real social profile URLs. */
const SOCIALS: SocialLink[] = [
  { label: 'Facebook', href: 'https://facebook.com/', icon: 'facebook' },
  { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
  { label: 'YouTube', href: 'https://youtube.com/', icon: 'youtube' },
  { label: 'X', href: 'https://x.com/', icon: 'x' },
];

type FooterLink = { label: string; href: string };
type FooterColumnData = { title: string; links: FooterLink[] };

/** CHANGE HERE: link columns. Some hrefs may not have pages yet (see note 3). */
const FOOTER_COLUMNS: FooterColumnData[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', href: '/marketplace' },
      { label: "Today's deals", href: '/marketplace?sale=true' },
      { label: 'Top rated', href: '/marketplace?sort=rating' },
      { label: 'New arrivals', href: '/marketplace?sort=newest' },
      { label: 'My cart', href: '/cart' },
    ],
  },
  {
    title: 'Sell and earn',
    links: [
      { label: 'Become a vendor', href: '/register/vendor' },
      { label: 'Seller login', href: '/seller/login' },
      { label: 'Creators and influencers', href: '/creators' },
      { label: 'Affiliate marketers', href: '/affiliates' },
      { label: 'Refer and earn coins', href: '/rewards' },
    ],
  },
  {
    title: 'Help and support',
    links: [
      { label: 'Help center', href: '/help' },
      { label: 'Track your order', href: '/user/orders' },
      { label: 'Shipping and delivery', href: '/help/shipping' },
      { label: 'Returns and refunds', href: '/help/returns' },
      { label: 'Contact us', href: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Socio', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Press', href: '/press' },
      { label: 'Community guidelines', href: '/community-guidelines' },
    ],
  },
];

/** Same query format the header mega menu uses: /marketplace?category=<slug> */
const CATEGORY_CHIPS: FooterLink[] = [
  { label: 'Apple', href: '/marketplace?category=apple' },
  { label: 'Android', href: '/marketplace?category=android' },
  { label: 'Photography', href: '/marketplace?category=photography' },
  { label: 'Videography', href: '/marketplace?category=videography' },
  { label: 'Audio', href: '/marketplace?category=audio' },
  { label: 'Gaming', href: '/marketplace?category=gaming' },
  { label: 'Accessories', href: '/marketplace?category=accessories' },
];

/** CHANGE HERE: legal pages shown in the bottom bar. */
const LEGAL_LINKS: FooterLink[] = [
  { label: 'Terms and conditions', href: '/terms' },
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Refund policy', href: '/help/returns' },
  { label: 'Cookie policy', href: '/cookies' },
  { label: 'Sitemap', href: '/sitemap' },
];

const PAYMENT_METHODS = ['eSewa', 'Khalti', 'Bank transfer'];

type CompanyItem = { icon: LucideIcon; label: string; value: string; href?: string };
const COMPANY_ITEMS: CompanyItem[] = [
  { icon: Building2, label: 'Registered name', value: COMPANY.legalName },
  { icon: FileText, label: 'Company registration', value: COMPANY.registrationNo },
  { icon: Hash, label: 'Tax details', value: COMPANY.panVat },
  { icon: MapPin, label: 'Registered office', value: COMPANY.address },
  { icon: Phone, label: 'Customer support', value: COMPANY.phone, href: COMPANY.phoneHref },
  { icon: Mail, label: 'Email', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  { icon: Clock, label: 'Support hours', value: COMPANY.hours },
  {
    icon: Headset,
    label: 'Complaints and grievances',
    value: COMPANY.grievanceEmail,
    href: `mailto:${COMPANY.grievanceEmail}`,
  },
];

/* =====================================================================
 * MAIN FOOTER
 * ===================================================================== */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        {/* 1. Newsletter band */}
        <NewsletterBand />

        {/* 2. Brand + link columns */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] lg:gap-14">
          <div>
            <FooterLogo />
            <p className="mt-1 text-sm font-medium text-primary">{COMPANY.tagline}</p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              {COMPANY.description}
            </p>

            <ul className="mt-5 space-y-2.5 text-sm">
              <li>
                <a
                  href={COMPANY.phoneHref}
                  className="inline-flex items-center gap-2.5 text-foreground transition hover:text-primary"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="size-4" />
                  </span>
                  {COMPANY.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="inline-flex items-center gap-2.5 text-foreground transition hover:text-primary"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="size-4" />
                  </span>
                  {COMPANY.email}
                </a>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <SocialIcon name={social.icon} />
                </a>
              ))}
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="grid border-t border-border md:grid-cols-4 md:gap-8 md:border-t-0"
          >
            {FOOTER_COLUMNS.map((column) => (
              <FooterColumn key={column.title} column={column} />
            ))}
          </nav>
        </div>

        {/* 3. Category chips */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="shrink-0 text-sm font-semibold text-foreground">Popular categories</p>
          <ul className="flex flex-wrap gap-2">
            {CATEGORY_CHIPS.map((chip) => (
              <li key={chip.label}>
                <Link
                  href={chip.href}
                  className="inline-flex rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  {chip.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Company information */}
        <section
          aria-labelledby="company-info-heading"
          className="mt-8 overflow-hidden rounded-3xl border border-border bg-background"
        >
          <div className="flex flex-col gap-1 border-b border-border bg-secondary/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2 id="company-info-heading" className="text-base font-bold text-foreground">
                Company information
              </h2>
              <p className="text-xs text-muted-foreground">
                Registered business details of {COMPANY.brandName}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <BadgeCheck className="size-3.5" /> Registered business
            </span>
          </div>

          <dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
            {COMPANY_ITEMS.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
                    {href ? (
                      <a href={href} className="transition hover:text-primary">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <CreditCard className="size-4" /> We accept
              </span>
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground"
                >
                  {method}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" /> Secure payments
              </span>
              <span className="flex items-center gap-1.5">
                <Landmark className="size-4 text-primary" /> Verified bank and wallet accounts
              </span>
            </div>
          </div>
        </section>

        {/* 5. Bottom bar */}
        <div className="mt-8 flex flex-col gap-5 border-t border-border pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              © {year} {COMPANY.legalName}. All rights reserved.
            </p>
            <p className="max-w-xl text-xs leading-5 text-muted-foreground/80">
              {COMPANY.brandName} is a marketplace. Products are sold by independent, verified
              vendors, and all prices are in Nepalese Rupees (NPR) unless stated otherwise.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"
            >
              <ArrowUp className="size-3.5" /> Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =====================================================================
 * PIECES
 * ===================================================================== */

/** CHANGE HERE: swap for a real logo image when available. */
function FooterLogo() {
  return (
    <Link
      href="/"
      aria-label={`${COMPANY.brandName} home`}
      className="inline-block text-2xl font-bold tracking-tight text-foreground"
    >
      Socio<span className="text-primary">.</span>
    </Link>
  );
}

function NewsletterBand() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'done'>('idle');

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setStatus('error');
      return;
    }
    // CHANGE HERE: send `email` to the backend / mailing list (e.g. POST /api/newsletter).
    setStatus('done');
    setEmail('');
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/70 p-6 text-primary-foreground sm:p-10">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-28 size-80 rounded-full border border-current opacity-20" />
        <div className="absolute -right-8 -top-12 size-52 rounded-full border border-current opacity-20" />
        <div className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-current opacity-[0.07] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="relative grid items-center gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
            Join the community
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
            Deals, creator picks and new seller drops. In your inbox.
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            One short email a week. Unsubscribe anytime.
          </p>
        </div>

        <div>
          {status === 'done' ? (
            <div className="flex items-center gap-3 rounded-2xl bg-primary-foreground/15 p-4 text-sm font-semibold backdrop-blur">
              <BadgeCheck className="size-5 shrink-0" />
              You are in! Watch your inbox for the next drop.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} noValidate>
              <div className="flex flex-col gap-2 rounded-2xl bg-background p-1.5 shadow-lg sm:flex-row sm:items-center">
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    id="footer-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="Enter your email"
                    aria-invalid={status === 'error'}
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Subscribe <Send className="size-4" />
                </button>
              </div>
              {status === 'error' && (
                <p role="alert" className="mt-2 text-xs font-medium text-primary-foreground">
                  Please enter a valid email address.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/** Accordion on phones, always-open column on md and up. */
function FooterColumn({ column }: { column: FooterColumnData }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border md:border-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-bold text-foreground md:pointer-events-none md:cursor-default md:pb-4 md:pt-0"
      >
        {column.title}
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-200 md:hidden ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows,visibility] duration-200 ease-out md:visible md:grid-rows-[1fr] ${
          open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-2.5 pb-4 md:pb-0">
            {column.links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
                >
                  <ArrowRight className="-ml-4 size-3.5 text-primary opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SocialIcon({ name }: { name: SocialLink['icon'] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'facebook':
      return (
        <svg {...common}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...common}>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...common}>
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5-3-5-3z" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common}>
          <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
          <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
        </svg>
      );
  }
}
