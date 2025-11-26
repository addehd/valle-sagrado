# MarkdownEditor Component

A rich text editor component for editing Markdown content with built-in image upload support.

## Features

- **Markdown Formatting Toolbar**
  - Headers (H1, H2, H3)
  - Bold, Italic, Code
  - Lists (bullet and numbered)
  - Blockquotes
  - Links

- **Image Upload** ✨
  - Click-to-upload functionality
  - Automatic upload to Supabase Storage (`teacher` bucket)
  - Validates file type (images only)
  - Validates file size (5MB max)
  - Auto-inserts markdown image syntax with URL
  - Visual feedback during upload

## Usage

### Basic Example

```svelte
<script>
  import MarkdownEditor from '$components/MarkdownEditor.svelte';
  
  let content = $state('');
  
  function handleChange(newContent: string) {
    content = newContent;
  }
</script>

<MarkdownEditor 
  value={content} 
  onChange={handleChange} 
/>
```

### In a Form

```svelte
<form method="POST">
  <MarkdownEditor 
    value={content} 
    onChange={handleChange} 
  />
  <input type="hidden" name="content" bind:value={content} />
  <button type="submit">Save</button>
</form>
```

## Image Upload

### How it Works

1. User clicks the "🖼️ Imagen" button in the toolbar
2. File picker opens (filtered to images only)
3. Selected image is validated:
   - Must be an image file
   - Must be under 5MB
4. Image is uploaded to Supabase Storage at `teacher/markdown-images/`
5. Markdown syntax is automatically inserted: `![filename](public-url)`

### Supabase Bucket

- **Bucket**: `teacher`
- **Folder**: `markdown-images/`
- **Naming**: `markdown-{timestamp}-{random}.{ext}`
- **Cache**: 3600 seconds (1 hour)

### Error Handling

The component shows user-friendly error messages for:
- Invalid file type
- File size too large
- Upload failures

Errors auto-dismiss after 3-5 seconds.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Initial markdown content |
| `onChange` | `(value: string) => void` | `() => {}` | Callback when content changes |

## Styling

The component is fully styled with:
- Responsive design (mobile-friendly)
- Hover and active states on buttons
- Disabled state during upload
- Error message styling

## Implementation in `/danny` Pages

The MarkdownEditor is integrated into the danny page editing workflow:

1. **View Page**: `/danny/[slug]` - Displays rendered markdown
2. **Edit Page**: `/danny/[slug]/edit` - Uses MarkdownEditor for content editing
3. **Save**: Server-side validation and database update

### Example: Danny Page Edit

```typescript
// +page.svelte
<MarkdownEditor 
  value={content} 
  onChange={handleContentChange} 
/>
<input type="hidden" name="content" bind:value={content} />

// +page.server.ts
export const actions = {
  updatePage: async ({ request, locals }) => {
    const formData = await request.formData();
    const content = formData.get('content')?.toString();
    
    // Update in database
    await supabase
      .from('coach_pages')
      .update({ content })
      .eq('id', pageId);
  }
};
```

## Browser Support

- Modern browsers with ES6+ support
- File API for image uploads
- Async/await for upload handling

## Dependencies

- Svelte 5 (with runes)
- `@supabase/supabase-js`
- Supabase environment variables:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
