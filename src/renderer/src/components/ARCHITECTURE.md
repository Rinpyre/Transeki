# Component Architecture Guide

## Overview

Components are organized into **three logical categories** with a **barrel export pattern** to maintain scalability and prevent import path coupling.

## Folder Structure

```text
components/
├── index.js              # Main barrel export (re-exports all subfolders)
├── ARCHITECTURE.md       # This file
├── layout/               # Layout/container components
│   ├── index.js
│   ├── Sidebar.jsx
│   ├── SidebarLink.jsx
│   └── MangaContainer.jsx
├── common/               # Reusable UI components
│   ├── index.js
│   ├── MangaCard.jsx
│   ├── MangaChapterItem.jsx
│   └── SearchBar.jsx
└── features/             # Feature-specific components
    ├── index.js
    └── MangaPanel/
        ├── index.js
        ├── MangaPanel.jsx
        └── [future components]
```

## Category Guidelines

### Layout Components

- **Purpose**: Page structure and navigation containers
- **Examples**: Sidebar, header, footer, grid layouts
- **Reusability**: Medium (specific to app structure)
- **Location**: `layout/`

### Common Components

- **Purpose**: Generic, reusable UI elements
- **Examples**: Cards, buttons, input fields, badges
- **Reusability**: High (can be used anywhere)
- **Location**: `common/`

### Feature Components

- **Purpose**: Domain-specific features with complex logic
- **Examples**: MangaPanel (detail view), ChapterReader, UserProfile
- **Reusability**: Low (feature-specific)
- **Guidelines**:
  - Use a **subfolder** if the feature has 2+ related components
  - Single-component features can exist directly in `features/`
  - Create an `index.js` in each feature for barrel exports

## Import Pattern

### ✅ Always Use Barrel Exports (`@components`)

```jsx
// Good - Single line, clean
import { MangaCard, SearchBar, Sidebar } from '@components'

// Good - All components come from barrel
import { MangaPanel, MangaChapterItem } from '@components'
```

### ❌ Avoid Direct Paths

```jsx
// Bad - Creates path coupling
import MangaCard from '@components/common/MangaCard'
import SidebarLink from '@components/layout/SidebarLink'
```

### ⚠️ Exception: Local Utilities

Within feature folders, use relative imports for **utilities and hooks only**:

```jsx
// Inside features/MangaPanel/MangaPanel.jsx
import { useChapterNavigation } from './hooks/useChapterNavigation' // Local utility
import { MangaChapterItem } from '@components' // Via barrel
```

## Barrel Export Pattern

Each folder has an `index.js` that re-exports its components:

```javascript
// layout/index.js
export { default as Sidebar } from './Sidebar'
export { default as SidebarLink } from './SidebarLink'
export { default as MangaContainer } from './MangaContainer'

// common/index.js
export { default as MangaCard } from './MangaCard'
export { default as MangaChapterItem } from './MangaChapterItem'
export { default as SearchBar } from './SearchBar'

// features/index.js
export * from './MangaPanel'

// features/MangaPanel/index.js
export { default as MangaPanel } from './MangaPanel'

// Root: components/index.js (re-export everything)
export * from './layout'
export * from './common'
export * from './features'
```

## Benefits

| Benefit                      | Reason                                              |
| ---------------------------- | --------------------------------------------------- |
| **Folder-agnostic imports**  | Rename folders without breaking imports             |
| **DRY principle**            | Single line imports, no code duplication            |
| **Scalability**              | Change internal structure freely                    |
| **Clear intent**             | Developers immediately understand component purpose |
| **Preventing circular deps** | Barrel pattern isolates export scope                |

## Future Expansion

### Adding a New Layout Component

```text
layout/
├── index.js
├── Sidebar.jsx
├── Header.jsx          # New component
└── HeaderNav.jsx       # New component
```

Update `layout/index.js` and you're done. No other files need changes.

### Adding a Complex Feature

```text
features/
└── ChapterReader/
    ├── index.js
    ├── ChapterReader.jsx
    ├── ChapterNav.jsx      # Related component
    ├── ReadingSettings.jsx  # Related component
    └── hooks/
        ├── useChapterData.js
        └── useReadingPosition.js
```

Create the feature subfolder with its own `index.js` barrel. Update `features/index.js` to export from it.

### Scaling to Multiple Imports

When one category becomes large (10+ components), consider subcategories:

```text
common/
├── index.js
├── forms/              # Subfolder for form-related components
│   ├── index.js
│   ├── Input.jsx
│   └── Button.jsx
└── display/            # Subfolder for display components
    ├── index.js
    ├── Card.jsx
    └── Badge.jsx
```

## Rules of Thumb

1. **Every folder needs an `index.js`** - Always export components via barrel
2. **Import via `@components` only** - Exception: local utilities use relative paths
3. **One responsibility per folder** - Layout, Common, or Features (not mixed)
4. **Feature subfolders need 2+ components** - Don't over-engineer single-component features
5. **Test the barrel** - Ensure `import { X } from '@components'` works before importing

## Configuration

The alias `@components` is configured in `electron.vite.config.mjs`:

```javascript
'@components': resolve('src/renderer/src/components')
```

All barrel exports are automatically resolves through this alias.
