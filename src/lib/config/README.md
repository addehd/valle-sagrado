# Project Configuration System

Single source of truth for per-project settings, metadata, and features.

## Usage

### Import the config

```typescript
import { getProjectConfig, getAllProjects } from '$lib/config/projects';

// Get all projects
const projects = getAllProjects();

// Get specific project
const rikuyConfig = getProjectConfig('rikuy');
```

### Configuration Structure

Each project has:

- **key**: Unique identifier (used in URLs and cookies)
- **name**: Display name
- **domain**: Production domain
- **path**: Development route path
- **meta**: SEO metadata (title, description, favicon)
- **branding**: Visual theme settings (primaryColor)
- **features**: Feature flags (shop, blog, map)
- **supabaseFilter**: Database query filter

### Adding a New Project

1. Edit `src/lib/config/projects.ts`
2. Add new entry to `projectConfigs` object:

```typescript
newproject: {
  key: 'newproject',
  name: 'New Project',
  domain: 'newproject.com',
  path: '/newproject',
  meta: {
    title: 'New Project - Tagline',
    description: 'Brief description for SEO',
    favicon: '/favicons/newproject.svg'
  },
  branding: {
    primaryColor: '#hexcolor'
  },
  features: {
    shop: true,
    blog: true,
    map: false
  },
  supabaseFilter: 'newproject'
}
```

3. Create favicon at `static/favicons/newproject.svg`

### Meta Tags in Routes

Use `svelte:head` to apply config meta tags:

```svelte
<script>
  import { getProjectConfig } from '$lib/config/projects';
  const config = getProjectConfig('rikuy');
</script>

<svelte:head>
  <title>{config.meta.title}</title>
  <meta name="description" content="{config.meta.description}" />
  <link rel="icon" href="{config.meta.favicon}" />
</svelte:head>
```

### Feature Flags

Check enabled features:

```svelte
{#if config.features.shop}
  <ShopComponent />
{/if}
```

### Branding

Apply project colors:

```svelte
<div style="color: {config.branding.primaryColor}">
  Branded content
</div>
```

## Favicon Guidelines

- Format: SVG (scalable, small file size)
- Size: 32×32 viewBox
- Location: `static/favicons/[project].svg`
- Design: Simple, recognizable icon with brand color

## Benefits

1. **Single Source of Truth**: All project settings in one place
2. **Type Safety**: TypeScript ensures correct usage
3. **Easy Maintenance**: Add/modify projects in one file
4. **Consistent Structure**: All projects follow same pattern
5. **Feature Flags**: Easy to enable/disable features per project
