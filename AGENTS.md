# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

This is a Next.js application called "Half-Baked" that displays a personal book collection on a visual bookshelf. It uses Prisma with PostgreSQL for data management and implements a static site generation approach with revalidation.

## Commands

### Development
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
```

### Database
```bash
npx prisma migrate dev        # Run migrations in development
npx prisma migrate deploy     # Run migrations in production
npx prisma generate           # Generate Prisma Client
npx prisma studio             # Open Prisma Studio GUI
```

## Architecture

### Database Layer (Prisma)

The application uses Prisma ORM with PostgreSQL. The schema defines two main models:

- **Book**: Stores book information (title, coverUrl, finishedOn date)
- **Author**: Stores author information (name)
- Relationship: Many-to-many between Book and Author

**Important**: The Prisma client (`lib/prisma.ts`) uses a conditional initialization pattern to only instantiate on the backend (`typeof window === "undefined"`). In development, it uses global caching to prevent multiple instances during hot reloading. Never import or use Prisma client in client-side code.

### Page Structure

- **pages/index.tsx**: Main page with book display and date filtering
  - Uses `getStaticProps` with ISR (revalidate: 10 seconds)
  - Implements responsive shelf layout that adapts to screen width
  - Date picker for filtering books by completion date
  - Default date range is current year (Jan 1 - Dec 31)

- **pages/p/[id]/index.tsx**: Admin dashboard (protected)
  - Full CRUD operations for books
  - Uses dynamic route with server-side validation
  - Only accessible at `/p/{ADMIN_PATH}` where path matches env var

- **pages/p/[id]/login.tsx**: Admin login page
  - Password-based authentication
  - Sets HTTP-only cookie on successful login

### Components

- **components/Book**: Renders individual book with cover image using Next.js Image component
- **components/Shelf**: 3D shelf visualization using SCSS modules
  - Exports `shelfSideSpace` (48px) and `interBookSpace` (48px) constants
  - These constants are critical for shelf layout calculations in index.tsx

### Styling

Uses a combination of:
- Tailwind CSS for utility classes
- SCSS modules for complex 3D effects (shelf rendering)
- CSS variables for theming (defined in global styles)

### Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:
- `@/lib/*` → `./lib/*`
- `@/components/*` → `./components/*`
- `@/models/*` → `./models/*`
- `@/styles/*` → `./styles/*`

Always use these aliases for imports instead of relative paths.

### Image Handling

Next.js Image component is configured to allow images from:
- `halfbaked-media.s3.amazonaws.com`

Add new domains to `next.config.mjs` remotePatterns if needed.

### Environment Variables

Required in `.env`:
- `DATABASE_URL`: PostgreSQL connection string for Prisma
- `ADMIN_PATH`: Secret URL path segment for admin access (required, no default)
- `ADMIN_PASSWORD`: Password for admin authentication (required)
- `AUTH_SECRET`: HMAC-SHA256 signing secret for authentication tokens (required, min 32 chars recommended; generate with `openssl rand -hex 32`)

## Key Implementation Patterns

### Shelf Layout Algorithm

The `renderShelves` function in `pages/index.tsx` implements dynamic shelf layout:
1. Calculates available shelf width using resize observer
2. Determines books per shelf based on book width (96px) + inter-book spacing
3. Splits books array into shelves
4. Renders each shelf with books

This algorithm depends on constants exported from `components/Shelf/index.tsx`.

### Date Filtering

The date picker implementation:
- Keeps picker open if only one date is selected (allows range selection)
- Closes after both dates selected or picker cleared
- Shows all books when date range is not fully set

### Admin Security (Path Obfuscation)

The admin interface uses a defense-in-depth security approach with multiple layers:

#### Security Layers

1. **Secret URL Path**: The admin is only accessible at `/p/{ADMIN_PATH}` where `ADMIN_PATH` is an environment variable. There are no hardcoded paths like `/admin` in the codebase.

2. **Middleware Enforcement** (`middleware.ts`): Intercepts all `/p/*` and `/api/p/*` requests, validates the path segment against `ADMIN_PATH`, and checks authentication tokens before allowing access.

3. **Server-Side Validation** (`getServerSideProps`): Pages at `pages/p/[id]/` re-validate the path parameter, providing defense-in-depth even if middleware is bypassed.

4. **API Route Validation**: API endpoints at `pages/api/p/[id]/` and protected routes in `pages/api/books/` validate authentication before processing write operations.

#### Token-Based Authentication

- **HMAC-SHA256 Signed Tokens**: Auth tokens are signed using `AUTH_SECRET` (see `lib/auth.ts`). Token format: `{timestamp}.{signature}`.
- **24-Hour Expiry**: Tokens expire after 24 hours (`COOKIE_MAX_AGE`). Future timestamps are also rejected.
- **HTTP-only Cookies**: Tokens are stored in HTTP-only cookies with `SameSite=Strict` to prevent XSS and CSRF attacks.

#### Timing-Safe Comparisons

All password and token validations use `crypto.timingSafeEqual` to prevent timing attacks:
- `validatePassword()` in `lib/auth.ts` for login
- `validateAuthToken()` in `lib/auth.ts` for session validation
- `timingSafeCompare()` in `middleware.ts` for Edge runtime

#### Key Files

- `middleware.ts` - Route protection and token validation (Edge runtime)
- `lib/auth.ts` - Token generation, validation, and password checking
- `pages/p/[id]/index.tsx` - Admin dashboard with `getServerSideProps` auth check
- `pages/p/[id]/login.tsx` - Login page
- `pages/api/p/[id]/auth.ts` - Login API endpoint
- `pages/api/p/[id]/logout.ts` - Logout API endpoint

**Why this approach**: The source code is public, so we can't hardcode secret paths. By using environment variables and dynamic routes with server-side validation:
- Scanning the codebase reveals nothing about the admin URL
- Brute-forcing `/p/{random}` returns 404 for incorrect guesses
- API enumeration doesn't reveal admin-related endpoints
- Even finding the path requires knowing the password

**Important**: `ADMIN_PATH`, `ADMIN_PASSWORD`, and `AUTH_SECRET` have no fallback values. The app will error if they're not set, ensuring secure defaults.
