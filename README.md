# Valle Sagrado Platform

A comprehensive platform for project showcases, e-commerce, and community building in the Sacred Valley. Built with SvelteKit, Supabase, and modern web technologies.

## Features

- 🌟 **Project Showcases**: Display teacher/guide profiles and projects
- 🛒 **E-commerce**: Project-specific product sales with Stripe integration
- 🗺️ **Interactive Map**: Location-based project discovery
- 🔐 **Authentication**: Secure admin panel with role-based access
- 📱 **Responsive**: Mobile-first design with Tailwind CSS
- 🤖 **MCP Integration**: AI assistant access to platform data

## Development Setup

### Package Managers
- **Local Development**: Use `pnpm` for faster installs and better workspace support
- **Production/Vercel**: Uses `npm` (configured via `vercel.json`)

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Environment Variables
Create a `.env.local` file with:
```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## MCP (Model Context Protocol) Integration

Valle Sagrado includes an MCP server that allows AI assistants to interact with the platform data.

### Available MCP Tools

1. **`get_projects`** - Get all projects/teachers
   - Parameters: `limit` (1-100), `category` (optional)
   
2. **`get_project_details`** - Get detailed project information
   - Parameters: `url` (project URL slug)
   
3. **`get_products`** - Get e-commerce products
   - Parameters: `limit` (1-50), `category`, `project_url` (optional)
   
4. **`get_platform_stats`** - Get platform statistics
   - Returns: project count, product count, order count, recent projects
   
5. **`roll_dice`** - Roll an N-sided die (fun utility)
   - Parameters: `sides` (2-100, default: 6)

### MCP Server URL
When deployed to Vercel, the MCP server is available at:
```
https://your-domain.vercel.app/api/mcp
```

### Cursor Integration
The MCP server is pre-configured in `.cursor/mcp.json` for use with Cursor IDE:

```json
{
  "mcpServers": {
    "valle-sagrado": {
      "url": "https://your-domain.vercel.app/api/mcp"
    }
  }
}
```

## Build Configuration

### Vercel Deployment
The project uses a dual package manager setup:
- **Local**: pnpm (faster, better workspace support)
- **Vercel**: npm (more reliable for CI/CD)

Configuration in `vercel.json`:
```json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev"
}
```

### Adapter
Uses `@sveltejs/adapter-vercel` for optimal Vercel deployment with Node.js 20.x runtime.

## Database Schema

### Core Tables
- `projects_info` - Teacher/guide profiles and projects
- `products` - E-commerce products linked to projects
- `orders` - Purchase orders with Stripe integration
- `map_config` - Global map configuration settings

### Authentication
- Supabase Auth with role-based access control
- Admin and super-admin roles supported
- Session management with SSR support

## Tech Stack

- **Frontend**: SvelteKit 2.x with Svelte 5
- **Styling**: Tailwind CSS 4.x
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe integration
- **Maps**: MapTiler SDK
- **Deployment**: Vercel with Fluid compute
- **Package Management**: pnpm (local) / npm (production)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes using `pnpm` for local development
4. Test thoroughly with `pnpm build` and `pnpm preview`
5. Submit a pull request

## License

Private project for Valle Sagrado community.
