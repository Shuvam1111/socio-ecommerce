# Socio Commerce

A modern, scalable social-commerce platform built with **Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui**.

The project is currently focused on building the **frontend foundation and e-commerce UI architecture** using temporary JSON/mock data. The backend and API layer will be integrated later without requiring major frontend restructuring.

---

## 1. Project Overview

Socio Commerce is designed as a scalable e-commerce platform with support for:

- Product browsing
- Categories
- Shopping cart
- Wishlist
- Checkout
- Orders
- Reviews
- Authentication
- User accounts
- Vendor/product management
- Future backend/API integration

The current development approach is:

```text
Frontend
   ↓
Feature Components
   ↓
Services
   ↓
Mock JSON Data

Later:

Frontend
   ↓
Feature Components
   ↓
Services
   ↓
API Client
   ↓
Backend
```

The main goal is to avoid coupling the UI directly to mock data or future backend implementation.

---

# 2. Technology Stack

## Core

- Next.js `16.3.5`
- React `19.2.8`
- TypeScript `5`
- Node.js `24+`

## Styling

- Tailwind CSS `4`
- CSS custom properties
- Semantic design tokens
- Responsive-first UI

## UI

- shadcn/ui
- Radix UI
- Lucide Icons
- Sonner

## Development Quality

- ESLint `9`
- Prettier
- Husky
- lint-staged
- Commitlint
- GitHub Actions CI

---

# 3. Getting Started

## Clone the project

```powershell
git clone <repository-url>
cd socio-commerce
```

## Install dependencies

```powershell
npm install
```

## Start development server

```powershell
npm run dev
```

The application will normally be available at:

```text
http://localhost:3000
```

---

# 4. Available Scripts

Run the following commands from the project root.

```powershell
npm run dev
```

Starts the development server.

```powershell
npm run build
```

Creates a production build.

```powershell
npm run start
```

Starts the production server.

```powershell
npm run lint
```

Runs ESLint.

```powershell
npm run format
```

Formats the project with Prettier.

```powershell
npm run format:check
```

Checks whether files are correctly formatted.

```powershell
npm run type-check
```

Runs TypeScript type checking without emitting files.

```powershell
npm run prepare
```

Initializes Husky hooks.

---

# 5. Project Structure

The project follows a feature-oriented architecture.

```text
src/
├── app/
│   ├── ...
│   └── ui-playground/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── theme/
│   └── common/
│
├── features/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── wishlist/
│   ├── checkout/
│   ├── orders/
│   ├── reviews/
│   └── auth/
│
├── data/
├── hooks/
├── lib/
├── services/
├── stores/
├── types/
└── styles/
```

---

# 6. Architecture Principles

The project intentionally separates UI, business features, services, and data.

## Current architecture

```text
UI
 ↓
Feature
 ↓
Service
 ↓
Mock JSON
```

## Future architecture

```text
UI
 ↓
Feature
 ↓
Service
 ↓
API Client
 ↓
Backend
```

This allows the backend to be introduced later without rewriting components.

For example, a product page should not directly import:

```text
data/products.json
```

Instead:

```text
ProductPage
    ↓
Product feature
    ↓
productService
    ↓
mock products
```

Later:

```text
ProductPage
    ↓
Product feature
    ↓
productService
    ↓
API client
    ↓
Backend
```

The component should not care whether the data comes from JSON or an API.

---

# 7. Component Architecture

Components are divided into three major levels.

## `components/ui`

Contains low-level shadcn/ui primitives.

Examples:

```text
components/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
├── alert-dialog.tsx
├── input.tsx
├── badge.tsx
├── calendar.tsx
└── sonner.tsx
```

These components should remain generic.

Do not put business-specific logic here.

---

## `components/common`

Contains application-level reusable components.

Examples:

```text
components/common/
├── confirm-dialog.tsx
├── alert-banner.tsx
├── date-picker.tsx
└── ...
```

These components combine low-level UI primitives into reusable application patterns.

For example:

```text
AlertDialog
    ↓
ConfirmDialog
```

`AlertDialog` is the generic primitive.

`ConfirmDialog` is the application-level abstraction.

