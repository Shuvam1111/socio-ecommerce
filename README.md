# Socio Commerce

A scalable e-commerce frontend built with **Next.js, TypeScript, and Tailwind CSS**.

> **Current stage:** Frontend development with temporary/mock JSON data.
> Backend/API integration will be added later.

---

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- ESLint
- Prettier
- Husky
- lint-staged
- Commitlint
- Conventional Commits

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd socio-commerce
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

The application will run locally at:

```text
http://localhost:3000
```

---

## Available Commands

| Command                | Purpose                      |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start development server     |
| `npm run build`        | Create production build      |
| `npm run start`        | Start production server      |
| `npm run lint`         | Run ESLint                   |
| `npm run format`       | Format project with Prettier |
| `npm run format:check` | Check Prettier formatting    |
| `npm run type-check`   | Run TypeScript type checking |

---

# Coding Conventions

## TypeScript

- Use TypeScript for all application code.
- Avoid `any` unless there is a valid reason.
- Prefer explicit types for public functions, props, and important data structures.
- Reuse existing types instead of duplicating them.

## Naming

### Components

Use PascalCase:

```text
ProductCard
ProductGrid
CheckoutForm
```

### Variables and functions

Use camelCase:

```ts
const productList = [];
const selectedProduct = getProduct();
```

### Constants

Use UPPER_SNAKE_CASE:

```ts
const MAX_CART_ITEMS = 50;
```

### Types and interfaces

Use PascalCase:

```ts
type Product = {};
interface CartItem {}
```

### Files

Use kebab-case for files:

```text
product-card.tsx
product-grid.tsx
format-currency.ts
```

---

# Imports

Use the configured `@/*` alias.

Preferred:

```ts
import { ProductCard } from '@/components/products/product-card';
```

Avoid deep relative imports:

```ts
import { ProductCard } from '../../../components/products/product-card';
```

---

# Components

Prefer **Server Components by default**.

Only use:

```tsx
'use client';
```

when the component requires client-side functionality such as:

- `useState`
- `useEffect`
- Event handlers
- Browser APIs
- Client-side stores
- Interactive UI

---

# Mock Data & Services

The project currently uses temporary JSON data.

Do **not** directly import mock JSON into UI components.

Avoid:

```ts
import products from '@/data/products.json';
```

inside components.

Instead, access data through the appropriate service:

```text
UI
 ↓
Feature
 ↓
Service
 ↓
Mock JSON
```

Later, the service layer can be changed to communicate with the backend without unnecessarily changing the UI.

---

# Prettier

Prettier is the project's code formatter.

Configuration is defined in:

```text
.prettierrc
```

Current conventions:

- Single quotes
- 100 character print width
- 2 spaces
- Semicolons
- Trailing commas
- LF line endings

Format the project with:

```bash
npm run format
```

Check formatting without modifying files:

```bash
npm run format:check
```

VS Code is configured to format files on save.

Recommended extensions:

- Prettier
- ESLint

---

# ESLint

ESLint is used for code-quality checks.

Run:

```bash
npm run lint
```

Do not ignore ESLint errors without understanding why they occur.

---

# Husky & lint-staged

Husky runs checks before commits.

The `pre-commit` hook runs:

```text
lint-staged
    ↓
ESLint
    ↓
Prettier
```

Only staged files are checked/formatted.

You normally do not need to manually run formatting before every commit.

---

# Commit Convention

This project uses **Conventional Commits**.

Format:

```text
type(scope): description
```

### Common types

```text
feat
fix
refactor
style
docs
test
chore
build
ci
perf
revert
```

### Examples

```text
feat(products): add product filtering
feat(cart): add quantity selector
fix(cart): prevent negative quantity
fix(auth): fix login redirect
refactor(products): restructure product service
style(ui): improve button spacing
docs: update project documentation
test(cart): add cart store tests
chore: configure development tooling
```

Avoid vague commit messages such as:

```text
update
changes
final
fix stuff
new changes
```

Invalid commit messages will be rejected automatically.

---

# Git Workflow

Do not push directly to `main`.

Create a branch for your work:

```bash
git checkout -b feature/product-listing
```

Examples:

```text
feature/product-listing
feature/shopping-cart
feature/checkout
fix/mobile-navbar
fix/product-image
refactor/product-service
chore/update-dependencies
```

Before opening a Pull Request, make sure these pass:

```bash
npm run format:check
npm run lint
npm run type-check
npm run build
```

---

# Environment Variables

Never commit `.env.local` or secrets.

Use:

```text
.env.example
```

to document required environment variables.

Each developer should create their own:

```text
.env.local
```

---

# Before You Commit

Make sure your changes:

- Follow the existing folder structure.
- Follow naming conventions.
- Use TypeScript properly.
- Do not introduce unnecessary `any`.
- Do not duplicate existing components or utilities.
- Do not import mock data directly into UI components.
- Do not commit secrets.
- Pass ESLint and TypeScript checks.

Husky and lint-staged will automatically run checks on staged files during commit.

---

## Project Status

The project is currently focused on **frontend development and architecture**.

Mock JSON data is being used temporarily. Backend/API integration will be introduced later while keeping the frontend architecture and service boundaries stable.
