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

- **pages/admin.tsx**: Admin page for adding books
  - Contains `upsertBooksAndAuthors` function for inserting/updating books
  - Handles many-to-many author relationships
  - **Note**: This page runs on client-side and directly calls Prisma, which will fail in production since Prisma is backend-only

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

### Book/Author Upsert Logic

The `upsertBooksAndAuthors` function in `pages/admin.tsx`:
- Upserts books by title
- Upserts authors by name
- Creates many-to-many relationships using Prisma's `connect`
- Runs sequentially (not transactional)
