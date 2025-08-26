# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Package management - use pnpm for local development
pnpm install
pnpm dev          # Start development server
pnpm build        # Build for production  
pnpm preview      # Preview production build

# Type checking and validation
pnpm check        # Run svelte-check with TypeScript validation
pnpm check:watch  # Run svelte-check in watch mode
```

## Core Architecture

### Framework Stack
- **SvelteKit 2.x** with **Svelte 5** - Modern reactive framework
- **TailwindCSS 4.x** - Utility-first CSS framework
- **TypeScript** - Static type checking
- **Supabase** - Backend (PostgreSQL + Auth + Storage + RLS)
- **Stripe** - Payment processing for e-commerce
- **Vercel** - Deployment platform with Node.js 20.x runtime

### Project Structure
- **Multi-tenant architecture**: Routes are organized around project-specific stores (`/[project]/`)
- **MCP Integration**: Model Context Protocol server at `/api/mcp` for AI assistant access
- **Authentication**: Supabase Auth with role-based access control (admin/super-admin)
- **E-commerce**: Full cart/checkout system with Stripe integration
- **Receipt Processing**: AI-powered OCR via OpenAI Vision API at `/fin`
- **Interactive Map**: MapTiler SDK integration for location-based project discovery

### Key Architectural Patterns

#### Route Organization
- `/[project]/*` - Project-specific stores and e-commerce
- `/admin/*` - Administrative interface with auth guards
- `/api/*` - API endpoints (admin, checkout, MCP, webhooks)
- `/estimate/*` - Estimation/quoting system
- `/fin` - Receipt processing with AI

#### Authentication Flow
- Server-side session management via `hooks.server.ts`
- `safeGetSession()` utility validates JWT before returning session
- Auth guards protect admin routes and APIs
- User context available through `event.locals.user`

#### Data Layer
- Supabase client configured in `hooks.server.ts` with SSR support
- Type definitions in `src/lib/types.ts` cover all major entities
- Row Level Security (RLS) policies control data access
- JSONB fields for flexible metadata storage

#### State Management
- Svelte stores for cart state (`src/lib/stores/cart.ts`)
- Theme management with system preference detection
- Stripe integration with client-side payment processing

## Environment Configuration

Required environment variables:
```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key  # For receipt processing
```

## HTML/Svelte Formatting Rules

**CRITICAL**: Never use dangling closing brackets in HTML/Svelte markup. Always keep the closing `>` on the same line as the last attribute:

```svelte
<!-- ✅ CORRECT -->
<div
	class="container"
	style="min-height: {innerHeight}px;">
	Content here
</div>

<!-- ❌ WRONG -->
<div
	class="container"
	style="min-height: {innerHeight}px;"
>
	Content here
</div>
```

This applies to all HTML elements, Svelte components, and self-closing tags.

## Package Management

- **Local Development**: Use `pnpm` for faster installs and workspace support
- **Production/Vercel**: Uses `npm` (configured in `vercel.json`)
- Dual setup ensures optimal local DX while maintaining deployment reliability

## Key Database Tables

- `projects_info` - Teacher/guide profiles and project data
- `products` - E-commerce products with flexible JSONB attributes
- `orders` + `order_items` - Purchase orders with Stripe integration
- `cart_items` - Shopping cart state
- `receipts` - AI-processed receipt data with OCR results
- `banners` - Figma export data storage
- `brand` - Platform branding configuration
- `map_config` - Interactive map settings

## MCP (Model Context Protocol) Integration

The platform includes an MCP server providing AI assistants access to:
- Project/teacher data (`get_projects`, `get_project_details`)
- E-commerce products (`get_products`)
- Platform statistics (`get_platform_stats`)
- Utility functions (`roll_dice`)

Server available at `/api/mcp` when deployed.

## Component Alias

Use `$components` alias for component imports:
```typescript
import MyComponent from '$components/MyComponent.svelte';
```

## Theme System

- System preference detection with localStorage persistence
- FOUC prevention via inline script in `app.html`
- Dark/light mode toggle available via `ThemeToggle.svelte`