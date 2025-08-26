import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function createThemeStore() {
  // Initialize with system preference or stored preference
  const getInitialTheme = (): Theme => {
    if (!browser) {
      // Default to light for SSR
      return 'light';
    }
    
    const stored = localStorage.getItem('theme') as Theme;
    if (stored && ['light', 'dark'].includes(stored)) {
      return stored;
    }
    
    // Default to system preference on first load
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const { subscribe, set, update } = writable<Theme>(getInitialTheme());

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    if (!browser) return;

    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  return {
    subscribe,
    setTheme: (theme: Theme) => {
      if (browser) {
        localStorage.setItem('theme', theme);
        applyTheme(theme);
      }
      set(theme);
    },
    init: () => {
      if (browser) {
        const theme = getInitialTheme();
        applyTheme(theme);
        set(theme);
      }
    }
  };
}

export const themeStore = createThemeStore();