// Per-project configuration - single source of truth
export interface ProjectConfig {
  key: string;
  name: string;
  domain: string;
  path: string;
  meta: {
    title: string;
    description: string;
    favicon: string;
  };
  branding: {
    primaryColor: string;
  };
  features: {
    shop: boolean;
    blog: boolean;
    map: boolean;
  };
  supabaseFilter: string;
}

export const projectConfigs: Record<string, ProjectConfig> = {
  rikuy: {
    key: 'rikuy',
    name: 'Rikuy',
    domain: 'rikuy.one',
    path: '/rikuy',
    meta: {
      title: 'Rikuy - Valle Sagrado',
      description: 'Discover authentic experiences in Valle Sagrado',
      favicon: '/favicons/rikuy.svg'
    },
    branding: {
      primaryColor: '#2a4a6b'
    },
    features: {
      shop: true,
      blog: true,
      map: true
    },
    supabaseFilter: 'rikuy'
  },
  maria: {
    key: 'maria',
    name: 'Maria Ocampo',
    domain: 'mariaocampo.se',
    path: '/maria',
    meta: {
      title: 'Maria Ocampo - Art & Design',
      description: 'Explore unique artworks and handcrafted designs',
      favicon: '/favicons/maria.svg'
    },
    branding: {
      primaryColor: '#c8796a'
    },
    features: {
      shop: true,
      blog: true,
      map: false
    },
    supabaseFilter: 'maria'
  },
  danny: {
    key: 'danny',
    name: 'Danny Cranmer',
    domain: 'cranmer.se',
    path: '/danny',
    meta: {
      title: 'Danny Cranmer - Photography',
      description: 'Professional photography services and gallery',
      favicon: '/favicons/danny.svg'
    },
    branding: {
      primaryColor: '#2a4a6b'
    },
    features: {
      shop: true,
      blog: false,
      map: true
    },
    supabaseFilter: 'danny'
  },
  tryckbart: {
    key: 'tryckbart',
    name: 'Tryckbart',
    domain: 'tryckbart.se',
    path: '/tryckbart',
    meta: {
      title: 'Tryckbart - Print Solutions',
      description: 'Professional printing services and custom merchandise',
      favicon: '/favicons/tryckbart.svg'
    },
    branding: {
      primaryColor: '#1a1a1a'
    },
    features: {
      shop: true,
      blog: false,
      map: false
    },
    supabaseFilter: 'tryckbart'
  }
};

// Helper to get project config by key
export function getProjectConfig(key: string): ProjectConfig | undefined {
  return projectConfigs[key];
}

// Helper to get all project configs as array
export function getAllProjects(): ProjectConfig[] {
  return Object.values(projectConfigs);
}
