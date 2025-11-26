# Toggle Edit Mode - Usage Guide

## Overview

The danny pages now support **inline editing** with a toggle feature - no need to navigate to a separate page!

## How to Use

### For End Users

1. **View a Page**: Navigate to any `/danny/[slug]` page
2. **Enter Edit Mode**: Click the yellow **"✏️ Editar"** button
3. **Make Changes**: 
   - Edit the title
   - Edit content using the MarkdownEditor
   - Upload images with the 🖼️ button
4. **Save or Cancel**:
   - **💾 Guardar** - Saves changes and returns to view mode
   - **✕ Cancelar** - Discards changes and returns to view mode

### Visual Flow

```
┌─────────────────────────────────┐
│     VIEW MODE                   │
│  ┌───────────────────────────┐  │
│  │  Page Content (rendered)  │  │
│  └───────────────────────────┘  │
│                                 │
│  [← Tillbaka]  [✏️ Editar]     │
└─────────────────────────────────┘
           │ Click Editar
           ▼
┌─────────────────────────────────┐
│     EDIT MODE                   │
│  ┌───────────────────────────┐  │
│  │  Title: [input field]     │  │
│  │                           │  │
│  │  Contenido:               │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ MarkdownEditor      │  │  │
│  │  │  [H1][H2][H3]       │  │  │
│  │  │  [B][I][<>]         │  │  │
│  │  │  [🔗][🖼️]          │  │  │
│  │  │  ┌───────────────┐  │  │  │
│  │  │  │ text area     │  │  │  │
│  │  │  └───────────────┘  │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
│                                 │
│  [💾 Guardar]  [✕ Cancelar]    │
└─────────────────────────────────┘
```

## Features

### ✨ Seamless Toggle
- No page navigation required
- Instant switch between view and edit modes
- State is preserved while editing

### 🔒 Safe Editing
- Cancel button discards changes
- Must explicitly click Save to persist
- Visual feedback during save operation

### 📝 Full Editor
- Complete MarkdownEditor with formatting toolbar
- Image upload support
- Title editing
- Auto-saves to database on submit

### 🎯 User Feedback
- Success message after saving: "✓ Página actualizada correctamente"
- Error message if something goes wrong: "✗ Hubo un problema..."
- Loading state on save button: "💾 Guardando..."
- Buttons disabled during save operation

## Technical Implementation

### State Management

```typescript
// Edit mode toggle
let isEditMode = $state(false);
let editContent = $state('');
let editTitle = $state('');
let isSaving = $state(false);

function toggleEditMode() {
  isEditMode = !isEditMode;
  if (isEditMode) {
    // Load current values into edit state
    editContent = page?.content || '';
    editTitle = page?.title || '';
  }
}
```

### Form Enhancement

Uses SvelteKit's `use:enhance` for progressive enhancement:

```typescript
use:enhance={() => {
  isSaving = true;
  return async ({ result, update }) => {
    isSaving = false;
    if (result.type === 'success') {
      isEditMode = false; // Auto-close edit mode on success
    }
    await update();
  };
}}
```

### Server Action

```typescript
// POST /danny/[slug]?/updatePage
export const actions = {
  updatePage: async ({ request, locals }) => {
    // Update coach_pages table
    // Returns success/error response
  }
}
```

## Keyboard Shortcuts (Future)

Potential enhancements:
- `Cmd/Ctrl + E` - Toggle edit mode
- `Cmd/Ctrl + S` - Save changes
- `Esc` - Cancel editing

## Comparison: Toggle vs Separate Page

### Toggle Mode (Current) ✅
- **Pros**: 
  - Faster workflow
  - No navigation needed
  - Better UX for quick edits
  - State remains on same page
- **Cons**: 
  - Can't share "edit" URL
  - No browser back button to exit edit

### Separate Edit Page (Also Available)
- **URL**: `/danny/[slug]/edit`
- **Pros**:
  - Shareable edit URL
  - Browser history integration
  - More options (meta description, active status)
- **Cons**:
  - Requires navigation
  - Slower for quick edits

## Best Practices

1. **Quick Edits**: Use toggle mode for fast content updates
2. **Major Changes**: Use separate edit page (`/danny/[slug]/edit`) for comprehensive edits
3. **Always Save**: Changes are only persisted when you click "Guardar"
4. **Image Uploads**: Wait for upload to complete before saving

## Code Location

- **Main Page**: `src/routes/danny/[slug]/+page.svelte`
- **Server Logic**: `src/routes/danny/[slug]/+page.server.ts`
- **Editor Component**: `src/components/MarkdownEditor.svelte`

## Future Enhancements

- [ ] Auto-save draft to localStorage
- [ ] Keyboard shortcuts
- [ ] Undo/Redo functionality
- [ ] Real-time preview toggle
- [ ] Edit history/versioning
- [ ] Collaborative editing indicators