---

## `features`

Business-specific components belong inside their respective feature.

Example:

```text
features/products/
├── components/
├── services/
├── hooks/
├── types/
└── ...
```

A product-specific component should not be placed inside `components/common`.

---

# 8. Server vs Client Components

The default approach is:

> Use Server Components whenever possible.

Use `'use client'` only when client-side functionality is actually required.

Client components are appropriate for:

- `useState`
- `useEffect`
- browser APIs
- event-driven interactive UI
- theme switching
- interactive dialogs
- toast interaction
- client-side stores

Avoid converting an entire page to a Client Component just because one small component needs client-side behavior.

Instead, isolate the client-side component.

---

# 9. Utility Function

The project uses a shared `cn()` utility.

File:

```text
src/lib/utils.ts
```

Current implementation:

```ts
export { cn } from 'cn';
```

Use:

```tsx
className={cn(
  'base-class',
  condition && 'conditional-class',
  className,
)}
```

Do not duplicate class-merging utilities throughout the project.

---

# 10. Design System

The application uses a semantic design-token approach.

Components should use semantic classes instead of hardcoded colors.

Prefer:

```tsx
bg - primary;
text - primary - foreground;
bg - card;
text - muted - foreground;
border - border;
bg - success;
text - destructive;
```

Instead of:

```tsx
bg-[#6d5dfc]
text-[#666]
border-[#ddd]
```

This is important because the application supports multiple themes.

---

# 11. Themes

The application currently supports:

- Violet
- Emerald
- Rose

File:

```text
src/lib/themes.ts
```

Current configuration:

```ts
export const themes = {
  violet: {
    name: 'Violet',
    description: 'Modern luxury',
  },
  emerald: {
    name: 'Emerald',
    description: 'Fresh and premium',
  },
  rose: {
    name: 'Rose',
    description: 'Elegant and stylish',
  },
} as const;

export type ThemeName = keyof typeof themes;

export const defaultTheme: ThemeName = 'violet';
```

---

# 12. Theme Colors

Primary theme colors currently include:

| Theme   | Primary   |
| ------- | --------- |
| Violet  | `#6d5dfc` |
| Emerald | `#087f5b` |
| Rose    | `#c24172` |

These values should normally be changed in the theme/design-token layer rather than directly inside components.

---

# 13. Semantic Color System

The design system uses semantic variables such as:

```text
primary
primary-foreground

secondary
secondary-foreground

accent
accent-foreground

background
foreground

card
card-foreground

popover
popover-foreground

muted
muted-foreground

border
input
ring

success
success-foreground

warning
warning-foreground

destructive
destructive-foreground

info
info-foreground
```

Example:

```tsx
<div className="bg-card text-card-foreground border border-border">
```

This allows the same component to work across all themes.

---

# 14. Theme Provider

The theme is controlled through:

```text
src/components/theme/theme-provider.tsx
```

The provider stores the selected theme using:

```text
socio-theme
```

in `localStorage`.

The active theme is applied using:

```html
<html data-theme="violet"></html>
```

or:

```html
<html data-theme="emerald"></html>
```

or:

```html
<html data-theme="rose"></html>
```

The provider exposes:

```ts
const { theme, setTheme } = useTheme();
```

---

# 15. Theme Flash Prevention

The project includes:

```text
src/components/theme/theme-script.tsx
```

This script reads the saved theme before the application renders and applies:

```text
data-theme
```

to the document.

This prevents an unwanted flash of the default theme during page load.

The root HTML element also uses:

```tsx
<html
  lang="en"
  suppressHydrationWarning
>
```

Do not remove the theme script unless replacing it with an equally reliable hydration-safe solution.

---

# 16. Fonts

The application uses:

- Plus Jakarta Sans
- Geist
- Geist Mono

The fonts are loaded through `next/font/google`.

The main UI font is exposed through:

```text
--font-sans
```

Additional font variables include:

```text
--font-jakarta
--font-geist-mono
```

The goal is a modern, premium e-commerce appearance.

---

# 17. Layout System

The application uses:

```text
SiteShell
├── SiteHeader
├── main
└── SiteFooter
```

File:

