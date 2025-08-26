<script lang="ts">
  import { themeStore, type Theme } from '$lib/stores/theme';
  
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    showLabels?: boolean;
    variant?: 'default' | 'header';
  }
  
  let { size = 'md', showLabels = false, variant = 'default' }: Props = $props();
  
  let currentTheme = $state<Theme>('light');
  
  // Subscribe to theme store
  $effect(() => {
    const unsubscribe = themeStore.subscribe(theme => {
      currentTheme = theme;
    });
    
    return unsubscribe;
  });
  
  // Toggle between light and dark
  const toggleTheme = () => {
    const nextTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
    themeStore.setTheme(nextTheme);
  };
  
  // Get icon based on current theme
  const getIcon = (theme: Theme) => {
    switch (theme) {
      case 'light':
        return 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z';
      case 'dark':
        return 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z';
      default:
        return '';
    }
  };

  const getButtonClasses = (variant: string, size: 'sm' | 'md' | 'lg') => {
    const baseClasses = `inline-flex items-center justify-center ${sizeClasses[size]} rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`;
    
    if (variant === 'header') {
      return `${baseClasses} text-white hover:bg-white/10 active:bg-white/20 focus:ring-white/50`;
    } else {
      return `${baseClasses} border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-offset-2 dark:focus:ring-offset-gray-800`;
    }
  };
  
  // Get size classes
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5'
  };
  
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };
  
</script>

<div class="flex items-center space-x-2">
  <button
    onclick={toggleTheme}
    class={getButtonClasses(variant, size)}
    aria-label="Toggle theme ({currentTheme})"
    title="Current theme: {currentTheme} (click to toggle)"
  >
    <svg 
      class="{iconSizeClasses[size]} transition-transform duration-200" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d={getIcon(currentTheme)}
      />
    </svg>
  </button>
  
  {#if showLabels}
    <span class="text-sm text-gray-600 dark:text-gray-400 capitalize">
      {currentTheme}
    </span>
  {/if}
</div>