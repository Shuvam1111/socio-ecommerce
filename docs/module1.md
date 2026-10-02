# Socio Commerce

## Reusable Components & Implementation Guide

This document contains the reusable UI components currently implemented in Socio Commerce.

It is intended as a quick reference for developers who need to **use an existing component** without reading its internal implementation.

---

# 1. Component Architecture

Reusable UI is divided into two levels:

```text
src/components/
│
├── ui/
│   └── Low-level UI primitives
│
└── common/
    └── Application-level reusable components
```

### `components/ui`

Generic primitives, mainly from shadcn/ui.

Examples:

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

### `components/common`

Reusable application-level patterns built on top of the primitives.

Examples:

```text
ConfirmDialog
AlertBanner
DatePicker
```

---

# 2. Component Quick Reference

| Component      | Location                               | Purpose                         |
| -------------- | -------------------------------------- | ------------------------------- |
| Button         | `components/ui/button.tsx`             | General actions                 |
| Card           | `components/ui/card.tsx`               | Content containers              |
| Input          | `components/ui/input.tsx`              | Text input                      |
| Label          | `components/ui/label.tsx`              | Form labels                     |
| Badge          | `components/ui/badge.tsx`              | Status/category labels          |
| Dialog         | `components/ui/dialog.tsx`             | General modal content           |
| AlertDialog    | `components/ui/alert-dialog.tsx`       | Decision/confirmation primitive |
| ConfirmDialog  | `components/common/confirm-dialog.tsx` | Reusable confirmation flow      |
| Sonner / Toast | `components/ui/sonner.tsx`             | Temporary feedback              |
| AlertBanner    | `components/common/alert-banner.tsx`   | Persistent contextual feedback  |
| Calendar       | `components/ui/calendar.tsx`           | Calendar primitive              |
| DatePicker     | `components/common/date-picker.tsx`    | Reusable date selection         |

---

# 3. Button

## Location

```text
src/components/ui/button.tsx
```

This is the project's standard action component.

Use it instead of creating custom `<button>` styling.

## Basic

```tsx
import { Button } from '@/components/ui/button';

<Button>Add to cart</Button>;
```

## Variants

Use the variants provided by the installed shadcn Button component.

Common examples:

```tsx
<Button>
  Primary
</Button>

<Button variant="secondary">
  Secondary
</Button>

<Button variant="outline">
  Outline
</Button>

<Button variant="ghost">
  Ghost
</Button>

<Button variant="destructive">
  Delete
</Button>
```

## Sizes

```tsx
<Button size="sm">
  Small
</Button>

<Button>
  Default
</Button>

<Button size="lg">
  Large
</Button>
```

Use `sm` inside compact UI such as Alert Banners and dialogs.

---

# 4. Card

## Location

```text
src/components/ui/card.tsx
```

Used for grouping related
