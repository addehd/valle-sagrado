# Multi-Project Architecture

This SvelteKit app hosts **multiple distinct websites** from a single codebase and deployment. Each project lives under its own URL domain in production, but maps to a route prefix internally.

---

## How It Works

```
                  INTERNET
                     │
       ┌─────────────┼──────────────┐
       │             │              │
mariaocampo.se   cranmer.se    rikuy.one
       │             │              │
       ▼             ▼              ▼
┌─────────────────────────────────────────┐
│          Vercel (single deploy)         │
│                                         │
│  hooks.ts  ──── reroute()              │
│    │                                    │
│    │  hostname → prefix mapping         │
│    │                                    │
│    ▼                                    │
│  /maria/*   →  mariaocampo.se          │
│  /danny/*   →  cranmer.se              │
│  /tryckbart/*  →  tryckbart.se         │
│  /rikuy/*   →  rikuy.one               │
│                                         │
│  /api/*     →  shared (no rewrite)     │
│  /auth      →  shared (no rewrite)     │
└─────────────────────────────────────────┘
```

---

## Route Structure

```
src/routes/
├── +layout.svelte          ← shared root layout
├── +page.svelte            ← project selector (localhost only)
│
├── maria/                  ← mariaocampo.se
│   └── ...
├── danny/                  ← cranmer.se / valle-sagrado.test
│   └── ...
├── tryckbart/              ← tryckbart.se
│   └── ...
├── rikuy/                  ← rikuy.one  (default domain)
│   └── ...
│
├── api/                    ← shared APIs (no rewrite)
├── auth/                   ← shared auth (no rewrite)
└── fin/                    ← shared tools
```

---

## The Two-Hook System

### `hooks.ts` — `reroute()` (runs before route resolution)

Rewrites the URL path based on the incoming hostname **before** SvelteKit resolves the route.

```
Request: GET cranmer.se/about
  │
  ▼
reroute(): hostname "cranmer.se" → key "danny" → prefix "/danny"
  │
  ▼
Resolved as: /danny/about
```

This is transparent — the browser still sees `/about`, but SvelteKit serves `/danny/about`.

### `hooks.server.ts` — `domainDetection` handle (runs during request)

Sets `event.locals.domain` so server-side code (load functions, API routes) knows which project context it's running in.

```
Request arrives → reroute() rewrites path → domainDetection sets locals.domain
                                                   │
                                              Components/loaders
                                              can read locals.domain
                                              to scope DB queries,
                                              branding, content, etc.
```

---

## Local Development

Since you only have one hostname (`localhost`), project selection works two ways:

1. **Query param**: `localhost:5173/?domain=danny` — sets a cookie and reroutes
2. **Cookie** (`dev-domain-preference`): persists between refreshes

```
localhost:5173/          → project picker (no rewrite)
localhost:5173?domain=danny  → sets cookie, reroutes to /danny/*
```

---

## Domain Config

All mappings live in one file: `src/lib/config/domains.ts`

| Key        | Hostnames                              | Prefix       |
|------------|----------------------------------------|--------------|
| `maria`    | mariaocampo.se                         | `/maria`     |
| `tryckbart`| tryckbart.se                           | `/tryckbart` |
| `danny`    | cranmer.se, valle-sagrado.test         | `/danny`     |
| `rikuy`    | rikuy.one *(default)*                  | `/rikuy`     |

---

## Suggestions for Long-Term Maintainability

### 1. Lift shared logic into a `_shared/` route group

As projects accumulate similar pages (about, contact, shop), duplication grows fast. Extract common layouts and logic into a non-routed group:

```
src/routes/
├── _shared/
│   ├── +layout.svelte      ← common shell, nav, footer
│   ├── shop/               ← shared e-commerce flow
│   └── components/         ← page-level shared components
├── maria/
│   └── +layout.svelte      ← extends _shared layout, adds maria branding
├── danny/
│   └── +layout.svelte      ← extends _shared layout, adds danny branding
```

Projects override or extend — they don't copy. New shared feature = one place to add it.

---

### 2. Per-project config objects as the single source of truth

Replace scattered per-project conditionals with a typed config object per project. The domain config already does this for routing — extend the same pattern to content, branding, and feature flags:

```typescript
// src/lib/config/projects.ts
export const projectConfig = {
  danny: {
    name: 'Cranmer',
    primaryColor: '#2a4a6b',
    features: { shop: true, blog: false, map: true },
    supabaseFilter: 'danny',
  },
  maria: {
    name: 'Maria Ocampo',
    primaryColor: '#c8796a',
    features: { shop: true, blog: true, map: false },
    supabaseFilter: 'maria',
  },
}
```

Load functions and components read from this config instead of branching on `locals.domain` inline. Adding a project = adding one config entry.

---

### 3. Enforce boundaries with a lint rule or barrel exports

Right now nothing prevents `danny/` from accidentally importing a component from `maria/`. As projects diverge this causes subtle bugs. Two lightweight options:

**Option A — barrel exports per project:**
```
src/lib/
├── danny/index.ts    ← only exports what danny exposes publicly
├── maria/index.ts
└── shared/index.ts   ← the only place cross-project imports are allowed
```
Cross-project imports (`import X from '$lib/danny/...'` inside `maria/`) become an obvious code-review smell.

**Option B — ESLint `no-restricted-imports` rule:**
```json
// eslint config
"no-restricted-imports": ["error", {
  "patterns": [
    { "group": ["*/routes/maria/*"], "message": "Don't import across project boundaries" },
    { "group": ["*/routes/danny/*"], "message": "Don't import across project boundaries" }
  ]
}]
```

Either approach makes boundaries visible and enforceable without restructuring the repo.