```text
src/components/layout/site-shell.tsx
```

Current structure:

```tsx
<div className="flex min-h-screen flex-col bg-background text-foreground">
  <SiteHeader />
  <main className="flex-1">{children}</main>
  <SiteFooter />
</div>
```

---

# 18. Container and Spacing Guidelines

Use consistent responsive page spacing.

Recommended:

```text
Mobile:
px-4

Tablet:
px-6

Desktop:
px-8
```

Standard container:

```tsx
mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8
```

Recommended section spacing:

```text
py-8
py-12
py-16
```

Large hero sections can use:

```text
py-20
```

Avoid introducing arbitrary spacing values unless there is a clear design reason.

---

# 19. Border Radius

The global radius is currently:

```text
--radius: 0.75rem
```

The design intentionally avoids excessive rounded/pill-shaped UI.

General guideline:

```text
Buttons / inputs:
6–8px feel

Cards / dialogs:
around 10px

Pills:
Only when semantically appropriate
```

Do not turn every component into a pill.

---

# 20. Shadows

The design system includes semantic shadow levels:

```text
--shadow-sm
--shadow-md
--shadow-lg
```

Use them instead of manually inventing shadows repeatedly.

Example:

```tsx
shadow - md;
```

or through the design system where appropriate.

---

# 21. shadcn/ui

shadcn/ui provides the low-level UI foundation.

The project uses the Nova style/preset.

Installed components include examples such as:

```text
Button
Card
Input
Badge
Dialog
AlertDialog
Calendar
Sonner
```

When adding new shadcn components, treat generated components as the foundation.

Do not blindly overwrite existing customized components if the CLI asks for confirmation.

If an existing component has already been customized for the project's architecture or theme system, preserve those changes.

---

# 22. UI Playground

The project includes a temporary design laboratory:

```text
/app/ui-playground
```

Development URL:

```text
http://localhost:3000/ui-playground
```

The playground is not production UI.

Its purpose is to:

- test components
- compare variants
- validate responsive behavior
- validate theme behavior
- document component APIs
- experiment before using components throughout the application

The playground currently covers areas including:

```text
Themes
Buttons
Button sizes
Cards
Inputs
Labels
Badges
Semantic colors
Status colors
Date picker
Confirmation dialogs
Alert dialogs
Toasts
Alert banners
```

When building a new reusable UI pattern, it is recommended to test it here first.

---

# 23. Feedback System

The application uses three different feedback patterns.

```text
Toast
    ↓
Temporary event feedback

Alert Banner
    ↓
Persistent contextual feedback

Confirm Dialog
    ↓
Explicit user decision
```

And underneath the Confirm Dialog:

```text
AlertDialog
    ↓
Low-level shadcn/Radix primitive
```

These should not be treated as interchangeable.

---

# 24. Toast Notifications

The application uses **Sonner**.

File:

```text
src/components/ui/sonner.tsx
```

The global toaster is mounted from:

```text
src/app/layout.tsx
```

Example:

```tsx
<Toaster />
```

The current toaster uses semantic icons:

```text
success → Check
info → Info
warning → Warning
error → Error
loading → Spinner
```

Toast behavior and animation are intentionally left to Sonner.

Do not modify the animation system unless there is a specific UX requirement.

---

# 25. Toast Visual Design

The toast backgrounds use very light semantic color tints.

Example concept:

```text
Success → light green tint
Warning → light yellow tint
Error   → light red tint
Info    → light blue tint
Loading → light primary tint
```

The backgrounds use `color-mix()` and `!important` because Sonner's own CSS variables otherwise override the custom backgrounds.

Example:

```css
.cn-toast-success {
  border-color: color-mix(in srgb, var(--success) 45%, var(--border));

  background: color-mix(in srgb, var(--success) 14%, var(--popover)) !important;
}
```

The same pattern is used for warning, error, info, and loading states.

---

# 26. Toast Usage

Import:

```tsx
import { toast } from 'sonner';
```

Success:

```tsx
toast.success('Product added to your cart.');
```

Error:

```tsx
toast.error('Payment could not be completed.');
```

Warning:

