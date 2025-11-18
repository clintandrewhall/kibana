# ContentListProvider and Listing Components

## Document Purpose

This document specifies the UI components for the ContentList system. It defines the component APIs, props interfaces, and usage patterns that will be implemented.

**Related Documents:**
- **[LISTING_PROVIDER.md](./LISTING_PROVIDER.md)** - Provider implementation details (context, reducer, hooks)
- **[LISTING_PAGE.md](./LISTING_PAGE.md)** - Page wrapper component specification
- **[RECIPES.md](./RECIPES.md)** - Usage examples and migration patterns
- **[PLAN.md](./PLAN.md)** - Implementation phases and schedule

---

## Overview

The ContentList component system provides composable UI components for displaying and managing content lists in Kibana. These components can be used independently of `ContentListPage` for maximum flexibility.

**Core Concepts:**
- **ContentListProvider** - Central state management and configuration
- **Feature-based API** - Enable features with `true` or configure with objects
- **Compound components** - Flexible composition with slot-based layout
- **Contextual namespacing** - Clear hierarchy (e.g., `Toolbar.SearchBox`, `Filters.TagFilter`)
- **Read-only mode** - Single prop disables all actions

---

## Table of Contents

1. [ContentListProvider](#contentlistprovider)
2. [Consumer Hooks](#consumer-hooks)
3. [ContentList Components](#contentlist-components)
   - [ContentListTable](#contentlisttable)
   - [ContentListGrid](#contentlistgrid)
   - [ContentListToolbar](#contentlisttoolbar)
   - [ContentListFooter](#contentlistfooter)
4. [Toolbar Components](#toolbar-components)
   - [Toolbar.SearchBox](#toolbarsearchbox)
   - [Toolbar.Filters](#toolbarfilters)
   - [Toolbar.BulkActions](#toolbarbulkactions)
5. [Filter Components](#filter-components)
   - [Filters.SortSelect](#filterssortselect)
   - [Filters.TagFilter](#filterstagfilter)
   - [Filters.UserFilter](#filtersuserfilter)
   - [Filters.FavoritesFilter](#filtersfavoritesfilter)
6. [Footer Components](#footer-components)
   - [Footer.Pagination](#footerpagination)
7. [Supporting Components](#supporting-components)
   - [DeleteModal](#deletemodal)
8. [Complete Examples](#complete-examples)

---

## ContentListProvider

Central state management provider that controls all list features and behavior.

### Type Safety for Selection Actions

To prevent useless empty selection configs (`actions={{ selection: {} }}`), we enforce at compile-time that at least one selection action must be provided:

```typescript
/**
 * Selection actions must have at least one handler defined.
 * This prevents enabling selection UI without any actions.
 */
type SelectionActions<T> = {
  onDelete?: (items: T[]) => void;
  onExport?: (items: T[]) => void;
  [key: string]: ((items: T[]) => void) | undefined;
} & (
  | { onDelete: (items: T[]) => void }      // Must have onDelete, OR
  | { onExport: (items: T[]) => void }      // Must have onExport, OR
  | { [key: string]: (items: T[]) => void } // Must have at least one custom action
);

/**
 * Global actions config
 */
interface ActionsConfig<T> {
  onCreate?: () => void;
  selection?: SelectionActions<T>;  // Uses the validated type
}
```

**Why this matters:**
```typescript
// ❌ TypeScript error - empty selection not allowed
<ContentListProvider actions={{ selection: {} }} />

// ✅ Valid - has at least one action
<ContentListProvider actions={{ selection: { onDelete: (items) => {} } }} />

// ✅ Valid - custom action
<ContentListProvider actions={{ selection: { onArchive: (items) => {} } }} />

// ✅ Valid - multiple actions
<ContentListProvider 
  actions={{ 
    selection: { 
      onDelete: (items) => {},
      onExport: (items) => {} 
    } 
  }} 
/>
```

**Alternative approach:** If strict type enforcement proves too restrictive in practice, we can:
1. Allow `selection: {}` at the type level
2. Add runtime validation that logs a warning: "Selection enabled but no actions provided"
3. Document that selection state is only useful with external hooks (advanced use case)

For now, the strict type enforcement is recommended to guide consumers toward the correct API usage.

### Provider Props Interface

```tsx
interface ContentListProviderProps<T> {
  // Core configuration
  entityName: string;
  entityNamePlural: string;
  id?: string;
  
  // Read-only mode - disables all actions even if configured
  isReadOnly?: boolean;
  
  // Feature: Data Loading (required)
  dataSource: {
    findItems: (query: string, refs?: References, options?: { limit: number }) => Promise<{ total: number; hits: T[] }>;
    onFetchSuccess?: () => void;
    onFetchError?: (error: Error) => void;
    limit?: number; // Override default listing limit from uiSettings
  };
  
  // Feature: Search (optional - true enables with defaults, object for config)
  search?: true | {
    initialQuery?: string;
    queryParser?: (text: string) => Promise<ParsedQuery>;
    debounceMs?: number;
    forbiddenChars?: string;
    onQueryChange?: (query: string) => void;
  };
  
  // Feature: Sorting (optional - true enables with defaults, object for config)
  sorting?: true | {
    defaultSort?: { field: string; direction: 'asc' | 'desc' };
    options?: Array<{ field: string; label: string }>;
    persist?: boolean; // Save to localStorage
    onChange?: (sort: SortOption) => void;
  };
  
  // Feature: Filtering (optional - true enables with defaults, object for config)
  filtering?: true | {
    tags?: true | {
      getTagList?: () => Tag[];
      mode?: 'include' | 'exclude' | 'both';
      initialTags?: string[]; // Pre-select tags on load
    };
    users?: true | {
      showNoUserOption?: boolean;
      initialUsers?: string[]; // Pre-select users on load
    };
    favorites?: true | {
      variant?: 'button' | 'tab' | 'toggle';
      initialValue?: boolean; // Pre-select favorites filter on load
    };
    custom?: Array<{
      id: string;
      component: React.ComponentType;
    }>;
  };
  
  // Feature: Pagination (optional - true enables with defaults, object for config)
  pagination?: true | {
    initialPageSize?: number;
    pageSizeOptions?: number[];
    persist?: boolean;
    onChange?: (page: { index: number; size: number }) => void;
  };
  
  // Feature: URL State (optional - true enables with defaults, object for config)
  urlState?: true | {
    deserialize?: (params: URLQueryParams) => URLState;
    serialize?: (state: URLState) => URLQueryParams;
  };
  
  // Item configuration (optional - defines item behavior and actions)
  // Consistent across all renderers (Table, Grid, Custom)
  item?: {
    // Link property - href for the item
    getHref?: (item: T) => string;
    
    // Item actions - all interactive behaviors for individual items
    actions?: {
      onClick?: (item: T) => void;
      onEdit?: (item: T) => void;
      onDuplicate?: (item: T) => void;
      onExport?: (item: T) => void;
      onDelete?: (item: T) => void;
      // Add more custom per-item actions as needed (extensible)
      [key: string]: ((item: T) => void) | undefined;
    };
  };
  // Components render item.actions with smart defaults:
  // - onClick: Primary click/tap behavior (row click)
  // - onEdit: "Edit" in row actions menu with pencil icon
  // - onDuplicate: "Duplicate" in row actions menu
  // - onExport: "Export" in row actions menu
  // - onDelete: "Delete" in row actions menu (danger color)
  
  // Global actions (optional - callbacks for non-item-specific actions)
  // Provider defines BEHAVIOR (callbacks), components handle RENDERING
  actions?: {
    // Global action - no context needed
    onCreate?: () => void;
    
    // Bulk selection actions - multiple selected items
    // Presence of any selection action enables row selection UI
    selection?: {
      onDelete?: (items: T[]) => void;
      onExport?: (items: T[]) => void;
      // Extensible - add custom bulk actions as needed
      [key: string]: ((items: T[]) => void) | undefined;
    };
  };
  // Components render these with smart defaults:
  // - onCreate: Button in header/empty state (hidden when isReadOnly=true)
  // - selection.onDelete: Red/danger button in bulk actions toolbar
  // - selection.onExport: "Export" button in bulk actions toolbar
  
  // Feature: Recently Accessed (optional - presence enables recently accessed sorting)
  recentlyAccessed?: {
    get: () => Array<{ id: string; timestamp: number }>;
    add?: (id: string) => void;
  };
  
  // Feature: Analytics/Telemetry (optional - hooks for tracking user interactions)
  analytics?: {
    onItemView?: (item: T) => void;
    onItemClick?: (item: T) => void;
    onSearch?: (query: string) => void;
    onFilter?: (filters: { tags?: string[]; users?: string[]; favorites?: boolean }) => void;
    onSort?: (field: string, direction: 'asc' | 'desc') => void;
    onBulkAction?: (action: string, itemCount: number) => void;
  };
  
  children: ReactNode;
}
```

### Hooks Exposed by Provider

The provider exposes focused hooks for accessing state, config, and actions. These hooks enable building custom components while maintaining integration with the provider's state management.

#### `useContentListState()`

Access the complete context including state, config (provider props), and dispatch.

```tsx
import { useContentListState } from '@kbn/content-list-provider';

function CustomComponent() {
  const { state, entityName, item, actions, search, sorting, dispatch } = useContentListState();
  
  // Access dynamic state (nested)
  const { items, isLoading, selectedItems } = state;
  console.log(items, isLoading);
  
  // Access provider configuration (top-level for easy access)
  console.log(entityName, item, actions, search, sorting);
  
  // Check if features are enabled
  if (search) {
    // Search is enabled
  }
  
  // Check if actions are available (respects isReadOnly)
  if (actions?.onCreate) {
    <button onClick={actions.onCreate}>
      Create {entityName}
    </button>
  }
  
  if (item?.actions?.onEdit) {
    <button onClick={() => item.actions.onEdit(selectedItem)}>
      Edit
    </button>
  }
  
  if (actions?.selection?.onDelete && selectedItems.size > 0) {
    <button onClick={() => actions.selection.onDelete(Array.from(selectedItems))}>
      Delete {selectedItems.size} items
    </button>
  }
  
  // Dispatch actions to update state
  dispatch({ type: 'SET_SEARCH_QUERY', payload: 'new query' });
}
```

**Returns:**
```typescript
{
  // Dynamic state (nested for clarity)
  state: {
    items: T[];
    totalItems: number;
    isLoading: boolean;
    error?: Error;
    searchQuery: string;
    activeFilters: FilterState;
    sortField: string;
    sortDirection: 'asc' | 'desc';
    pageIndex: number;
    pageSize: number;
    selectedItems: Set<string>;
  };
  
  // Provider configuration (top-level for easy access)
  entityName: string;
  entityNamePlural: string;
  dataSource: DataSourceConfig<T>;
  search?: true | SearchConfig;
  sorting?: true | SortingConfig;
  filtering?: true | FilteringConfig;
  pagination?: true | PaginationConfig;
  urlState?: true | URLStateConfig;
  item?: ItemConfig<T>;  // Item configuration (getHref, actions)
  actions?: ActionsConfig<T>;  // undefined when isReadOnly=true
  recentlyAccessed?: RecentlyAccessedConfig;
  analytics?: AnalyticsConfig<T>;
  preview?: PreviewConfig<T>;
  isReadOnly?: boolean;
  
  // State updater
  dispatch: React.Dispatch<ContentListAction>;
}
```

#### `useContentListActions()`

Access imperative actions for external integrations (e.g., custom buttons, external triggers).

```tsx
import { useContentListActions } from '@kbn/content-list-provider';

function ExternalResetButton() {
  const { clearFilters, refreshItems, setSearchQuery } = useContentListActions();
  
  return (
    <button onClick={() => {
      clearFilters();
      setSearchQuery('');
      refreshItems();
    }}>
      Reset All
    </button>
  );
}
```

**Returns:**
```typescript
{
  setSearchQuery: (query: string) => void;
  setFilter: (filter: FilterUpdate) => void;
  clearFilters: () => void;
  setSorting: (field: string, direction: 'asc' | 'desc') => void;
  setPage: (index: number, size?: number) => void;
  refreshItems: () => Promise<void>;
}
```

#### `useContentListSelection()`

Access selection state and controls for building custom selection UI.

```tsx
import { useContentListSelection } from '@kbn/content-list-provider';

function CustomBulkAction() {
  const { selectedItems, selectedCount, clearSelection, selectAll } = useContentListSelection();
  
  return (
    <div>
      <span>{selectedCount} selected</span>
      <button onClick={selectAll}>Select All</button>
      <button onClick={clearSelection}>Clear</button>
    </div>
  );
}
```

**Returns:**
```typescript
{
  selectedItems: Set<string>;  // Set of selected item IDs (efficient lookups)
  selectedCount: number;        // Number of selected items
  toggleSelection: (itemId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  isSelected: (itemId: string) => boolean;  // Check if item is selected
}
```

**Why these hooks instead of a full headless API?**

These focused hooks provide the flexibility needed for custom components while maintaining the simplicity and consistency of the component-based approach.

### Read-Only Mode

When `isReadOnly={true}`, the provider automatically disables all user actions, even if configured:
- Selection and bulk actions are disabled
- Item actions (edit, create, delete) are hidden
- Content editor (if present) becomes read-only
- Action buttons and menu items are not rendered

**Why `isReadOnly` is Better Than Conditional Props:**

```tsx
// Old Pattern (verbose, error-prone)
<ContentListProvider
  item={!isReadOnly ? { actions: { onEdit } } : undefined}
  actions={{
    onCreate: !isReadOnly ? createItem : undefined,
    selection: !isReadOnly ? { onDelete: deleteItems } : undefined,
  }}
>

// New Pattern (clean, single source of truth)
<ContentListProvider
  isReadOnly={isReadOnly}
  item={{
    actions: { onEdit },
  }}
  actions={{
    onCreate: createItem,
    selection: { onDelete: deleteItems },
  }}
>
```

**Benefits:**
- Less boilerplate code
- Single source of truth for read-only state
- Easier to test (mock `isReadOnly`, not every prop)
- More maintainable when adding new actions

### Feature-Based API Benefits

1. **Self-Documenting API**
   ```tsx
   // Old: Boolean flags scattered, unclear what's available
   features={{ search: true, sorting: true, filtering: true }}
   findItems={...}
   initialFilter="..."
   customSortingOptions={...}
   
   // New: All related config in one place
   search={{ initialQuery: "..." }}
   sorting={{ options: [...] }}
   ```

2. **Discoverable Features**
   - TypeScript autocomplete shows all available features
   - Each feature object shows its configuration options
   - No need to hunt through documentation

3. **Explicit Enabling**
   ```tsx
   // Want search? Just add it:
   search={true}  // Enabled with defaults
   
   // Want custom config? Provide it:
   search={{ 
     initialQuery: "test",
     debounceMs: 500,
   }}
   
   // Don't want search? Just omit it:
   // (no search prop at all)
   ```

4. **Reduced Prop Sprawl**
   - Before: 30+ scattered props
   - After: 10-12 feature objects with related config inside

5. **Separation of Behavior and Presentation**
   - Provider defines **behavior** via `actions` prop (just callback functions)
   - Components handle **rendering** with smart defaults (icons, colors, labels)
   - Clear separation of concerns: business logic vs. UI presentation
   
   Callbacks are grouped by execution context:
   - `actions.onCreate` - Global action (no item context needed)
   - `item.actions.*` - Per-item operations (single item context)
   - `actions.selection.*` - Bulk operations (multiple selected items)
   
   This provides clear semantics and type safety. The `ContentList` convenience component (see [PLAN.md](./PLAN.md#contentlist-convenience-component)) maintains this same structure for consistency.

---

## ContentList Components

Sub-components for building custom layouts. These are used internally by `ContentList` smart defaults, but can also be used directly for full layout control.

### ContentListTable

Table renderer with declarative column and action configuration via compound components.

**Package:** `@kbn/content-list-table`

```tsx
import { ContentListTable } from '@kbn/content-list-table';

interface ContentListTableProps {
  /** Column components as children (defaults: Name, UpdatedAt, Actions) */
  children?: ReactNode;
  
  /** Row customization (expandable rows) */
  row?: {
    renderDetails?: (item: ContentListItem) => ReactNode;
  };
  
  /** Preview popover configuration */
  preview?: {
    enabled: boolean;
    render: (item: ContentListItem) => ReactNode;
    trigger?: 'hover' | 'click';
    size?: 's' | 'm' | 'l';
  };
  
  /** Table layout mode */
  tableLayout?: 'fixed' | 'auto';
  
  /** Compressed table style */
  compressed?: boolean;
  
  /** Custom empty state component */
  emptyState?: ReactNode;
  
  'data-test-subj'?: string;
}
```

**Basic usage:**
```tsx
// Default columns (Name, UpdatedAt, Actions)
<ContentListProvider {...props}>
  <ContentListTable />
</ContentListProvider>

// Custom columns via compound components
const { Column, Action } = ContentListTable;

<ContentListTable>
  <Column.Name showDescription showTags width="40%" />
  <Column.UpdatedAt columnTitle="Last Modified" />
  <Column.Actions>
    <Action.Edit />
    <Action.Delete />
  </Column.Actions>
</ContentListTable>

// Add custom columns
<ContentListTable>
  <Column.Name />
  <Column
    id="status"
    name="Status"
    width="120px"
    render={(item) => <EuiBadge>{item.status}</EuiBadge>}
  />
  <Column.UpdatedAt />
  <Column.Actions />
</ContentListTable>
```

#### Built-in Columns

| Column | Props | Default |
|--------|-------|---------|
| `Column.Name` | `showDescription`, `showTags`, `sortable`, `width`, `columnTitle` | Shown |
| `Column.UpdatedAt` | `width`, `columnTitle` | Shown |
| `Column.CreatedBy` | `width`, `columnTitle` | Hidden |
| `Column.Actions` | `width`, `columnTitle`, children (Action components) | Shown |

#### Built-in Actions

| Action | Handler Source |
|--------|----------------|
| `Action.Edit` | `itemConfig.actions.onEdit` |
| `Action.Delete` | `itemConfig.actions.onDelete` |
| `Action.Duplicate` | `itemConfig.actions.onDuplicate` |
| `Action.Export` | `itemConfig.actions.onExport` |
| `Action.Custom` | `handler` prop (required) |

**Custom actions:**
```tsx
<Column.Actions>
  <Action.Edit />
  <Action.Custom
    id="share"
    label="Share"
    iconType="share"
    handler={(item) => handleShare(item)}
    tooltip="Share with team"
  />
  <Action.Delete />
</Column.Actions>
```

#### Architecture

Columns use a declarative marker component pattern:

1. **Marker components** (`Column.Name`, `Action.Edit`, etc.) don't render anything
2. **Parser** extracts props from children into configuration
3. **Builder** transforms configuration into EUI table columns
4. **Cell components** handle actual rendering

See the [columns README](../../kbn-content-list-table/columns/README.mdx) for detailed architecture and customization.

#### Row Actions

Row actions are derived from `item.actions` on the provider. Handlers are configured in the provider; the table renders the UI.

**Custom action rendering:**

For complete control over action rendering, use the `render` prop on `Column.Actions`:

```tsx
<Column.Actions
  render={(item) => (
    <EuiFlexGroup gutterSize="xs" responsive={false}>
      <EuiButtonIcon
        iconType="pencil"
        aria-label={`Edit ${item.title}`}
        onClick={() => editItem(item)}
      />
      <EuiButtonIcon
        iconType="trash"
        color="danger"
        aria-label={`Delete ${item.title}`}
        onClick={() => deleteItem(item)}
      />
    </EuiFlexGroup>
  )}
/>
```

The provider continues to own behavior (callbacks, read-only enforcement) while consumers can tailor presentation.

---

### ContentListGrid

Grid/card-based rendering for visual content display.

```tsx
interface GridProps<T> {
  // Item rendering
  item: {
    render: (item: T) => ReactNode;  // Required: how to render each item
  };
  // Note: Item interactions (onClick, getHref, actions) are defined on the Provider
  // via the `item` prop, ensuring consistent behavior across all renderers (Table, Grid, etc.)
  
  // Grid layout
  columns?: number | { xs?: number; s?: number; m?: number; l?: number; xl?: number };
  gutterSize?: 's' | 'm' | 'l' | 'xl';
  
  // Appearance
  compressed?: boolean;
  
  // Empty state
  emptyState?: ReactNode;
  
  children?: ReactNode;
}
```

**Usage:**
```tsx
<ContentListProvider {...props}>
  <ContentListToolbar />
  
  <ContentListGrid
    columns={3}
    item={{
      render: (item) => (
        <EuiCard
          title={item.attributes.title}
          description={item.attributes.description}
          onClick={() => navigateTo(item.id)}
        />
      )
    }}
  />
</ContentListProvider>

// Responsive columns
<ContentListGrid
  columns={{ xs: 1, s: 2, m: 3, l: 4 }}
  gutterSize="m"
  item={{
    render: (item) => <VisualizationCard item={item} />
  }}
/>
```

---

### ContentListToolbar

Container for search, filters, and bulk actions.

**Smart Defaults:** If no children provided, renders a standard toolbar structure automatically based on enabled features from `ContentListProvider`.

```tsx
interface ToolbarProps {
  // Children: if omitted, renders smart default; if provided, you have full control
  children?: ReactNode;
}
```

**Sub-components for composition:**
- `Toolbar.SearchBox` - Search input with query parsing
- `Toolbar.Filters` - Container for filter components (with smart defaults)
- `Toolbar.BulkActions` - Bulk action controls (delete button + custom actions)
- `Toolbar.Button` - Pre-styled button matching toolbar aesthetics (convenience wrapper around EuiButtonEmpty)

**Usage:**

```tsx
// Pattern 1: Smart Default (recommended!)
<ContentListToolbar />

// Auto-renders based on enabled features:
// - SearchBox (if search prop provided)
// - Filters container with enabled filters:
//   - SortSelect (if sorting provided)
//   - TagFilter (if filtering.tags provided)
//   - UserFilter (if filtering.users provided)
//   - FavoritesFilter (if filtering.favorites provided)
//   - Custom filters (if filtering.custom provided)
// - BulkActions (if selection provided)

// Pattern 2: Full Override (for custom layouts)
<ContentListToolbar>
  {/* You provide all children - full control */}
  <Toolbar.SearchBox />
  <Toolbar.Filters>
    <Filters.SortSelect />
    <Filters.TagFilter />
  </Toolbar.Filters>
  {/* Add custom buttons with Toolbar.Button for consistent styling */}
  <Toolbar.Button iconType="inspect" onClick={handleDiagnostics}>
    Diagnostics
  </Toolbar.Button>
  <Toolbar.BulkActions />
</ContentListToolbar>

// Pattern 2: Full Override with Custom Positioning
<ContentListToolbar>
  <EuiFlexGroup justifyContent="spaceBetween" gutterSize="s">
    <EuiFlexItem grow={false}>
      <EuiFlexGroup gutterSize="s" alignItems="center">
        <EuiFlexItem grow={false}>
          <Toolbar.BulkActions />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <Toolbar.Button onClick={handleExport}>Export</Toolbar.Button>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiFlexGroup gutterSize="s" alignItems="center">
        <EuiFlexItem grow={false}>
          <Toolbar.SearchBox />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <Toolbar.Filters />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  </EuiFlexGroup>
</ContentListToolbar>
```

**Rendering Behavior:**
- **No children** → Renders smart default (feature-aware layout)
- **Children provided** → Full override; you compose with `Toolbar.*` sub-components
- Toolbar handles its own full-width container and vertical spacing

---

### ContentListFooter

Container for pagination and footer actions with flexible layout.

**Smart Defaults:** If no children provided, renders pagination automatically if `pagination` is enabled in `ContentListProvider`.

```tsx
interface FooterProps {
  // Children (compound components or direct)
  // If omitted, renders smart default (Pagination)
  children?: ReactNode;
}

// Compound components for custom positioning
Footer.Left = ({ children }: { children: ReactNode }) => children;
Footer.Center = ({ children }: { children: ReactNode }) => children;
Footer.Right = ({ children }: { children: ReactNode }) => children;
```

**Sub-components:**
- `Footer.Pagination` - Pagination controls

**Usage:**

```tsx
// Simplest: No children - renders pagination (if enabled)
<ContentListFooter />

// Explicit: same as default
<ContentListFooter>
  <Footer.Pagination />
</ContentListFooter>

// Advanced: custom layout with additional content
<ContentListFooter>
  <Footer.Left>
    <ItemCountMetadata />
  </Footer.Left>
  <Footer.Center>
    <Footer.Pagination />
  </Footer.Center>
  <Footer.Right>
    <ExportButton />
  </Footer.Right>
</ContentListFooter>
```

---

## Toolbar Components

### Toolbar.SearchBox

Search input with query parsing and validation.

```tsx
interface SearchBoxProps {
  // Behavior
  incremental?: boolean;
  debounceMs?: number;
  
  // Customization
  placeholder?: string;
  prepend?: ReactNode;
  append?: ReactNode;
  
  // Advanced
  queryParser?: (text: string) => Promise<ParsedQuery>;
  syntaxHint?: ReactNode;
  
  // Validation
  forbiddenChars?: string;
  onQueryError?: (error: SearchError) => void;
  
  'data-test-subj'?: string;
}
```

**Usage:**
```tsx
<Toolbar.SearchBox 
  placeholder="Search dashboards..."
  debounceMs={300}
/>
```

---

### Toolbar.Filters

Container for filter components with consistent styling.

**Smart Defaults:** If no children provided, renders all configured filters automatically based on `filtering` config in `ContentListProvider`.

```tsx
interface FiltersProps {
  // Layout
  layout?: 'inline' | 'popover';
  
  // Active filter display
  showActiveFilters?: boolean;
  onClearAll?: () => void;
  
  // Children are filter components
  // If omitted, renders all enabled filters from provider config
  children?: ReactNode;
}
```

**Sub-components:**
- `Filters.SortSelect` - Sort order selector (rendered if `sorting` enabled)
- `Filters.TagFilter` - Tag filtering (rendered if `filtering.tags` provided)
- `Filters.UserFilter` - User filtering (rendered if `filtering.users` provided)
- `Filters.FavoritesFilter` - Favorites toggle/filter (rendered if `filtering.favorites` provided)

**Usage:**

```tsx
// Simplest: No children - renders all enabled filters
<Toolbar.Filters />

// Default renders (based on provider config):
// - SortSelect (if sorting prop provided)
// - TagFilter (if filtering.tags provided)
// - UserFilter (if filtering.users provided)
// - FavoritesFilter (if filtering.favorites provided)
// - Custom filters (if filtering.custom provided)

// Explicit: Pick specific filters (overrides default)
<Toolbar.Filters>
  <Filters.SortSelect />
  <Filters.TagFilter />
  <Filters.UserFilter />
  <Filters.FavoritesFilter />
  
  {/* Custom filters just work */}
  <MyCustomFilter />
</Toolbar.Filters>
```

---

### Toolbar.BulkActions

Bulk actions for selected items.

**Smart Defaults:** Built-in bulk actions (delete, export) are automatically derived from `actions.selection` config in `ContentListProvider`. Only visible when items are selected.

```tsx
interface BulkActionsProps {
  // Custom actions (beyond built-in ones from provider)
  // Built-in actions are automatically shown based on provider config:
  // - Delete: shown if actions.selection.onDelete provided
  // - Export: shown if actions.selection.onExport provided
  actions?: Array<{
    id: string;
    label: ReactNode;
    icon?: string;
    color?: string;
    onClick: (selectedItems: T[]) => void;
    isDisabled?: (selectedItems: T[]) => boolean;
  }>;
  
  children?: ReactNode;
}
```

**Usage:**
```tsx
// Simplest: No props - renders built-in actions from provider
<Toolbar.BulkActions />

// With custom actions (in addition to built-in delete/export)
<Toolbar.BulkActions 
  actions={[
    {
      id: 'share',
      label: 'Share selected',
      icon: 'share',
      onClick: shareItems,
    }
  ]}
/>
```

---

### Toolbar.Button

Pre-styled button component matching toolbar aesthetics (convenience wrapper).

```tsx
interface ToolbarButtonProps extends Omit<EuiButtonEmptyProps, 'size' | 'flush'> {
  // All EuiButtonEmpty props supported (iconType, color, onClick, etc.)
  // Size and flush are pre-configured for toolbar consistency
  children: ReactNode;
}
```

**Usage:**
```tsx
{/* Standard toolbar button */}
<Toolbar.Button onClick={handleDiagnostics}>
  Diagnostics
</Toolbar.Button>

{/* With icon */}
<Toolbar.Button iconType="inspect" onClick={handleInspect}>
  Inspect
</Toolbar.Button>

{/* With color (for emphasis) */}
<Toolbar.Button iconType="exportAction" color="primary" onClick={handleExport}>
  Export
</Toolbar.Button>

{/* Custom styling (all EuiButtonEmpty props work) */}
<Toolbar.Button 
  iconType="download"
  iconSide="right"
  onClick={handleDownload}
>
  Download Report
</Toolbar.Button>
```

**Why use Toolbar.Button?**
- Ensures consistent styling across all toolbar buttons
- Pre-configured size and spacing for toolbar context
- Reduces boilerplate in custom toolbar layouts
- You can still use `EuiButton`, `EuiButtonEmpty`, or other components directly if you prefer different styling

---

## Filter Components

### Filters.SortSelect

Sort selection dropdown.

**Smart Defaults:** Sort options are automatically derived from `sorting.options` config in `ContentListProvider`. If not specified, smart defaults are used based on available fields (name, updatedAt, recentlyAccessed).

```tsx
interface SortSelectProps {
  // Customization
  buttonContent?: ReactNode;
  
  // Optional: Override options from provider (rarely needed)
  options?: SortOption[];
}
```

**Usage:**
```tsx
// Simplest: No props - uses options from provider
<Filters.SortSelect />

// Custom button content
<Filters.SortSelect 
  buttonContent={<>Sort by <EuiIcon type="arrowDown" /></>}
/>
```

---

### Filters.TagFilter

Tag filtering with include/exclude modes.

```tsx
interface TagFilterProps {
  // Tag integration
  getTagList?: () => Tag[];
  
  // Behavior
  mode?: 'include' | 'exclude' | 'both';
  multiSelect?: boolean;
  
  // Customization
  label?: string;
  icon?: string;
  
  onChange?: (selectedTags: Tag[], mode: 'include' | 'exclude') => void;
}
```

---

### Filters.UserFilter

User/creator filtering.

```tsx
interface UserFilterProps {
  // User list
  users: Array<{ id: string; name: string }>;
  
  // Options
  showNoUserOption?: boolean;
  multiSelect?: boolean;
  
  // Customization
  label?: string;
  renderUser?: (user: User) => ReactNode;
  
  onChange?: (selectedUsers: string[]) => void;
}
```

---

### Filters.FavoritesFilter

Favorites filtering toggle.

```tsx
interface FavoritesFilterProps {
  // Appearance
  variant?: 'button' | 'tab' | 'toggle';
  
  // Labels
  label?: string;
  
  onChange?: (favoritesOnly: boolean) => void;
}
```

---

## Footer Components

### Footer.Pagination

Pagination controls.

```tsx
interface PaginationProps {
  // Options
  pageSizeOptions?: number[];
  
  // Behavior
  showPerPageOptions?: boolean;
  compressed?: boolean;
  
  // Callbacks
  onChange?: (page: { index: number; size: number }) => void;
}
```

**Usage:**
```tsx
<Footer.Pagination 
  pageSizeOptions={[10, 20, 50, 100]}
  showPerPageOptions={true}
/>
```

---

## Supporting Components

### DeleteModal

Confirmation modal for delete operations (standalone, not namespaced under ContentList).

```tsx
interface DeleteModalProps<T> {
  items: T[];
  entityName: string;
  entityNamePlural: string;
  
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  
  // Customization
  title?: ReactNode;
  confirmButtonText?: string;
  renderItem?: (item: T) => ReactNode;
}
```

## Complete Examples

### Minimal Configuration

```tsx
<ContentListProvider
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems: findDashboards }}
  search={true}
  sorting={true}
  pagination={true}
>
  <ContentList />
</ContentListProvider>
```

This automatically renders:
- Toolbar with SearchBox, Filters (SortSelect), and BulkActions
- Table with default columns (name, updatedAt, actions)
- Footer with Pagination

### Fully Featured Listing

Full control with custom configuration and layout:

```tsx
<ContentListProvider
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems: findDashboards }}
  search={{
    initialQuery: searchQuery,
    debounceMs: 300,
  }}
  sorting={{
    defaultSort: { field: 'updatedAt', direction: 'desc' },
    persist: true,
  }}
  filtering={{
    tags: true,
    users: true,
    favorites: { variant: 'button' },
  }}
  pagination={{
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50],
    persist: true,
  }}
  urlState={true}
  item={{
    actions: { onEdit: editDashboard },
  }}
  actions={{
    onCreate: createDashboard,
    selection: {
      onDelete: deleteDashboards,
      onExport: exportDashboards,
    },
  }}
  recentlyAccessed={getDashboardRecentlyAccessedService()}
>
  {/* Using sub-components directly for full control (not ContentList convenience component) */}
  <ContentListToolbar>
    <Toolbar.SearchBox />
    <Toolbar.Filters>
      <Filters.SortSelect />
      <Filters.TagFilter />
      <Filters.UserFilter />
      <Filters.FavoritesFilter />
    </Toolbar.Filters>
    <Toolbar.BulkActions />
  </ContentListToolbar>
  
  <ContentListTable>
    <Column.Name showDescription showTags width="40%" />
    <Column.UpdatedAt />
    <Column.Actions>
      <Action.Edit />
      <Action.Custom id="clone" label="Clone" iconType="copy" handler={(item) => clone(item)} />
      <Action.Delete />
    </Column.Actions>
  </ContentListTable>
  
  <ContentListFooter>
    <Footer.Pagination />
  </ContentListFooter>
</ContentListProvider>
```

### Read-Only Mode

```tsx
<ContentListProvider
  entityName="map"
  entityNamePlural="maps"
  isReadOnly={!hasWritePermission}  // Disables all actions automatically
  dataSource={{ findItems: findMaps }}
  search={true}
  sorting={true}
  pagination={true}
  item={{
    actions: { onEdit: editMap },    // Ignored when isReadOnly=true
  }}
  actions={{
    onCreate: createMap,          // Ignored when isReadOnly=true
    selection: { onDelete: deleteMaps },  // Ignored when isReadOnly=true
  }}
>
  <ContentList />
</ContentListProvider>
```

When `isReadOnly={true}`, all action UI is automatically hidden (create buttons, edit/delete actions, bulk actions).

### Embedded in Custom Layout

Custom layout without pagination (using sub-components directly):

```tsx
<EuiFlyout onClose={onClose}>
  <EuiFlyoutHeader>
    <EuiTitle><h2>Select a file</h2></EuiTitle>
  </EuiFlyoutHeader>
  
  <EuiFlyoutBody>
    <ContentListProvider
      entityName="file"
      entityNamePlural="files"
      dataSource={{ findItems: findFiles }}
      search={true}
      sorting={true}
    >
      {/* Using sub-components directly to omit Footer/Pagination */}
      <ContentListToolbar />
      <ContentListTable>
        <Column.Name />
        <Column.UpdatedAt />
      </ContentListTable>
    </ContentListProvider>
  </EuiFlyoutBody>
</EuiFlyout>
```

### Inline Metadata Editing

The list components **do not** include built-in inline editing. Consumers who want inline metadata editing can use the `useOpenContentEditor()` hook from `@kbn/content-management-content-editor`:

```tsx
import { useOpenContentEditor } from '@kbn/content-management-content-editor';

function DashboardListing() {
  const openEditor = useOpenContentEditor();
  
  const handleEdit = (item) => {
    // Option 1: Navigate to full edit page (Maps, Lens, Files approach)
    navigateTo(`/edit/${item.id}`);
    
    // Option 2: Open inline metadata editor (Dashboard, Visualizations approach)
    openEditor({
      item: {
        id: item.id,
        title: item.attributes.title,
        description: item.attributes.description,
        tags: getTagsFromReferences(item.references),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        // ... other metadata
      },
      entityName: 'dashboard',
      onSave: async (updatedItem) => {
        await updateDashboardMetadata(updatedItem);
        // Refresh the list
        await refetch();
      },
      customValidators: {
        title: [
          {
            type: 'warning',
            fn: async (value, id) => {
              // Check for duplicate titles
              const isDuplicate = await checkForDuplicate(value, id);
              return isDuplicate ? 'Title already exists' : undefined;
            }
          }
        ]
      }
    });
  };
  
  return (
    <ContentListProvider
      item={{
        actions: { onEdit: handleEdit },  // Choose your edit UX
      }}
      actions={{
        onCreate: createDashboard,
      }}
      {...}
    >
      <ContentListToolbar />
      <ContentListTable />
    </ContentListProvider>
  );
}
```

**Why separate?**
- **Domain-specific** - Inline editing is an implementation detail, not core listing functionality
- **Flexibility** - Different apps prefer different edit UX (full page vs. modal)
- **Loose coupling** - Listing components don't depend on editor package
- **Testability** - Easier to test listing and editing concerns independently

**Current usage:** Only 2 of 6 consumers (Dashboard, Visualizations) use inline editing. The others (Maps, Lens, Files, ML) navigate to dedicated edit pages.

---

## Analytics & Telemetry

Track user interactions with the listing for usage metrics and analytics:

```tsx
<ContentListProvider
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems }}
  analytics={{
    onItemView: (item) => {
      // Track when item is displayed in list
      telemetry.track('dashboard_listed', { id: item.id });
    },
    onItemClick: (item) => {
      // Track when user clicks on item
      telemetry.track('dashboard_opened', { 
        id: item.id,
        title: item.attributes.title 
      });
    },
    onSearch: (query) => {
      // Track search queries
      telemetry.track('dashboard_search', { query });
    },
    onFilter: (filters) => {
      // Track filter usage
      telemetry.track('dashboard_filtered', filters);
    },
    onSort: (field, direction) => {
      // Track sorting preferences
      telemetry.track('dashboard_sorted', { field, direction });
    },
    onBulkAction: (action, itemCount) => {
      // Track bulk operations
      telemetry.track('dashboard_bulk_action', { action, itemCount });
    },
  }}
>
  <ContentListTable />
</ContentListProvider>
```

**Common use cases:**
- **Usage metrics** - Track which content is most accessed
- **Search analytics** - Understand what users search for
- **Feature adoption** - Monitor usage of filters, sorting, bulk actions
- **A/B testing** - Compare different UI variations

---

## Preview Popovers

Show a preview of content on hover or click without navigating away:

```tsx
<ContentListProvider
  entityName="visualization"
  entityNamePlural="visualizations"
  dataSource={{ findItems }}
>
  <ContentListTable
    preview={{
      enabled: true,
      trigger: 'hover',
      size: 'm',
      render: (item) => (
        <EuiPanel style={{ width: 400 }}>
          <EuiText size="s">
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </EuiText>
          <VisualizationPreview id={item.id} />
        </EuiPanel>
      ),
    }}
  >
    <Column.Name />
    <Column.UpdatedAt />
    <Column.Actions />
  </ContentListTable>
</ContentListProvider>
```

**Options:**
- `trigger: 'hover'` - Show on mouse hover (default)
- `trigger: 'click'` - Show on click (better for mobile)
- `size: 's' | 'm' | 'l'` - Popover width
- `anchorPosition` - Where popover appears relative to row

**Performance tip:** Use lazy loading or thumbnail images in preview to avoid expensive rendering:

```tsx
preview={{
  render: (item) => (
    <Suspense fallback={<EuiLoadingSpinner />}>
      <LazyVisualizationPreview id={item.id} />
    </Suspense>
  ),
}}
```

---

## Initial Filter State

Pre-select filters when the listing loads (e.g., show only items with specific tags):

```tsx
<ContentListProvider
  entityName="rule"
  entityNamePlural="rules"
  dataSource={{ findItems }}
  filtering={{
    tags: {
      initialTags: ['security', 'high-priority'], // Pre-select these tags
      mode: 'include',
    },
    users: {
      initialUsers: ['current-user'], // Show only current user's items
    },
    favorites: {
      initialValue: true, // Show only favorited items
    },
  }}
>
  <ContentListToolbar />
  <ContentListTable />
</ContentListProvider>
```

**Use cases:**
- **Security team** - Pre-filter by specific tags for compliance views
- **ResponseOps** - Show only rules from current context
- **Dashboard** - Remember last filter state (combine with URL state)

**Interaction with URL state:**
- Initial values are used on first load only
- URL parameters override initial values if present
- Useful for deep linking with default filters

---

## Error Handling

### Data Fetching Errors

The provider automatically displays error states when `findItems` throws an error. You can also provide an `onFetchError` callback for custom handling (e.g., showing toasts).

```tsx
<ContentListProvider
  dataSource={{
    findItems: async (query) => {
      try {
        const response = await api.search({ query });
        return { total: response.total, hits: response.items };
      } catch (error) {
        // ContentListProvider will catch and display error state
        throw error;
      }
    },
    onFetchError: (error) => {
      toasts.addError(error, {
        title: 'Failed to load dashboards',
      });
    },
  }}
>
  <ContentListTable />
</ContentListProvider>
```

### Delete Errors

Handle errors in the `onDelete` callback. Re-throwing the error will keep items selected.

```tsx
<ContentListProvider
  actions={{
    selection: {
      onDelete: async (items) => {
        try {
          await api.delete(items.map(i => i.id));
          toasts.addSuccess(`Deleted ${items.length} items`);
        } catch (error) {
          toasts.addError(error, {
            title: 'Failed to delete items',
          });
          throw error; // Re-throw to keep items selected
        }
      },
    },
  }}
>
```

### Search Query Errors

Invalid search queries are handled automatically. Provide `onQueryError` for custom handling.

```tsx
<Toolbar.SearchBox 
  forbiddenChars="()[]{}<>"
  onQueryError={(error) => {
    toasts.addWarning(error.message);
  }}
/>
```

---

## Performance Best Practices

### 1. Memoize Callbacks

Always memoize `findItems` and other callbacks to prevent unnecessary re-renders:

```tsx
const findItems = useCallback(async (query: string) => {
  const response = await api.search({ query, size: limit });
  return { total: response.total, hits: response.items };
}, [limit]); // Only recreate if dependencies change
```

### 2. Large Lists (1000+ items)

For lists with many items, consider:

**Server-side pagination:**
```tsx
const findItems = useCallback(async (query, refs, options) => {
  // Use pageIndex and pageSize for server-side pagination
  const { pageIndex, pageSize } = getPaginationState();
  return await api.search({
    query,
    from: pageIndex * pageSize,
    size: pageSize,
  });
}, []);
```

**Client-side optimizations:**
- Debounced search (default: 300ms, configurable via `search={{ debounceMs: 500 }}`)
- Virtual scrolling for very large tables (consider custom table renderer)
- Lazy loading of expensive column renderers

### 3. Optimize Column Rendering

Use memoized render functions for expensive custom columns:

```tsx
const { Column } = ContentListTable;

// Memoize expensive render functions
const renderPreview = useCallback(
  (item) => <ExpensivePreviewComponent item={item} />,
  []
);

<ContentListTable>
  <Column.Name />
  <Column
    id="preview"
    name="Preview"
    render={renderPreview}
  />
  <Column.Actions />
</ContentListTable>
```

### 4. Bundle Size Optimization

Import only what you need for optimal tree-shaking:

```tsx
// Imports everything (~600KB)
import { ContentListProvider, ContentList, Toolbar, Filters, Footer } from '@kbn/content-list';

// Imports only what you use (~200KB for embedded usage)
import { ContentListProvider } from '@kbn/content-list-provider';
import { ContentListTable } from '@kbn/content-list-table';
```

---

## Testing Your Listing

### Unit Testing with React Testing Library

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentListProvider, ContentList } from '@kbn/content-list';

describe('DashboardListing', () => {
  it('renders items from dataSource', async () => {
    const mockFindItems = jest.fn().mockResolvedValue({
      total: 2,
      hits: [
        { id: '1', attributes: { title: 'Dashboard 1' } },
        { id: '2', attributes: { title: 'Dashboard 2' } },
      ],
    });
    
    render(
      <ContentListProvider
        entityName="dashboard"
        entityNamePlural="dashboards"
        dataSource={{ findItems: mockFindItems }}
      >
        <ContentListTable />
      </ContentListProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard 1')).toBeInTheDocument();
      expect(screen.getByText('Dashboard 2')).toBeInTheDocument();
    });
  });
  
  it('calls onDelete when deleting items', async () => {
    const mockOnDelete = jest.fn().mockResolvedValue(undefined);
    const mockFindItems = jest.fn().mockResolvedValue({
      total: 1,
      hits: [{ id: '1', attributes: { title: 'Dashboard 1' } }],
    });
    
    render(
      <ContentListProvider
        entityName="dashboard"
        entityNamePlural="dashboards"
        dataSource={{ findItems: mockFindItems }}
        actions={{
          selection: { onDelete: mockOnDelete },
        }}
      >
        <ContentListToolbar />
        <ContentListTable />
      </ContentListProvider>
    );
    
    // Wait for items to load
    await waitFor(() => screen.getByText('Dashboard 1'));
    
    // Select item
    const checkbox = screen.getAllByRole('checkbox')[1]; // First is "select all"
    await userEvent.click(checkbox);
    
    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete 1 dashboard/i });
    await userEvent.click(confirmButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith([
      expect.objectContaining({ id: '1' })
    ]);
  });
  
  it('filters items by search query', async () => {
    const mockFindItems = jest.fn().mockResolvedValue({
      total: 1,
      hits: [{ id: '1', attributes: { title: 'Test Dashboard' } }],
    });
    
    render(
      <ContentListProvider
        entityName="dashboard"
        entityNamePlural="dashboards"
        dataSource={{ findItems: mockFindItems }}
        search={true}
      >
        <ContentListToolbar />
        <ContentListTable />
      </ContentListProvider>
    );
    
    const searchInput = screen.getByRole('searchbox');
    await userEvent.type(searchInput, 'test');
    
    // Wait for debounced search
    await waitFor(() => {
      expect(mockFindItems).toHaveBeenCalledWith(
        'test',
        expect.anything(),
        expect.anything()
      );
    }, { timeout: 500 });
  });
});
```

### Testing Custom Components

When using hooks to build custom components, test them within a provider:

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { ContentListProvider, useContentListState } from '@kbn/content-list';

describe('useContentListState', () => {
  it('provides items from dataSource', async () => {
    const mockFindItems = jest.fn().mockResolvedValue({
      total: 2,
      hits: [{ id: '1' }, { id: '2' }],
    });
    
    const wrapper = ({ children }) => (
      <ContentListProvider
        entityName="test"
        entityNamePlural="tests"
        dataSource={{ findItems: mockFindItems }}
      >
        {children}
      </ContentListProvider>
    );
    
    const { result } = renderHook(() => useContentListState(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

### Testing with Mock Data

Create reusable test utilities:

```tsx
// test-utils.tsx
export function createMockDataSource<T>(items: T[]) {
  return {
    findItems: jest.fn().mockResolvedValue({
      total: items.length,
      hits: items,
    }),
  };
}

export function renderWithProvider(ui: React.ReactElement, options = {}) {
  const mockFindItems = jest.fn().mockResolvedValue({ total: 0, hits: [] });
  
  return render(
    <ContentListProvider
      entityName="test"
      entityNamePlural="tests"
      dataSource={{ findItems: mockFindItems }}
      {...options}
    >
      {ui}
    </ContentListProvider>
  );
}

// Usage:
it('renders custom content', () => {
  renderWithProvider(<MyCustomComponent />, {
    search: true,
    sorting: true,
  });
  // ... assertions
});
```

---

## Accessibility

All components follow WCAG 2.1 AA standards. Additional considerations:

### Keyboard Navigation

- **Tab** - Navigate through interactive elements
- **Enter/Space** - Activate buttons and links
- **Arrow keys** - Navigate table rows (when focused)
- **Escape** - Close modals and popovers

### Screen Reader Support

Provide meaningful labels for custom content:

```tsx
const { Column, Action } = ContentListTable;

<ContentListTable>
  <Column.Name />
  <Column.Actions>
    <Action.Custom
      id="clone"
      label="Clone"
      iconType="copy"
      handler={(item) => clone(item)}
      aria-label="Clone item"
    />
  </Column.Actions>
</ContentListTable>
```

### Focus Management

The delete modal automatically manages focus:
- Opens with focus on "Cancel" button (safe default)
- Returns focus to trigger element on close
- Traps focus within modal

### Custom Announcements

For custom components, use ARIA live regions for dynamic updates:

```tsx
function CustomStats() {
  const { totalItems, filteredItems } = useContentListState();
  
  return (
    <div aria-live="polite" aria-atomic="true">
      Showing {filteredItems} of {totalItems} items
    </div>
  );
}
```

---

## Component Namespacing Strategy

All components use **contextual namespacing** to balance scannability with clear hierarchy:

```tsx
// Destructure namespaces from the table component
const { Column, Action } = ContentListTable;

// Column and Action namespaces provide clear hierarchy
<ContentListTable>
  <Column.Name showDescription showTags />
  <Column.UpdatedAt />
  <Column.Actions>
    <Action.Edit />
    <Action.Delete />
  </Column.Actions>
</ContentListTable>
```

**Benefits:**
- **Visual hierarchy** - JSX nesting mirrors conceptual relationships
- **Scannability** - Quickly identify all `Column.*` or `Action.*` components
- **Suggests correct usage** - `Action.Edit` strongly implies it belongs in a `Column.Actions`
- **Familiar pattern** - Matches Radix UI, Headless UI, and other modern React libraries

**Import structure:**
```tsx
// Import from focused packages for optimal tree-shaking
import { ContentListProvider } from '@kbn/content-list-provider';
import { ContentListTable } from '@kbn/content-list-table';
import { ContentList } from '@kbn/content-management/content_list';
import { Toolbar } from '@kbn/content-management/toolbar';
```

---

## Convenience Components

For common use cases, a `ContentList` convenience component is under consideration that wraps the standard pattern of Provider + Table + Toolbar + Footer. See [PLAN.md](./PLAN.md#contentlist-convenience-component) for the proposed design.

This higher-level component would provide an even simpler API for the 80% use case while maintaining full flexibility through the individual components documented in this specification.

**API Consistency Note:** The `ContentList` convenience component maintains the same action structure as `ContentListProvider` for consistency. Both use `actions.onCreate`, `item.actions.*`, and `actions.selection.*` to separate callbacks by execution context. This provides a unified mental model across both the composable provider and the convenience wrapper.

---

## See Also

- **[LISTING_PAGE.md](./LISTING_PAGE.md)** - Complete documentation for `ContentListPage` wrapper component
- **[reference/CURRENT_USAGE.md](./reference/CURRENT_USAGE.md)** - Analysis of the existing `TableListView` implementation
- **[reference/ANALYSIS_DEFAULTS.md](./reference/ANALYSIS_DEFAULTS.md)** - Feature defaults and uiSettings integration strategy
- **[PLAN.md](./PLAN.md)** - Detailed implementation plan with package architecture

