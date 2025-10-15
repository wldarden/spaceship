# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Router v7 application with TypeScript, Tailwind CSS v4, and Prisma ORM. The project is named "learn" and described as "Library for exploring evolutionary processes."

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Type checking**: `npm run typecheck`
  - This runs both React Router type generation (`react-router typegen`) and TypeScript compiler checks

## Architecture

### Framework & Routing

- Uses React Router v7 with file-based routing configuration
- SSR is enabled by default (configured in `react-router.config.ts`)
- Routes are defined in `app/routes.ts` using the declarative route config API
- Type-safe route modules with auto-generated types in `.react-router/types/`

### Application Structure

```
app/
├── routes/          # Route components
├── routes.ts        # Route configuration
├── root.tsx         # Root layout with QueryClientProvider
├── ajax.ts          # Axios instance for API calls
├── Components/      # Shared components (empty currently)
├── welcome/         # Welcome page assets and components
└── app.css          # Global styles
```

### Database

- Uses Prisma ORM with PostgreSQL via Prisma Accelerate
- Prisma client is generated to `app/generated/prisma/` (non-standard location)
- Database connection configured via `DATABASE_URL` environment variable in `.env`
- To modify database schema: edit `prisma/schema.prisma`, then run Prisma migration commands

### State Management

- React Query (TanStack Query) is configured globally in `root.tsx`
- Default query options:
  - `refetchOnWindowFocus: false`
  - `retry: false`
- QueryClient instance exported from `root.tsx` for use in loaders/actions

### Styling

- Tailwind CSS v4 with Vite plugin
- Uses Inter font family from Google Fonts
- Global styles in `app.css`

### Path Aliases

- `~/*` maps to `app/*` (configured in `tsconfig.json`)
- Use this alias for imports: `import { foo } from "~/utils/foo"`

## Key Technical Details

- TypeScript strict mode enabled
- React 19 with JSX transform
- Vite build tool with `tsconfigPaths` plugin for path resolution
- Error boundary implemented in `root.tsx` with development-friendly stack traces