```tsx
toast.warning('Only 3 items remain in stock.');
```

Info:

```tsx
toast.info('Your order is being processed.');
```

Loading:

```tsx
toast.loading('Processing your order...');
```

Use toasts for events that do not require permanent contextual visibility.

---

# 27. AlertDialog

The project has the shadcn/Radix AlertDialog primitive:

```text
src/components/ui/alert-dialog.tsx
```

This is a **low-level primitive**.

It is not the same thing as the Alert Banner.

AlertDialog is intended for situations where the user must make an explicit decision.

Examples:

```text
Delete product?
Cancel order?
Reject request?
Deactivate account?
Restore item?
Publish changes?
```

---

# 28. AlertDialog Composition

The primitive supports:

```text
AlertDialog
├── AlertDialogTrigger
├── AlertDialogPortal
├── AlertDialogOverlay
├── AlertDialogContent
│   ├── AlertDialogHeader
│   ├── AlertDialogMedia
│   ├── AlertDialogTitle
│   ├── AlertDialogDescription
│   └── custom content
│
└── AlertDialogFooter
    ├── AlertDialogCancel
    └── AlertDialogAction
```

The content also supports a size option:

```text
default
sm
```

The component itself does not define business-specific variants such as:

```text
success
warning
error
```

Those are created through composition, icons, content, and button variants.

---

# 29. ConfirmDialog

For application-level confirmation flows, use:

```text
src/components/common/confirm-dialog.tsx
```

This wraps the low-level AlertDialog.

Example:

```tsx
<ConfirmDialog
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
  title="Delete vendor?"
  description="This action cannot be undone. The vendor and its associated data will be permanently deleted."
  confirmText="Delete Vendor"
  cancelText="Cancel"
  variant="destructive"
  loading={isDeleting}
  onConfirm={handleDelete}
/>
```

Use `ConfirmDialog` for common business decisions instead of rebuilding AlertDialog composition repeatedly.

---

# 30. Alert Banner

The Alert Banner is a separate application-level component:

```text
src/components/common/alert-banner.tsx
```

It is designed for persistent contextual information.

Examples:

```text
Your email is not verified
Only 3 products remain
Payment failed
Order successfully placed
New feature available
```

---

# 31. Alert Banner API

Current API:

```ts
type AlertBannerProps = {
  readonly variant?: AlertBannerVariant;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly onDismiss?: () => void;
  readonly className?: string;
};
```

Variants:

```ts
type AlertBannerVariant = 'success' | 'warning' | 'error' | 'info';
```

---

# 32. Alert Banner Variants

The component currently supports:

```text
success
warning
error
info
```

Each variant controls:

- semantic icon
- icon color
- icon background
- border color
- background tint

The component uses semantic design tokens rather than hardcoded theme colors.

---

# 33. Alert Banner Layout

The component is designed to be fully responsive.

Desktop concept:

```text
┌─────────────────────────────────────────────────────────┐
│ [icon]  Title                              [Action]     │
│         Description                                    │
└─────────────────────────────────────────────────────────┘
```

Smaller screens:

```text
┌─────────────────────────────────┐
│ [icon]  Title                  │
│         Description            │
│                                 │
│         [Action]                │
└─────────────────────────────────┘
```

This prevents buttons from squeezing long descriptions.

---

# 34. Alert Banner Title Only

Example:

```tsx
<AlertBanner variant="success" title="Order placed successfully" />
```

When there is no description, the title is vertically centered relative to the icon.

---

# 35. Alert Banner With Description

```tsx
<AlertBanner
  variant="success"
  title="Order placed successfully"
  description="Your order has been confirmed and is now being prepared for shipment."
/>
```

---

# 36. Alert Banner With Action

```tsx
<AlertBanner
  variant="error"
  title="Payment failed"
  description="We couldn't process your payment. Please check your payment method and try again."
  action={<Button size="sm">Try again</Button>}
/>
```

The `action` property accepts:

```ts
ReactNode;
```

Therefore it can contain any React content.

---

# 37. Multiple Actions

Multiple buttons can be passed through a wrapper:

