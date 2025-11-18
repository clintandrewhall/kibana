# ContentListProvider Implementation Guide

## Document Purpose

This document provides detailed implementation guidance for the `ContentListProvider` and its related state management system. This is the foundational piece that manages all shared state and provides context to UI components.

**Related Documents:**
- **[PLAN.md](./PLAN.md)** - Overall implementation plan
- **[LISTING_COMPONENT.md](./LISTING_COMPONENT.md)** - UI component specifications
- **[LISTING_PAGE.md](./LISTING_PAGE.md)** - Page wrapper component
- **[proposals/PROPOSAL_CONTENT_LIST_PAGE.md](./proposals/PROPOSAL_CONTENT_LIST_PAGE.md)** - Architecture rationale

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Context & Provider Shell](#context--provider-shell)
3. [State Reducer](#state-reducer)
4. [Data Fetching Hook](#data-fetching-hook)
5. [Consumer Hooks](#consumer-hooks)
6. [Testing Strategy](#testing-strategy)
7. [Implementation Checklist](#implementation-checklist)

---

## Architecture Overview

The `ContentListProvider` is the heart of the system. It:
- **Manages all shared state** - items, filters, sorting, pagination, selection
- **Provides context to child components** - via React Context API
- **Exposes hooks for custom components** - `useContentListState`, `useContentListActions`, `useContentListSelection`
- **Handles data fetching and URL state synchronization** - automatic refetch on parameter changes

### Generic Type Parameter & Transform Function

All provider components, hooks, and types accept a generic type parameter `<T>` representing the **raw item type from your datasource**:

```typescript
// Example: Listing dashboards with Elasticsearch SavedObject format
interface Dashboard {
  id: string;
  attributes: {
    title: string;
    description: string;
  };
  updatedAt: string;
}

<ContentListProvider<Dashboard>
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{
    findItems: fetchDashboards,
    // No transform needed - uses default for ES format
  }}
>
  {children}
</ContentListProvider>
```

#### Transform Function: Decoupling Datasource from Rendering

The `DataSourceConfig` includes a `transform` property that converts raw datasource items (type `T`) into the standardized `ContentListItem` format used for rendering. This **decouples rendering logic from datasource structure**. The transform is part of the datasource config because it describes how to interpret the data that specific datasource returns.

**Type Safety:**
TypeScript enforces transform requirements based on the datasource type:
- **If `T extends UserContentCommonSchema`**: `transform` is **optional** (uses `defaultTransform` for Elasticsearch SavedObjects)
- **If `T` is a custom type**: `transform` is **REQUIRED** (compile-time error if missing)

The provider defaults to `UserContentCommonSchema` when no type parameter is specified.

**Default Transform (Elasticsearch SavedObject format):**
If you don't provide a `transform` and your type extends `UserContentCommonSchema`, the provider uses `defaultTransform` which expects Elasticsearch SavedObject structure (id, type, attributes, etc.).

**Custom Transform (Required for Custom Types):**
For datasources with custom structures that don't extend `UserContentCommonSchema`, you must provide a transform:

```typescript
interface CustomApiItem {
  uuid: string;
  name: string;
  lastModified: number;
}

const customTransform: TransformFunction<CustomApiItem> = (item) => ({
  id: item.uuid,
  title: item.name,
  updatedAt: new Date(item.lastModified),
});

<ContentListProvider<CustomApiItem>
  entityName="report"
  entityNamePlural="reports"
  dataSource={{
    findItems: fetchCustomItems,
    transform: customTransform,  // Convert API format to ContentListItem
  }}
>
  {children}
</ContentListProvider>
```

**Key Benefits:**
- **State Management Simplified**: Only `ContentListItem[]` stored in state, not raw type `T`
- **Rendering Consistency**: All UI components work with the same standardized interface
- **Backend Flexibility**: Support any API structure without changing rendering components
- **Type Safety**: Full TypeScript support with the generic `<T>` for your datasource type

**Clean Separation of Concerns:**

```
┌─────────────────────────────────────────────┐
│         Datasource Layer (Generic T)         │
│  - DataSourceConfig<T>                       │
│  - findItems returns T[]                     │
│  - transform: T => ContentListItem           │
└──────────────────┬──────────────────────────┘
                   │ Transform boundary
                   ▼
┌─────────────────────────────────────────────┐
│      UI Layer (ContentListItem only)         │
│  - State stores ContentListItem[]            │
│  - All callbacks use ContentListItem         │
│  - No generics in component code             │
└─────────────────────────────────────────────┘
```

See [RECIPES.md](./RECIPES.md#transform-function-examples) for detailed transform examples.

### Key Design Principles

1. **Transform-Based Architecture** - Generic `<T>` only at datasource boundary; all UI works with standardized `ContentListItem`
2. **Type-Safe Transform Requirements** - TypeScript enforces transform function when needed based on datasource type
3. **Features Enabled by Default** - Search, sorting, filtering, and pagination enabled with sensible defaults; set to `false` to disable
4. **State Nested, Config Flat** - The context value keeps dynamic `state` nested for clarity, while config properties are at the top-level for easier destructuring
5. **Shared Base Configuration** - `ContentListConfig<T>` interface shared between props and context
6. **Actions Disabled When Read-Only** - When `isReadOnly={true}`, actions are undefined to prevent accidental calls
7. **Separation of Concerns** - Separate hooks for state reading, mutations, and selection management

### Transform Architecture Details

#### Why Transform in DataSourceConfig?

The `transform` property lives in `DataSourceConfig` (not as a separate prop) because it describes how to interpret data from that specific datasource. This keeps the datasource self-contained and cohesive:

```typescript
const dataSource: DataSourceConfig<CustomType> = {
  findItems: fetchCustomItems,
  transform: (item) => ({
    id: item.uuid,
    title: item.name,
    // ... convert to ContentListItem
  }),
};
```

#### Generic `<T>` Usage Strategy

The generic type parameter `<T>` appears only where necessary, with `UserContentCommonSchema` as the default:

**Has Generic `<T>` (defaults to `UserContentCommonSchema`):**
- `ContentListProvider<T = UserContentCommonSchema>` - Needs to know datasource type
- `ContentListProviderProps<T = UserContentCommonSchema>` - Provider props interface
- `ContentListContextValue<T = UserContentCommonSchema>` - Contains DataSourceConfig
- `ContentListConfig<T = UserContentCommonSchema>` - Shared base configuration
- `DataSourceConfig<T>` - Works with raw datasource type (conditionally requires transform)
- `TransformFunction<T>` - Converts from `T` to `ContentListItem`
- `defaultTransform<T extends UserContentCommonSchema>` - Constrained to ES format

**No Generic (Works with `ContentListItem`):**
- `ContentListState` - Only stores `ContentListItem[]`
- `ContentListAction` - Only operates on `ContentListItem[]`
- `ItemConfig` - Callbacks receive `ContentListItem`
- `ActionsConfig` - Selection works with `ContentListItem[]`
- `SelectionActions` - Bulk actions receive `ContentListItem[]`
- `AnalyticsConfig` - Analytics track `ContentListItem`
- `PreviewConfig` - Preview renders `ContentListItem`

#### Type Safety Benefits

**Before (with generics everywhere):**
```typescript
// Consumer code was littered with generics
const MyTable = <T,>() => {
  const { state } = useContentListState<T>();
  const { toggleSelection } = useContentListSelection<T>();
  // ... lots of <T> everywhere
};
```

**After (clean, no generics needed):**
```typescript
// Consumer code is clean and simple
const MyTable = () => {
  const { state } = useContentListState();
  const { toggleSelection } = useContentListSelection();
  // All items are ContentListItem, no generics needed!
};
```

### Package Structure

```
@kbn/content-list-provider/
├── src/
│   ├── content_list_provider.tsx    # Main provider component
│   ├── content_list_context.tsx     # Context definition
│   ├── reducer.ts                   # State reducer
│   ├── use_fetch_items.ts           # Data fetching hook
│   ├── use_content_list_state.ts    # State reading hook
│   ├── use_content_list_actions.ts  # State mutation hook
│   ├── use_content_list_selection.ts # Selection management hook
│   ├── types.ts                     # TypeScript types
│   └── index.ts                     # Public exports
├── tsconfig.json
├── package.json
└── README.md
```

**Related Packages:**
- **`@kbn/content-list-services`** (Phase 3) - Query parser and other pure utilities used by the provider

---

## Context & Provider Shell

**File:** `@kbn/content-list-provider/src/content_list_provider.tsx`

### Type Definitions

```typescript
import React, { createContext, useReducer, useCallback, useMemo } from 'react';
import type { ContentListProviderProps } from './types';

/**
 * Core state structure containing all dynamic data
 * Items are stored as ContentListItem (standardized format) after transformation
 */
interface ContentListState {
  // Data state
  items: ContentListItem[];  // Transformed items ready for rendering
  totalItems: number;
  isLoading: boolean;
  error?: Error;
  
  // Search state
  search: {
    query: string;
    error?: Error;
  };
  
  // Filter state - known filters + custom key-value pairs
  activeFilters: {
    tags?: string[];
    users?: string[];
    favoritesOnly?: boolean;
    [key: string]: unknown; // Allow any additional custom filters
  };
  
  // Sort state
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  
  // Pagination state
  page: {
    index: number;
    size: number;
  };
  
  // Selection state
  selectedItems: Set<string>;
}

/**
 * Per-item configuration for link behavior and actions
 * Works with ContentListItem (standardized format)
 */
interface ItemConfig {
  // Link property - href for the item
  getHref?: (item: ContentListItem) => string;
  
  // Item actions - all interactive behaviors for individual items
  actions?: {
    onClick?: (item: ContentListItem) => void;      // Primary click/tap behavior
    onEdit?: (item: ContentListItem) => void;       // Edit action (pencil icon)
    onDuplicate?: (item: ContentListItem) => void;  // Duplicate action
    onExport?: (item: ContentListItem) => void;     // Export action
    onDelete?: (item: ContentListItem) => void;     // Delete action (danger color)
    [key: string]: ((item: ContentListItem) => void) | undefined;  // Extensible for custom actions
  };
}

/**
 * Selection actions - enforces at least one handler must be defined
 * This prevents enabling selection UI without any actions
 * Works with ContentListItem[] (standardized format)
 */
type SelectionActions = {
  onDelete?: (items: ContentListItem[]) => void;
  onExport?: (items: ContentListItem[]) => void;
  [key: string]: ((items: ContentListItem[]) => void) | undefined;
} & (
  | { onDelete: (items: ContentListItem[]) => void }      // Must have onDelete, OR
  | { onExport: (items: ContentListItem[]) => void }      // Must have onExport, OR
  | { [key: string]: (items: ContentListItem[]) => void } // Must have at least one custom action
);

/**
 * Global actions configuration
 * Works with ContentListItem (standardized format)
 */
interface ActionsConfig {
  onCreate?: () => void;                     // Create new item action
  selection?: SelectionActions;              // Bulk selection actions (type-safe)
}

/**
 * Context value structure
 * - State is nested for clarity
 * - Config properties are flat for easy destructuring
 * @template T The raw item type from datasource (used for callbacks)
 */
interface ContentListContextValue<T = UserContentCommonSchema> {
  // Dynamic state nested (items are always ContentListItem after transformation)
  state: ContentListState;
  
  // Config properties at top-level for easy access
  entityName: string;
  entityNamePlural: string;
  dataSource: DataSourceConfig<T>; // Contains transform function
  search: false | true | SearchConfig;      // Always defined (defaults to true)
  sorting: false | true | SortingConfig;    // Always defined (defaults to true)
  filtering: false | true | FilteringConfig; // Always defined (defaults to true)
  pagination: false | true | PaginationConfig; // Always defined (defaults to true)
  urlState?: true | URLStateConfig;
  item?: ItemConfig;  // Per-item configuration (href, actions)
  actions?: ActionsConfig;  // undefined when isReadOnly=true
  recentlyAccessed?: RecentlyAccessedConfig;
  analytics?: AnalyticsConfig;
  preview?: PreviewConfig;
  isReadOnly?: boolean;
  
  // State updater
  dispatch: React.Dispatch<ContentListAction>;
  refetch: () => void;
}
```

### Context Creation

```typescript
export const ContentListContext = createContext<ContentListContextValue<unknown> | null>(null);
```

### Provider Implementation

```typescript
export function ContentListProvider<T = UserContentCommonSchema>({
  children,
  entityName,
  entityNamePlural,
  dataSource,
  search,      // Optional: defaults to true
  sorting,     // Optional: defaults to true
  filtering,   // Optional: defaults to true
  pagination,  // Optional: defaults to true
  urlState,
  item,
  actions,
  recentlyAccessed,
  analytics,
  preview,
  isReadOnly,
}: ContentListProviderProps<T>) {
  // Apply defaults: undefined becomes true for core features
  const searchConfig = search ?? true;
  const sortingConfig = sorting ?? true;
  const filteringConfig = filtering ?? true;
  const paginationConfig = pagination ?? true;
  
  // Use provided transform or default to ES query format
  const transformFn = dataSource.transform || defaultTransform;
  
  // Initial state with sensible defaults
  const initialState: ContentListState = {
    items: [],
    totalItems: 0,
    isLoading: false,
    search: {
      query: '',
      error: undefined,
    },
    activeFilters: {},
    sort: {
      field: 'attributes.title',
      direction: 'asc',
    },
    page: {
      index: 0,
      size: 20, // Will be overridden by pagination config
    },
    selectedItems: new Set(),
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // TODO: Integrate useFetchItems hook (see Data Fetching section)
  // TODO: Integrate URL state sync (Phase 3)
  
  // Context value: state nested, config properties at top-level
  const contextValue = useMemo(() => ({
    // State nested for clarity
    state,
    
    // Config properties (with defaults applied)
    search: searchConfig,
    sorting: sortingConfig,
    filtering: filteringConfig,
    pagination: paginationConfig,
    
    // Config properties at top-level for easy access
    entityName,
    entityNamePlural,
    dataSource,
    search,
    sorting,
    filtering,
    pagination,
    urlState,
    item,
    actions: isReadOnly ? undefined : actions,  // Disable actions when read-only
    recentlyAccessed,
    analytics,
    preview,
    isReadOnly,
    
    // State updater
    dispatch,
  }), [
    state,
    entityName,
    entityNamePlural,
    dataSource,
    search,
    sorting,
    filtering,
    pagination,
    urlState,
    item,
    actions,
    recentlyAccessed,
    analytics,
    preview,
    isReadOnly,
  ]);
  
  return (
    <ContentListContext.Provider value={contextValue}>
      {children}
    </ContentListContext.Provider>
  );
}
```

### Design Decisions

#### 1. State Nested, Config Flat

**Rationale:** This structure provides optimal developer experience:

```typescript
// Easy to destructure what you need
const { state, entityName, dataSource } = useContentListState();
const { items, isLoading } = state;

// vs. if everything was nested under config:
const { state, config } = useContentListState();
const { items, isLoading } = state;
const { entityName, dataSource } = config; // Extra destructuring step
```

#### 2. Actions Disabled When Read-Only

**Rationale:** Prevents accidental action calls and provides type safety:

```typescript
// When isReadOnly=true, actions is undefined
if (actions?.onCreate) {
  // This block won't execute in read-only mode
  <button onClick={actions.onCreate}>Create</button>
}
```

#### 3. Smart Defaults Applied Later

**Rationale:** The provider remains simple and delegates smart defaults to consuming components:

```typescript
// Provider accepts raw boolean
<ContentListProvider search={true} />

// Components apply smart defaults based on context
function SearchBox() {
  const { search, entityName } = useContentListState();
  const placeholder = typeof search === 'object' 
    ? search.placeholder 
    : `Search ${entityName}s...`; // Smart default
}
```

### Testing

**Unit Tests:**

```typescript
describe('ContentListProvider', () => {
  it('provides context to children', () => {
    const { result } = renderHook(() => useContentListState(), {
      wrapper: ({ children }) => (
        <ContentListProvider
          entityName="dashboard"
          entityNamePlural="dashboards"
          dataSource={mockDataSource}
        >
          {children}
        </ContentListProvider>
      ),
    });
    
    expect(result.current.entityName).toBe('dashboard');
  });
  
  it('disables actions when read-only', () => {
    const { result } = renderHook(() => useContentListState(), {
      wrapper: ({ children }) => (
        <ContentListProvider
          entityName="dashboard"
          entityNamePlural="dashboards"
          dataSource={mockDataSource}
          isReadOnly={true}
          actions={{ onCreate: jest.fn() }}
        >
          {children}
        </ContentListProvider>
      ),
    });
    
    expect(result.current.actions).toBeUndefined();
  });
  
  it('memoizes context value correctly', () => {
    // Test that re-renders with same props don't create new context value
  });
});
```

---

## State Reducer

**File:** `@kbn/content-list-provider/src/reducer.ts`

### Action Types

```typescript
import type { ContentListState } from './types';

/**
 * Union type of all possible state actions
 * @template T The item type being listed (e.g., Dashboard, Visualization, SavedSearch)
 */
export type ContentListAction<T = unknown> =
  // Data actions
  | { type: 'SET_ITEMS'; payload: { items: T[]; totalItems: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | undefined }
  
  // Search actions
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_ERROR'; payload: Error | undefined }
  
  // Filter actions
  | { type: 'SET_FILTERS'; payload: ContentListState['activeFilters'] }
  
  // Sort actions
  | { type: 'SET_SORT'; payload: { field: string; direction: 'asc' | 'desc' } }
  
  // Pagination actions
  | { type: 'SET_PAGE'; payload: { index: number; size: number } }
  
  // Selection actions
  | { type: 'SET_SELECTION'; payload: Set<string> }
  | { type: 'TOGGLE_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SELECT_ALL' };
```

### Reducer Implementation

```typescript
export function reducer(
  state: ContentListState,
  action: ContentListAction
): ContentListState {
  switch (action.type) {
    // Data mutations
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload.items as T[],
        totalItems: action.payload.totalItems,
        isLoading: false,
        error: undefined,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    // Search mutations
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        search: { ...state.search, query: action.payload },
        page: { ...state.page, index: 0 }, // Reset to first page on search
      };

    case 'SET_SEARCH_ERROR':
      return { 
        ...state, 
        search: { ...state.search, error: action.payload },
      };

    // Filter mutations
    case 'SET_FILTERS':
      return {
        ...state,
        activeFilters: action.payload,
        page: { ...state.page, index: 0 }, // Reset to first page on filter change
      };

    // Sort mutations
    case 'SET_SORT':
      return {
        ...state,
        sort: {
          field: action.payload.field,
          direction: action.payload.direction,
        },
        page: { ...state.page, index: 0 }, // Reset to first page on sort change
      };

    // Pagination mutations
    case 'SET_PAGE':
      return {
        ...state,
        page: {
          index: action.payload.index,
          size: action.payload.size,
        },
      };

    // Selection mutations
    case 'SET_SELECTION':
      return { ...state, selectedItems: action.payload };

    case 'TOGGLE_SELECTION': {
      const newSelection = new Set(state.selectedItems);
      if (newSelection.has(action.payload)) {
        newSelection.delete(action.payload);
      } else {
        newSelection.add(action.payload);
      }
      return { ...state, selectedItems: newSelection };
    }

    case 'CLEAR_SELECTION':
      return { ...state, selectedItems: new Set() };

    case 'SELECT_ALL': {
      const allIds = new Set(state.items.map((item: any) => item.id));
      return { ...state, selectedItems: allIds };
    }

    default:
      return state;
  }
}
```

### Design Decisions

#### 1. Page Reset on Filter/Sort/Search

**Rationale:** Automatically reset to first page when search, filters, or sorting changes. This matches user expectations and prevents "empty page" edge cases.

**Example:** If a user is on page 5 and changes the search query, they expect to see results from the beginning, not page 5 of the new results.

#### 2. Selection Uses Set

**Rationale:** Efficient lookups (`O(1)`) and uniqueness guarantees.

```typescript
// Fast membership test
const isSelected = selectedItems.has(itemId);

// Automatic deduplication
const selection = new Set(['id1', 'id1', 'id2']); // Only contains 'id1', 'id2'
```

#### 3. Immutable Updates

**Rationale:** All state updates create new objects, ensuring React re-renders correctly.

```typescript
// ✅ Good - creates new object
return { ...state, isLoading: false };

// ❌ Bad - mutates existing state
state.isLoading = false;
return state;
```

### Testing

```typescript
describe('reducer', () => {
  it('sets items and clears loading state', () => {
    const state = { items: [], isLoading: true };
    const action = {
      type: 'SET_ITEMS',
      payload: { items: [{ id: '1' }], totalItems: 1 },
    };
    
    const newState = reducer(state, action);
    
    expect(newState.items).toHaveLength(1);
    expect(newState.isLoading).toBe(false);
  });
  
  it('resets page index on search', () => {
    const state = { page: { index: 5, size: 20 }, search: { query: '', error: undefined } };
    const action = { type: 'SET_SEARCH_QUERY', payload: 'test' };
    
    const newState = reducer(state, action);
    
    expect(newState.page.index).toBe(0);
    expect(newState.search.query).toBe('test');
  });
  
  it('toggles selection correctly', () => {
    const state = { selectedItems: new Set(['1', '2']) };
    
    // Toggle off
    const newState1 = reducer(state, { type: 'TOGGLE_SELECTION', payload: '1' });
    expect(newState1.selectedItems.has('1')).toBe(false);
    
    // Toggle on
    const newState2 = reducer(state, { type: 'TOGGLE_SELECTION', payload: '3' });
    expect(newState2.selectedItems.has('3')).toBe(true);
  });
});
```

---

## Data Fetching Hook

**File:** `@kbn/content-list-provider/src/use_fetch_items.ts`

### Implementation

```typescript
import { useEffect, useCallback } from 'react';
import type { DataSourceConfig } from './types';
import type { ContentListState } from './types';
import type { ContentListAction } from './reducer';

interface UseFetchItemsParams<T> {
  dataSource: DataSourceConfig<T>;
  state: ContentListState;
  dispatch: React.Dispatch<ContentListAction>;
  transform: TransformFunction<T>;
}

export function useFetchItems<T>({
  dataSource,
  state,
  dispatch,
  transform,
}: UseFetchItemsParams<T>) {
  const { search, activeFilters, sort, page } = state;

  const fetchItems = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await dataSource.findItems({
        searchQuery: search.query,
        filters: activeFilters,
        sort: { field: sort.field, direction: sort.direction },
        page: { index: page.index, size: page.size },
      });

      // Apply transform to convert raw items to ContentListItem
      const transformedItems = result.items.map(transform);

      dispatch({
        type: 'SET_ITEMS',
        payload: { items: transformedItems, totalItems: result.total },
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    }
  }, [
    dataSource,
    search.query,
    activeFilters,
    sort.field,
    sort.direction,
    page.index,
    page.size,
    dispatch,
    transform,
  ]);

  useEffect(() => {
    // Prevent race conditions: ignore stale requests
    let isCancelled = false;
    
    const fetchData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const result = await dataSource.findItems({
          searchQuery: search.query,
          filters: activeFilters,
          sort: { field: sort.field, direction: sort.direction },
          page: { index: page.index, size: page.size },
        });

        // Only update if this request is still valid
        if (!isCancelled) {
          // Apply transform to convert raw items to ContentListItem
          const transformedItems = result.items.map(transform);
          
          dispatch({
            type: 'SET_ITEMS',
            payload: { items: transformedItems, totalItems: result.total },
          });
        }
      } catch (error) {
        // Only update if this request is still valid
        if (!isCancelled) {
          dispatch({ type: 'SET_ERROR', payload: error as Error });
        }
      }
    };

    fetchData();

    // Cleanup: mark this request as cancelled if dependencies change
    return () => {
      isCancelled = true;
    };
  }, [
    dataSource,
    search.query,
    activeFilters,
    sort.field,
    sort.direction,
    page.index,
    page.size,
    dispatch,
    transform,
  ]);

  return { refetch: fetchItems };
}
```

### Design Decisions

#### 1. Auto-Fetch on Dependency Change

**Rationale:** The `useEffect` automatically triggers a fetch when any search/filter/sort/page parameter changes, providing a seamless user experience.

```typescript
// When user changes search query
dispatch({ type: 'SET_SEARCH_QUERY', payload: 'test' });
// → search.query dependency changes
// → fetchItems is recreated
// → useEffect runs
// → Data is fetched automatically
```

#### 2. Race Condition Prevention

**Rationale:** Uses an `isCancelled` flag to prevent stale data from overwriting newer results:

```typescript
// Scenario: User types quickly "abc" → "abcd"
// Request 1 starts for "abc"
// Request 2 starts for "abcd"
// Request 2 finishes first → state updated ✓
// Request 1 finishes later → isCancelled=true → ignored ✓

// Without this check:
// Request 1 would overwrite newer results from Request 2 ❌
```

**Why not AbortController?**
- Not all data sources support request cancellation
- `isCancelled` works with any async data source
- Can add AbortController support later as an enhancement

#### 3. Exposed Refetch Function

**Rationale:** Returns a `refetch` function for manual refresh scenarios:

```typescript
const { refetch } = useFetchItems(...);

// After item deletion
await deleteItem(itemId);
refetch(); // Manual refresh
```

**Note:** The `refetch` function does NOT use the `isCancelled` check, as manual refreshes should always complete even if the component unmounts.

#### 4. Centralized Loading/Error States

**Rationale:** Dispatches loading and error states consistently, ensuring UI components always have accurate state:

```typescript
// Loading starts
dispatch({ type: 'SET_LOADING', payload: true });

// Success clears loading + error
dispatch({ type: 'SET_ITEMS', ... }); // Sets isLoading: false, error: undefined

// Error clears loading
dispatch({ type: 'SET_ERROR', ... }); // Sets isLoading: false
```

### Integration with Provider

Update the `ContentListProvider` to use this hook:

```typescript
export function ContentListProvider<T>({ ... }: ContentListProviderProps<T>) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Integrate data fetching
  const { refetch } = useFetchItems({
    dataSource,
    state,
    dispatch,
  });
  
  // Add refetch to context value if needed for advanced use cases
  const contextValue = useMemo(() => ({
    state,
    ...configProps,
    dispatch,
    refetch, // Expose for manual refresh
  }), [...]);
  
  return <ContentListContext.Provider value={contextValue}>{children}</ContentListContext.Provider>;
}
```

### Testing

```typescript
describe('useFetchItems', () => {
  it('fetches items on mount', async () => {
    const mockDataSource = {
      findItems: jest.fn().mockResolvedValue({
        items: [{ id: '1' }],
        total: 1,
      }),
    };
    
    const dispatch = jest.fn();
    
    renderHook(() => useFetchItems({
      dataSource: mockDataSource,
      state: initialState,
      dispatch,
    }));
    
    await waitFor(() => {
      expect(mockDataSource.findItems).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_ITEMS',
        payload: { items: [{ id: '1' }], totalItems: 1 },
      });
    });
  });
  
  it('refetches when search query changes', async () => {
    const mockDataSource = { findItems: jest.fn() };
    const dispatch = jest.fn();
    
    const { rerender } = renderHook(
      ({ state }) => useFetchItems({ dataSource: mockDataSource, state, dispatch }),
      { initialProps: { state: { ...initialState, search: { query: '', error: undefined } } } }
    );
    
    // Change search query
    rerender({ state: { ...initialState, search: { query: 'test', error: undefined } } });
    
    await waitFor(() => {
      expect(mockDataSource.findItems).toHaveBeenCalledTimes(2);
    });
  });
});
```

---

## Consumer Hooks

### useContentListConfig

**File:** `@kbn/content-list-provider/src/state/hooks/use_content_list_state.ts`

```typescript
/**
 * Hook to access ContentList configuration
 * 
 * @throws Error if used outside ContentListProvider
 * @returns Configuration from the provider
 * 
 * @example
 * function MyComponent() {
 *   const { entityName, item, actions, isReadOnly } = useContentListConfig();
 *   
 *   return <div>{entityName}s</div>;
 * }
 */
export function useContentListConfig() {
  const config = useContentListConfig();
  return services;
}
```

### Feature-Based Hooks

The provider exports focused hooks for each feature area:

#### useContentListItems

Access items and data fetching state.

```typescript
export function useContentListItems() {
  const { state, refetch } = useContentListState();
  return {
    items: state.items,
    totalItems: state.totalItems,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
  };
}
```

#### useContentListSearch

Access and control search state.

```typescript
export function useContentListSearch() {
  const { state, dispatch } = useContentListState();
  
  const setSearch = useCallback(
    (query: string) => {
      dispatch({ type: CONTENT_LIST_ACTIONS.SET_SEARCH_QUERY, payload: query });
    },
    [dispatch]
  );

  const clearSearch = useCallback(() => {
    dispatch({ type: CONTENT_LIST_ACTIONS.CLEAR_SEARCH_QUERY });
  }, [dispatch]);

  return {
    query: state.search.query,
    error: state.search.error,
    setSearch,
    clearSearch,
  };
}
```

#### useContentListFilters

Access and control filter state.

```typescript
export function useContentListFilters() {
  const { state, dispatch } = useContentListState();

  const setFilters = useCallback(
    (filters: ActiveFilters) => {
      dispatch({ type: CONTENT_LIST_ACTIONS.SET_FILTERS, payload: filters });
    },
    [dispatch]
  );

  const clearFilters = useCallback(() => {
    dispatch({ type: CONTENT_LIST_ACTIONS.CLEAR_FILTERS });
  }, [dispatch]);

  return {
    activeFilters: state.activeFilters,
    setFilters,
    clearFilters,
  };
}
```

#### useContentListSort

Access and control sort state.

```typescript
export function useContentListSort() {
  const { state, dispatch } = useContentListState();

  const setSort = useCallback(
    (field: string, direction: 'asc' | 'desc') => {
      dispatch({
        type: CONTENT_LIST_ACTIONS.SET_SORT,
        payload: { field, direction },
      });
    },
    [dispatch]
  );

  return {
    field: state.sort.field,
    direction: state.sort.direction,
    setSort,
  };
}
```

#### useContentListPagination

Access and control pagination state.

```typescript
export function useContentListPagination() {
  const { state, dispatch } = useContentListState();
  const { totalItems } = state;
  const { index, size } = state.page;

  const setPage = useCallback(
    (newIndex: number, newSize?: number) => {
      dispatch({
        type: CONTENT_LIST_ACTIONS.SET_PAGE,
        payload: { index: newIndex, size: newSize ?? size },
      });
    },
    [dispatch, size]
  );

  return {
    index,
    size,
    totalPages: Math.ceil(totalItems / size),
    setPage,
  };
}
```

#### useContentListSelection

Manage item selection state.

```typescript
export function useContentListSelection() {
  const { state, dispatch } = useContentListState();
  const { selectedItems, items } = state;

  const setSelection = useCallback(
    (selection: Set<string>) => {
      dispatch({ type: CONTENT_LIST_ACTIONS.SET_SELECTION, payload: selection });
    },
    [dispatch]
  );

  const toggleSelection = useCallback(
    (id: string) => {
      dispatch({ type: CONTENT_LIST_ACTIONS.TOGGLE_SELECTION, payload: id });
    },
    [dispatch]
  );

  const clearSelection = useCallback(() => {
    dispatch({ type: CONTENT_LIST_ACTIONS.CLEAR_SELECTION });
  }, [dispatch]);

  const selectAll = useCallback(() => {
    dispatch({ type: CONTENT_LIST_ACTIONS.SELECT_ALL });
  }, [dispatch]);

  const isSelected = useCallback(
    (id: string) => selectedItems.has(id),
    [selectedItems]
  );

  const getSelectedItems = useCallback(() => {
    return items.filter((item) => selectedItems.has(item.id));
  }, [items, selectedItems]);

  return {
    selectedItems,
    selectedCount: selectedItems.size,
    setSelection,
    toggleSelection,
    clearSelection,
    selectAll,
    isSelected,
    getSelectedItems,
  };
}
```

### Design Decisions

#### 1. Separate Hooks by Concern

**Rationale:** Provides clear separation and allows components to import only what they need:

```typescript
// Component only needs to read state
function ItemCount() {
  const { state } = useContentListState();
  return <div>{state.totalItems} items</div>;
}

// Component only needs to mutate state
function SearchBox() {
  const { setSearch } = useContentListActions();
  return <input onChange={(e) => setSearch(e.target.value)} />;
}

// Component only needs selection
function BulkActions() {
  const { selectedCount, clearSelection } = useContentListSelection();
  return <button onClick={clearSelection}>{selectedCount} selected</button>;
}
```

#### 2. Memoized Callbacks

**Rationale:** All action creators are wrapped in `useCallback` to prevent unnecessary re-renders of components that use them:

```typescript
// Without useCallback, this would create a new function on every render
// causing any component that uses setSearch to re-render
const setSearch = useCallback(
  (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  },
  [dispatch] // Only recreate if dispatch changes (it won't)
);
```

#### 3. Type-Safe Context Access

**Rationale:** Throws helpful error if hooks are used outside provider:

```typescript
// ❌ This will throw a clear error
function BadComponent() {
  const { state } = useContentListState(); // Error: must be used within ContentListProvider
}

// ✅ This works
function GoodComponent() {
  return (
    <ContentListProvider {...props}>
      <ChildComponent /> {/* Can use hooks here */}
    </ContentListProvider>
  );
}
```

### Testing

```typescript
describe('Consumer Hooks', () => {
  describe('useContentListState', () => {
    it('throws error when used outside provider', () => {
      expect(() => {
        renderHook(() => useContentListState());
      }).toThrow('must be used within ContentListProvider');
    });
    
    it('returns context value', () => {
      const { result } = renderHook(() => useContentListState(), {
        wrapper: createProviderWrapper(),
      });
      
      expect(result.current.entityName).toBe('dashboard');
      expect(result.current.state).toBeDefined();
    });
  });
  
  describe('useContentListActions', () => {
    it('dispatches SET_SEARCH_QUERY action', () => {
      const dispatch = jest.fn();
      const { result } = renderHook(() => useContentListActions(), {
        wrapper: createProviderWrapper({ dispatch }),
      });
      
      act(() => {
        result.current.setSearch('test');
      });
      
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SEARCH_QUERY',
        payload: 'test',
      });
    });
  });
  
  describe('useContentListSelection', () => {
    it('returns selected count', () => {
      const { result } = renderHook(() => useContentListSelection(), {
        wrapper: createProviderWrapper({
          initialState: { selectedItems: new Set(['1', '2']) },
        }),
      });
      
      expect(result.current.selectedCount).toBe(2);
    });
    
    it('checks if item is selected', () => {
      const { result } = renderHook(() => useContentListSelection(), {
        wrapper: createProviderWrapper({
          initialState: { selectedItems: new Set(['1']) },
        }),
      });
      
      expect(result.current.isSelected('1')).toBe(true);
      expect(result.current.isSelected('2')).toBe(false);
    });
  });
});
```

---

## Testing Strategy

### Unit Tests

**Coverage Goals:** >90% for provider, reducer, and hooks

#### Provider Tests
- Context creation and value structure
- Read-only mode disables actions
- Memoization prevents unnecessary re-renders
- Integration with data fetching hook
- Error boundaries

#### Reducer Tests
- Each action type updates state correctly
- Page resets on search/filter/sort changes
- Selection operations (toggle, clear, select all)
- Immutability of state updates
- Edge cases (empty arrays, undefined values)

#### Hook Tests
- Error when used outside provider
- Correct action dispatching
- Callback memoization
- Type safety

### Integration Tests

Test full provider + hooks workflow:

```typescript
describe('ContentListProvider Integration', () => {
  it('fetches and displays items', async () => {
    const mockDataSource = {
      findItems: jest.fn().mockResolvedValue({
        items: [{ id: '1', attributes: { title: 'Test' } }],
        total: 1,
      }),
    };
    
    function TestComponent() {
      const { state } = useContentListState();
      return <div>{state.items.length} items</div>;
    }
    
    render(
      <ContentListProvider
        entityName="dashboard"
        entityNamePlural="dashboards"
        dataSource={mockDataSource}
      >
        <TestComponent />
      </ContentListProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('1 items')).toBeInTheDocument();
    });
  });
  
  it('handles search and pagination', async () => {
    // Test that search triggers refetch with correct parameters
    // Test that pagination changes trigger refetch
  });
});
```

### Storybook Stories

**File:** `@kbn/content-list-provider/src/content_list_provider.stories.tsx`

```typescript
import React from 'react';
import { ContentListProvider } from './content_list_provider';
import { useContentListState } from './use_content_list_state';

export default {
  title: 'ContentList/Provider',
  component: ContentListProvider,
};

const mockDataSource = {
  findItems: async () => ({
    items: [
      { id: '1', attributes: { title: 'Dashboard 1' }, updatedAt: new Date().toISOString() },
      { id: '2', attributes: { title: 'Dashboard 2' }, updatedAt: new Date().toISOString() },
    ],
    total: 2,
  }),
};

function StateDebugger() {
  const { state, entityName } = useContentListState();
  return (
    <div>
      <h3>State for {entityName}</h3>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}

export const Basic = () => (
  <ContentListProvider
    entityName="dashboard"
    entityNamePlural="dashboards"
    dataSource={mockDataSource}
    search={true}
    sorting={true}
    pagination={true}
  >
    <StateDebugger />
  </ContentListProvider>
);

export const ReadOnly = () => (
  <ContentListProvider
    entityName="dashboard"
    entityNamePlural="dashboards"
    dataSource={mockDataSource}
    isReadOnly={true}
    actions={{ onCreate: () => console.log('Create') }}
  >
    <StateDebugger />
  </ContentListProvider>
);
```

---

## Supporting Services (Phase 3)

While the core provider is implemented in Phase 1, some advanced features require additional services that will be implemented in Phase 3.

### Query Parser Service

**Package:** `@kbn/content-list-services`  
**File:** `src/query_parser.ts`

The query parser converts KQL-like search strings into structured query objects for filtering.

```typescript
/**
 * Structured query result from parsing search input
 */
export interface ParsedQuery {
  searchTerm: string;  // Free-text search terms
  filters: Array<{
    field: string;
    value: unknown;
    operator?: 'eq' | 'contains' | 'gt' | 'lt';
  }>;
  tags?: string[];     // Extracted tag filters
  exclude?: boolean;   // Whether this is an exclusion query
}

/**
 * Query parser for KQL-like syntax
 * 
 * Supports:
 * - Tag filtering: `tag:(important OR urgent)`
 * - Field filtering: `status:active`
 * - Exclusion: `-tag:archived`
 * - Free text search: everything else
 */
export class QueryParser {
  /**
   * Parse a search string into structured query
   * @param query - Search string to parse
   * @returns Structured query object
   */
  parse(query: string): ParsedQuery {
    // Implementation: tokenize, identify patterns, extract filters
  }
}
```

**Usage in Provider:**

```typescript
// In SearchBox component or provider
const queryParser = new QueryParser();
const parsed = queryParser.parse(userInput);

// Use parsed query for filtering
dispatch({
  type: 'SET_SEARCH_QUERY',
  payload: parsed.searchTerm,
});

if (parsed.tags) {
  dispatch({
    type: 'SET_FILTERS',
    payload: { ...activeFilters, tags: parsed.tags },
  });
}
```

---

## Implementation Checklist

### Phase 1.1: Context & Provider Shell
- [ ] Create `@kbn/content-list-provider` package structure
- [ ] Define `ContentListState` interface
- [ ] Define `ContentListContextValue` interface
- [ ] Implement `ContentListContext` creation
- [ ] Implement `ContentListProvider` component
- [ ] Add memoization for context value
- [ ] Handle read-only mode
- [ ] Write unit tests (>90% coverage)
- [ ] Create Storybook story

### Phase 1.2: State Reducer
- [ ] Define `ContentListAction` union type
- [ ] Implement `reducer` function
- [ ] Add data actions (SET_ITEMS, SET_LOADING, SET_ERROR)
- [ ] Add search actions (SET_SEARCH_QUERY, SET_SEARCH_ERROR)
- [ ] Add filter actions (SET_FILTERS)
- [ ] Add sort actions (SET_SORT)
- [ ] Add pagination actions (SET_PAGE)
- [ ] Add selection actions (TOGGLE_SELECTION, etc.)
- [ ] Implement page reset logic
- [ ] Write unit tests for each action (>95% coverage)

### Phase 1.3: Data Fetching Hook
- [ ] Implement `useFetchItems` hook
- [ ] Add automatic refetch on dependency changes
- [ ] Expose manual `refetch` function
- [ ] Integrate with provider
- [ ] Handle loading and error states
- [ ] Write unit tests (>90% coverage)

### Phase 1.4: Consumer Hooks
- [ ] Implement `useContentListState` hook
- [ ] Implement `useContentListActions` hook
- [ ] Implement `useContentListSelection` hook
- [ ] Add error handling for usage outside provider
- [ ] Memoize all callbacks
- [ ] Add JSDoc documentation
- [ ] Write unit tests (>90% coverage)

### Phase 1.5: Package Polish
- [ ] Export all public APIs from `index.ts`
- [ ] Write package README with usage examples
- [ ] Add TypeScript documentation comments
- [ ] Create comprehensive integration tests
- [ ] Update Storybook stories with all features

### Phase 1.6: Documentation
- [ ] Document all exported types
- [ ] Add usage examples for each hook
- [ ] Document integration patterns
- [ ] Add troubleshooting guide
- [ ] Link to related documentation

