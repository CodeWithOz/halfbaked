# Half-Baked

A personal book collection app that displays books on a visual 3D bookshelf. Built with Next.js, Prisma, and PostgreSQL.

## Features

- Visual bookshelf display with 3D shelf effects
- Filter books by date range
- Responsive layout that adapts to screen width
- Admin dashboard for managing books (CRUD operations)
- Protected admin access with password authentication

## Tech Stack

- **Framework**: Next.js (Pages Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + SCSS modules
- **Hosting**: Vercel + Supabase

## Getting Started

### Prerequisites

- Node.js 20.x or later
- PostgreSQL database (or Supabase account)

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
ADMIN_PATH="your-secret-path"
ADMIN_PASSWORD="your-secure-password"
```

- `DATABASE_URL`: PostgreSQL connection string
- `ADMIN_PATH`: Secret URL path segment for admin access (e.g., `x7k9m2p4`)
- `ADMIN_PASSWORD`: Password for admin authentication

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations (if using migrations)
npx prisma migrate dev

# Or sync schema directly (for existing databases)
npx prisma db push
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the bookshelf.

### Admin Access

The admin dashboard is accessible at `/p/{ADMIN_PATH}` where `{ADMIN_PATH}` is the value of your `ADMIN_PATH` environment variable.

Example: If `ADMIN_PATH=x7k9m2p4`, access admin at `http://localhost:3000/p/x7k9m2p4`

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
pages/
├── index.tsx          # Main bookshelf page
├── p/[id]/
│   ├── index.tsx      # Admin dashboard
│   └── login.tsx      # Admin login
├── api/
│   ├── books/         # Book CRUD endpoints
│   └── p/[id]/        # Auth endpoints
components/
├── Book/              # Book display component
└── Shelf/             # 3D shelf component
lib/
└── prisma.ts          # Prisma client
prisma/
└── schema.prisma      # Database schema
```

## License

Private project.