```tsx
<AlertBanner
  variant="warning"
  title="Your email is not verified"
  description="Verify your email address to unlock all account features."
  action={
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm">Verify email</Button>

      <Button size="sm" variant="outline">
        Resend
      </Button>
    </div>
  }
/>
```

The `flex-wrap` is important for responsive behavior.

---

# 38. Dismissible Alert

```tsx
<AlertBanner
  variant="info"
  title="New feature available"
  description="You can now save products to your wishlist."
  onDismiss={() => setVisible(false)}
/>
```

The component handles the dismiss button UI.

The parent controls what happens after dismissal.

---

# 39. Action + Dismiss

Both can be used together:

```tsx
<AlertBanner
  variant="warning"
  title="Complete your profile"
  description="Add your phone number and address to make checkout faster."
  action={
    <Button size="sm" variant="outline">
      Complete profile
    </Button>
  }
  onDismiss={() => setVisible(false)}
/>
```

---

# 40. Custom Action Content

Because `action` is a `ReactNode`, this is also valid:

```tsx
<AlertBanner
  variant="info"
  title="Documentation updated"
  description="Learn about the latest changes."
  action={
    <Button size="sm" variant="outline">
      View documentation
    </Button>
  }
/>
```

Links and custom components can also be used.

---

# 41. When to Use Which Feedback Component

Use this decision guide.

## Toast

Use when:

> Something happened.

Examples:

```text
Product added to cart
Profile saved
Copied to clipboard
Payment submitted
```

Toast:

```tsx
toast.success('Product added to your cart.');
```

---

## Alert Banner

Use when:

> The user should continue seeing important contextual information.

Examples:

```text
Email not verified
Payment failed
Low stock
Account incomplete
System maintenance
```

Alert Banner:

```tsx
<AlertBanner variant="warning" title="Your email is not verified" />
```

---

## ConfirmDialog

Use when:

> The user must explicitly confirm or cancel an action.

Examples:

```text
Delete product?
Cancel order?
Deactivate account?
Reject request?
```

---

## AlertDialog

Use when:

> You need the low-level dialog primitive for a custom decision flow.

Most normal business confirmations should prefer:

```text
ConfirmDialog
```

rather than directly composing:

```text
AlertDialog
```

---

# 42. Date Picker System

The project also includes a reusable date-picker system supporting both:

```text
AD
BS
```

The architecture separates:

```text
Calendar
DatePicker
BS Calendar
Time Picker
Date utilities
```

Relevant areas include:

```text
components/ui/calendar.tsx
components/common/date-picker.tsx
components/common/bs-calendar.tsx
components/common/time-picker.tsx
lib/date/
```

The canonical internal representation is JavaScript `Date`.

The UI can display dates in either AD or BS while preserving the same underlying date/time value.

---

# 43. Legal Pages

Legal pages use structured data instead of hardcoding large JSX trees.

Types include:

```ts
LegalContent;
LegalSubsection;
LegalSection;
LegalDocument;
```

Supported content types include:

```text
paragraph
bullets
numbered
note
```

This allows Privacy Policy and Terms pages to be maintained as structured data.

---

# 44. Metadata

The root application metadata currently uses:

```ts
export const metadata: Metadata = {
  title: 'Socio Commerce',
  description: 'A modern social commerce platform.',
};
```

Page-specific metadata should be added where appropriate.

---

# 45. Coding Conventions

## Prefer readable code

Good:

```tsx
const isAvailable = product.stock > 0;
```

Avoid unnecessarily compressed logic.

---

## Use TypeScript types

Prefer explicit types for reusable component props:

```ts
type ProductCardProps = {
  readonly product: Product;
};
```

Use `readonly` for props and configuration objects where practical.

---

## Use semantic naming

Prefer:

```text
productService
productCard
confirmDialog
alertBanner
```

Avoid:

```text
helper1
box
thing
component2
```

---

# 46. Styling Conventions

Prefer Tailwind semantic classes:

```tsx
bg - background;
text - foreground;
text - muted - foreground;
border - border;
bg - card;
bg - primary;
text - primary - foreground;
```

Avoid hardcoded colors unless implementing the actual theme/token layer.

---

# 47. Responsive Design

