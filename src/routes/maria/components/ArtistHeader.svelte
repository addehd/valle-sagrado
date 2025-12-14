<script lang="ts">
  import { onMount } from 'svelte';
  
  interface Props {
    name: string;
    displayMode?: 'fullscreen' | 'side' | 'centered';
    onDisplayModeChange?: (mode: 'fullscreen' | 'side') => void;
    currentLanguage?: 'en' | 'sv';
    onLanguageToggle?: () => void;
  }
  
  let { name, displayMode = 'side', onDisplayModeChange, currentLanguage = 'en', onLanguageToggle }: Props = $props();
  
  let headerElement: HTMLElement;
  let titleColor = $state('text-gray-600'); // default color for title only
  let sampledColorDisplay = $state('rgb(255, 255, 255)'); // for debugging display
  let shouldHideHeader = $state(false); // hide header on certain sections
  let showFullscreenButton = $state(false); // show fullscreen button only when over artwork sections
  
  // Function to calculate luminance of a color
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  // Function to extract RGB values from various color formats
  const parseColor = (color: string): [number, number, number] | null => {
    // Handle rgb/rgba format
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }
    
    // Handle hex format
    const hexMatch = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hexMatch) {
      return [
        parseInt(hexMatch[1], 16),
        parseInt(hexMatch[2], 16),
        parseInt(hexMatch[3], 16)
      ];
    }
    
    // Handle named colors by creating a temporary element
    const tempDiv = document.createElement('div');
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    const computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    
    const computedMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (computedMatch) {
      return [parseInt(computedMatch[1]), parseInt(computedMatch[2]), parseInt(computedMatch[3])];
    }
    
    return null;
  };
  
  // Check if we should hide the header based on current section
  const checkSectionVisibility = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Hide on hero section (first viewport height)
    const isOnHero = scrollY < windowHeight;
    
    // Find contact section by looking for the section with contact content
    let isOnContact = false;
    const contactSections = document.querySelectorAll('section');
    
    for (const section of contactSections) {
      // Look for section that contains contact-like content
      if (section.textContent?.includes('Rolfsgatan') || 
          section.textContent?.includes('Maria Ocampo') ||
          section.querySelector('iframe[src*="openstreetmap"]')) {
        
        const rect = section.getBoundingClientRect();
        const headerHeight = 100; // Account for header height
        
        // Check if contact section is visible and header would overlap
        if (rect.top <= headerHeight && rect.bottom > 0) {
          isOnContact = true;
          console.log('🎯 Header over contact section:', rect.top, rect.bottom);
          break;
        }
      }
    }
    
    // Determine if we're in artwork sections area
    // Artwork sections start after hero section and before video/contact sections
    const isInArtworkArea = scrollY >= windowHeight && !isOnContact;
    
    // Check for video section (contains FullscreenVideo)
    let isOnVideo = false;
    const videoSections = document.querySelectorAll('section');
    for (const section of videoSections) {
      if (section.querySelector('video')) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= windowHeight && rect.bottom > 0) {
          isOnVideo = true;
          break;
        }
      }
    }
    
    // Show fullscreen button only when in artwork area (not on hero, video, or contact)
    showFullscreenButton = isInArtworkArea && !isOnVideo;
    
    // Hide header ONLY on hero OR contact sections
    shouldHideHeader = isOnHero || isOnContact;
    
    console.log('📍 Scroll position:', scrollY, 'Hero:', isOnHero, 'Contact:', isOnContact, 'Video:', isOnVideo, 'Artwork Area:', isInArtworkArea, 'Show Button:', showFullscreenButton, 'Hide:', shouldHideHeader);
  };

  // Sample the actual color at the title position
  const detectBackgroundColor = () => {
    if (!headerElement) return;
    
    // Get the title element position
    const titleElement = headerElement.querySelector('h1');
    if (!titleElement) return;
    
    const titleRect = titleElement.getBoundingClientRect();
    
    // Sample multiple points around the title for better accuracy
    const samplePoints = [
      { x: titleRect.left + titleRect.width * 0.3, y: titleRect.top + titleRect.height * 0.5 },
      { x: titleRect.left + titleRect.width * 0.5, y: titleRect.top + titleRect.height * 0.5 },
      { x: titleRect.left + titleRect.width * 0.7, y: titleRect.top + titleRect.height * 0.5 },
    ];
    
    // Temporarily make header transparent to sample what's behind it
    const originalOpacity = headerElement.style.opacity;
    const originalPointerEvents = headerElement.style.pointerEvents;
    headerElement.style.opacity = '0';
    headerElement.style.pointerEvents = 'none';
    
    let sampledColors: string[] = [];
    let dominantElement = null;
    
    let isOverImage = false;
    
    // Sample colors from multiple points
    for (const point of samplePoints) {
      const elementBehind = document.elementFromPoint(point.x, point.y);
      if (!dominantElement) dominantElement = elementBehind;
      
      if (elementBehind) {
        // Check if we're over an image or video
        if (elementBehind.tagName === 'IMG' || elementBehind.tagName === 'VIDEO') {
          isOverImage = true;
          console.log('Detected image/video element:', elementBehind.tagName);
        }
        
        // Check if element has background image
        const computedStyle = window.getComputedStyle(elementBehind);
        if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
          isOverImage = true;
          console.log('Detected background image:', computedStyle.backgroundImage);
        }
        
        let color = computedStyle.backgroundColor;
        
        // If transparent, check parent elements
        let currentElement: Element | null = elementBehind;
        while (currentElement && (color === 'rgba(0, 0, 0, 0)' || color === 'transparent')) {
          currentElement = currentElement.parentElement;
          if (currentElement) {
            const parentStyle = window.getComputedStyle(currentElement);
            
            // Check parent for images too
            if (currentElement.tagName === 'IMG' || currentElement.tagName === 'VIDEO') {
              isOverImage = true;
              console.log('Detected parent image/video:', currentElement.tagName);
            }
            
            if (parentStyle.backgroundImage && parentStyle.backgroundImage !== 'none') {
              isOverImage = true;
              console.log('Detected parent background image:', parentStyle.backgroundImage);
            }
            
            color = parentStyle.backgroundColor;
          }
        }
        
        if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
          sampledColors.push(color);
        }
      }
    }
    
    // Use the most common color or the first valid one
    const sampledColor = sampledColors[0] || 'rgb(255, 255, 255)';
    console.log('Final sampled color type:', typeof sampledColor, sampledColor);
    
    // Restore header opacity and pointer events
    headerElement.style.opacity = originalOpacity;
    headerElement.style.pointerEvents = originalPointerEvents;
    
    console.log('Sample points:', samplePoints);
    console.log('Element behind:', dominantElement?.tagName, dominantElement?.className);
    console.log('Sampled colors:', sampledColors);
    console.log('Sampled color:', sampledColor);
    console.log('Is over image:', isOverImage);
    
    // Store the sampled color for display (ensure it's a string)
    sampledColorDisplay = String(sampledColor);
    
    // If we're over an image, always use white text regardless of sampled color
    if (isOverImage) {
      console.log('Over image detected - setting title to white');
      titleColor = 'text-white';
      sampledColorDisplay = sampledColor + ' (image)';
      return;
    }
    
    // Parse the sampled color and determine brightness
    const rgb = parseColor(sampledColor);
    if (!rgb) {
      console.log('Could not parse sampled color, defaulting to white text');
      titleColor = 'text-white';
      sampledColorDisplay = 'unparseable: ' + String(sampledColor);
      return;
    }
    
    // Calculate luminance to determine if background is light or dark
    const luminance = getLuminance(rgb[0], rgb[1], rgb[2]);
    console.log('Sampled RGB:', rgb, 'Luminance:', luminance);
    
    // More sensitive color detection - lower threshold for better contrast
    const newColor = luminance < 0.6 ? 'text-white' : 'text-gray-600';
    console.log('Setting title color to:', newColor, 'Luminance:', luminance.toFixed(3));
    titleColor = newColor;
  };
  
  const toggleDisplayMode = () => {
    const newMode = displayMode === 'fullscreen' ? 'side' : 'fullscreen';
    onDisplayModeChange?.(newMode);
  };
  
  // Detect color on mount and when display mode changes
  onMount(() => {
    checkSectionVisibility();
    detectBackgroundColor(); // Always detect color on mount
    
    // Add scroll listener to detect when header moves over different content
    const handleScroll = () => {
      checkSectionVisibility();
      detectBackgroundColor(); // Always detect color, even when hidden
    };
    
    // Add resize listener for window changes
    const handleResize = () => {
      detectBackgroundColor();
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    // Create a ResizeObserver to detect changes in the background
    const observer = new ResizeObserver(() => {
      detectBackgroundColor();
    });
    
    if (headerElement) {
      observer.observe(headerElement);
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  });
  
  // Re-detect color when display mode changes (background might change)
  $effect(() => {
    displayMode; // dependency
    setTimeout(detectBackgroundColor, 100); // small delay to allow DOM updates
  });
</script>

<header 
  bind:this={headerElement}
  class="fixed bottom-0 left-0 w-full z-[100] max-md:static transition-colors duration-200 text-gray-600 transition-opacity duration-300"
  class:opacity-0={shouldHideHeader}
  class:pointer-events-none={shouldHideHeader}>
  <div class="absolute inset-0 -z-10 border-[0.21px] border-white bg-opacity-70 backdrop-blur-sm"></div>
  <div class="p-8 max-md:p-4 max-md:text-center">
    <h1 class="text-4xl font-thin mb-11 mr-11 tracking-[2px] float-right max-md:float-none max-md:mb-0 max-md:mr-0 max-md:text-3xl {titleColor}"
        class:drop-shadow-lg={titleColor === 'text-white'}
        class:drop-shadow-md={titleColor !== 'text-white'}
        style={titleColor === 'text-white' ? 'text-shadow: 1px 1px 2px rgba(0,0,0,0.2)' : ''}>
      {name}
    </h1>
    
    <!-- Display mode controls -->
    {#if showFullscreenButton}
      <div class="flex gap-2 mt-4 fixed bottom-11 left-11 max-md:static max-md:justify-center max-md:mt-4 transition-opacity duration-300">
        <!-- Language toggle button -->
        <button 
          class="px-3 py-1 text-sm rounded transition-all duration-200 flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-40"
          onclick={onLanguageToggle}
          aria-label="Toggle language between English and Swedish"
          title={currentLanguage === 'en' ? 'Switch to Swedish' : 'Switch to English'}>
          <span class="text-base">{currentLanguage === 'en' ? '🇬🇧' : '🇸🇪'}</span>
        </button>
        
        <!-- Fullscreen toggle button -->
        <button 
          class="px-3 py-1 text-sm rounded transition-all duration-200 flex items-center gap-2"
          class:bg-gray-600={displayMode === 'fullscreen'}
          class:text-white={displayMode === 'fullscreen'}
          class:bg-white={displayMode !== 'fullscreen'}
          class:bg-opacity-20={displayMode !== 'fullscreen'}
          onclick={toggleDisplayMode}>
          <div class="w-4 h-4">
            {#if displayMode === 'fullscreen'}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-maximize-off">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 8v-2c0 -.551 .223 -1.05 .584 -1.412" />
                <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                <path d="M16 20h2c.545 0 1.04 -.218 1.4 -.572" />
                <path d="M3 3l18 18" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-maximize">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
                <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
              </svg>
            {/if}
          </div>
          {displayMode === 'fullscreen' ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>
    {/if}
  </div>
</header>
