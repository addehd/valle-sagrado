# ArtworkSection Enhanced Usage Examples

The ArtworkSection component now supports inserting custom components between artwork sections. Here are the usage patterns:

## Basic Usage (Backward Compatible)

```svelte
<!-- Single artwork (existing usage still works) -->
<ArtworkSection 
  {artwork} 
  {index} 
  {innerHeight} 
  displayMode="side" 
  shadow="md" />
```

## New Usage: Mixed Content Array

### Example 1: Single Custom Component in Middle

```svelte
<script>
  import ArtworkSection from './components/ArtworkSection.svelte';
  import ExampleCustomComponent from './components/ExampleCustomComponent.svelte';
  import ContactSection from '../../components/ContactSection.svelte';
  
  const contentItems = [
    { type: 'artwork', data: artworkData1 },
    { type: 'artwork', data: artworkData2 },
    { 
      type: 'component', 
      component: ExampleCustomComponent, 
      props: { 
        title: 'About the Artist', 
        description: 'Learn more about Maria\'s artistic journey...',
        buttonText: 'Read Bio' 
      } 
    },
    { type: 'artwork', data: artworkData3 },
    { type: 'artwork', data: artworkData4 }
  ];
</script>

<ArtworkSection 
  {contentItems} 
  {index} 
  {innerHeight} 
  displayMode="side" 
  shadow="md" />
```

### Example 2: Two Custom Components Distributed

```svelte
<script>
  const contentItems = [
    { type: 'artwork', data: artworkData1 },
    { 
      type: 'component', 
      component: ContactSection, 
      props: { theme: 'light' } 
    },
    { type: 'artwork', data: artworkData2 },
    { 
      type: 'component', 
      component: ExampleCustomComponent, 
      props: { 
        title: 'Gallery Exhibition', 
        description: 'Join us for the upcoming exhibition...' 
      } 
    },
    { type: 'artwork', data: artworkData3 }
  ];
</script>

<ArtworkSection 
  {contentItems} 
  {index} 
  {innerHeight} 
  displayMode="side" />
```

## Component Props

### Standard Props (Automatically Passed)
All custom components automatically receive these props:
- `index: number` - Current item index in the content array
- `innerHeight: number` - Section height
- `displayMode: 'side' | 'fullscreen' | 'centered'` - Current display mode
- `shadow: 'sm' | 'md' | 'lg'` - Shadow setting

### Custom Props
Pass any additional props via the `props` object in the content item.

## Content Item Structure

```typescript
type ContentItem = ArtworkItem | ComponentItem;

type ArtworkItem = {
  type: 'artwork';
  data: {
    id: number;
    artname: string;
    artist: string;
    shortDescription: string;
    artPieceImg: string;
    primaryColor: string;
    accentColor: string;
  };
};

type ComponentItem = {
  type: 'component';
  component: any; // Svelte component constructor
  props?: Record<string, any>; // Custom props for the component
};
```

## Distribution Logic

- **1 component**: Appears in the middle with equal artwork distribution around it
- **2 components**: Both components distributed with equal artwork spacing
- **Multiple components**: Evenly distributed throughout the content array

## Styling

Custom components inherit the same container styling as artwork sections:
- Same `min-height` as artwork sections
- Same padding (`px-4 md:px-8`)
- Centered layout with full width available
- Maintains consistent visual flow