Every reusable component should be tested at:

```text
Mobile
Tablet
Desktop
```

Do not assume desktop width.

Especially test components containing:

- long text
- buttons
- icons
- multiple actions
- dismiss controls
- forms
- cards
- dialogs

For action groups, prefer:

```tsx
flex flex-wrap
```

when appropriate.

---

# 48. Accessibility

Reusable components should include appropriate accessibility behavior.

Examples:

Buttons should use:

```tsx
aria - label;
```

when there is no visible text.

Decorative icons should use:

```tsx
aria-hidden="true"
```

Dismiss controls should have:

```tsx
aria-label="Dismiss notification"
```

Dialogs should use the appropriate Radix/shadcn dialog primitives rather than custom modal implementations.

---

# 49. Component Responsibility

A component should have one clear responsibility.

For example:

```text
AlertDialog
```

handles the low-level dialog primitive.

```text
ConfirmDialog
```

handles reusable confirmation UX.

```text
AlertBanner
```

handles persistent contextual feedback.

```text
Toast
```

handles temporary event feedback.

Do not merge these into one universal "notification" component.

---

# 50. Do Not Over-Abstract

The project intentionally avoids excessive abstraction.

Create a reusable component when:

- it is used in multiple places
- it represents a clear design pattern
- it has a stable API
- centralizing it improves consistency

Do not create a component simply because a JSX block appears once.

---

# 51. UI Playground Philosophy

The playground is effectively the project's visual component reference.

Before introducing a reusable component into production:

1. Build/test it in the playground.
2. Test all variants.
3. Test light/different themes.
4. Test responsive behavior.
5. Test long content.
6. Test accessibility.
7. Move the finalized reusable component into the appropriate directory.
8. Keep a representative example in the playground.

This makes the playground useful to future developers.

---

# 52. Current Feedback Architecture

The current feedback system can be visualized as:

```text
                 FEEDBACK SYSTEM
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
     Toast        Alert Banner     Confirm Dialog
       │               │                │
 temporary event   persistent       user decision
   feedback         context              │
                                          ▼
                                    AlertDialog
                                      primitive
```

This separation should be maintained.

---

# 53. Example E-Commerce Flow

A typical product interaction could look like:

```text
User clicks "Add to cart"
        │
        ▼
Cart operation succeeds
        │
        ▼
Toast.success()
```

If the product has limited stock:

```text
Product page
    │
    ▼
AlertBanner warning
```

If the user attempts deletion:

```text
Delete
  │
  ▼
ConfirmDialog
  │
  ├── Cancel
  │
  └── Confirm
```

If payment fails:

```text
Payment failure
      │
      ▼
AlertBanner
      │
      └── Try again
```

This keeps the UX predictable.

---

# 54. Git and Code Quality

Before committing significant changes, run:

```powershell
npm run format
npm run format:check
npm run lint
npm run type-check
npm run build
```

If all pass, the change is ready for integration.

Do not bypass lint/type errors just to get a build working.

Fix the underlying issue.

---

# 55. CI

GitHub Actions is configured to validate the project.

The CI environment uses Node.js 24.

The purpose of CI is to catch:

- formatting issues
- lint errors
- TypeScript errors
- build failures

Local development should use the same checks before pushing.

---

# 56. Adding New UI Components

When adding a new component:

### Step 1

Determine the responsibility.

```text
Generic primitive?
    → components/ui

Application-wide pattern?
    → components/common

Business-specific?
    → features/<feature>/components
```

### Step 2

Check whether shadcn already provides the primitive.

### Step 3

Add the primitive if needed.

### Step 4

Build the application-level abstraction if required.

### Step 5

Add a playground example.

### Step 6

Test:

```text
Violet
Emerald
Rose

Mobile
Tablet
Desktop
```

### Step 7

Run:

```powershell
npm run format
npm run lint
npm run type-check
npm run build
```

---

# 57. Important Architectural Rule

Do not solve a component-specific problem by modifying the global design system unless the behavior is genuinely global.

For example:

If an Alert Banner needs better responsive behavior:

```text
Modify AlertBanner
```

not:

```text
Change all flex behavior globally
```

Similarly, if a toast needs a different semantic background:

```text
Modify toast styling
```

not:

```text
Change the entire popover system
```

Keep changes scoped.

---

# 58. Current Project Status

The project currently has the following foundation:

```text
✓ Next.js application
✓ TypeScript
✓ Tailwind CSS
✓ shadcn/ui
✓ Radix primitives
✓ Theme system
✓ Violet theme
✓ Emerald theme
✓ Rose theme
✓ Theme persistence
✓ Theme flash prevention
✓ Global layout
✓ Header/footer shell
✓ Semantic color system
✓ Responsive spacing system
✓ UI playground
✓ Date picker system
✓ Legal page architecture
✓ ConfirmDialog
✓ AlertDialog
✓ Sonner toast system
✓ Alert Banner
✓ Responsive Alert Banner actions
✓ ESLint
✓ Prettier
✓ Husky
✓ lint-staged
✓ Commitlint
✓ GitHub Actions CI
```

The frontend is currently designed so that mock data can later be replaced with real backend services without restructuring the UI architecture.

---

# 59. Recommended Development Direction

Future development should continue roughly in this order:

```text
Design System
      ↓
Layout / Navigation
      ↓
Product Architecture
      ↓
Category Architecture
      ↓
Product Listing
      ↓
Product Details
      ↓
Cart
      ↓
Wishlist
      ↓
Authentication
      ↓
Checkout
      ↓
Orders
      ↓
Reviews
      ↓
Backend/API integration
```

Each feature should follow the existing architecture rather than creating an independent pattern.

---

# 60. Golden Rules for Future Developers

1. **Keep components reusable but don't over-abstract.**

2. **Use semantic design tokens instead of hardcoded colors.**

3. **Keep business logic out of `components/ui`.**

4. **Use `components/common` for reusable application patterns.**

5. **Keep feature-specific components inside their feature.**

6. **Use Server Components by default.**

7. **Use Client Components only where interaction requires them.**

8. **Use the UI playground to test reusable UI patterns.**

9. **Preserve the theme system.**

10. **Test responsive behavior before considering a component finished.**

11. **Keep Toast, Alert Banner, ConfirmDialog, and AlertDialog responsibilities separate.**

12. **Prefer existing shadcn/Radix primitives over custom replacements.**

13. **Don't overwrite customized shadcn components blindly.**

14. **Keep mock-data access behind services so the backend can replace it later.**

15. **Run formatting, linting, type checking, and build checks before pushing.**

---

# 61. Quick Reference

## Start development

```powershell
npm run dev
```

## Playground

```text
http://localhost:3000/ui-playground
```

## Format

```powershell
npm run format
```

## Lint

```powershell
npm run lint
```

## Type check

```powershell
npm run type-check
```

## Build

```powershell
npm run build
```

## Main reusable UI locations

```text
src/components/ui/
src/components/common/
src/features/
```

## Main design system locations

```text
src/lib/themes.ts
src/components/theme/
src/styles/
src/app/globals.css
```

## Main feedback components

```text
src/components/ui/sonner.tsx
src/components/ui/alert-dialog.tsx
src/components/common/confirm-dialog.tsx
src/components/common/alert-banner.tsx
```

---

# 62. Final Architecture

At the current stage, the project can be understood as:

```text
                         SOCIO COMMERCE
                               │
                ┌──────────────┴──────────────┐
                │                             │
             App Layer                  Design System
                │                             │
          ┌─────┴─────┐              ┌────────┴────────┐
          │           │              │                 │
       Layout      Features        Themes          UI Primitives
          │           │              │                 │
      Header       Products       Violet          shadcn/ui
      Footer       Cart           Emerald          Radix
      Shell        Wishlist       Rose             Sonner
                   Orders
                   Auth
                     │
                     ▼
                  Services
                     │
                     ▼
                 Mock Data
                     │
                     │
                     ▼
              Future API Client
                     │
                     ▼
                  Backend
```

The core principle is:

> **Build the frontend as if the backend already exists, while keeping the current data source replaceable.**

This gives Socio Commerce a clean foundation for continuing development without repeatedly restructuring the project.
