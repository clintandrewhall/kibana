# Proposal: Creator Column Support for ContentList

**Status:** Draft  
**Date:** 2024-11-20  
**Author:** Content Management Team

## Overview

This proposal outlines the integration of user profile/creator functionality for the ContentList system, following the established patterns from the Favorites package. The goal is to provide 1:1 feature parity with Dashboard's `TableListViewTable` creator column handling while maintaining a clean, reusable architecture.

## Background

### Current State

- **Existing Package**: `@kbn/content-management-user-profiles` already exists with core functionality
- **ContentListItem**: Has `createdBy?: string` and `updatedBy?: string` fields
- **Dashboard**: Uses `TableListViewTable` with full user profile integration (avatars, tooltips, filtering)
- **User Profiles**: Already decoupled in a standalone package (good foundation!)

### Requirements

- Display user avatars with tooltips showing creator information
- Handle managed content with appropriate indicators
- Handle items without creator metadata gracefully
- Support creator filtering (include/exclude specific creators)
- Efficient user profile fetching with caching and batching
- Reusable across different content types
- Conditional column display (only show if items have creator data)

## Current Architecture Analysis

### Existing Package: `@kbn/content-management-user-profiles`

**Location:** `src/platform/packages/shared/content-management/user_profiles/`

**Current Structure:**
```
user_profiles/
  ├── index.ts
  ├── package.json
  ├── kibana.jsonc
  ├── README.md
  └── src/
      ├── components/
      │   ├── user_avatar_tip.tsx      # Avatar with tooltip
      │   ├── managed_avatar_tip.tsx   # Managed content indicator
      │   └── user_missing_tip.tsx     # No creator placeholder
      ├── queries.ts                    # React Query hooks
      ├── services.tsx                  # Context provider
      └── utils/
          └── batcher.ts                # Request batching
```

**Current Exports:**
```typescript
// Components
export { UserAvatarTip, NoCreatorTip, ManagedAvatarTip } from './src/components';

// Hooks
export { useUserProfile, useUserProfiles } from './src/queries';

// Context
export {
  UserProfilesKibanaProvider,
  UserProfilesProvider,
  useUserProfilesServices,
} from './src/services';
```

### How TableListViewTable Uses It

1. **Provider Setup** - Wraps table in `UserProfilesKibanaProvider`
2. **Column Creation** - Conditionally adds creator column when `createdByEnabled={true}`
3. **Cell Rendering** - Uses `UserAvatarTip`, `ManagedAvatarTip`, or `NoCreatorTip`
4. **Metadata Detection** - Checks if items have `createdBy` field before showing column

**Current Implementation Pattern:**
```typescript
// From table_list_view_table.tsx
if (hasCreatedByMetadata && createdByEnabled) {
  columns.push({
    field: 'createdBy',
    name: 'Creator',
    render: (field: string, record: { createdBy?: string; managed?: boolean }) =>
      record.createdBy ? (
        <UserAvatarTip uid={record.createdBy} />
      ) : record.managed ? (
        <ManagedAvatarTip entityName={entityName} />
      ) : (
        <NoCreatorTip iconType={'minus'} includeVersionTip={isKibanaVersioningEnabled} />
      ),
    width: '100px',
    align: 'center',
  });
}
```

## Proposed Enhancements

### Phase 1: Add Helper Utilities to Existing Package

Enhance `@kbn/content-management-user-profiles` with convenience utilities for easier integration.

#### 1.1 Column Helper Utilities

**New File:** `src/column_helpers.ts`

```typescript
import React from 'react';
import { UserAvatarTip } from './components/user_avatar_tip';
import { ManagedAvatarTip } from './components/managed_avatar_tip';
import { NoCreatorTip } from './components/user_missing_tip';

export interface CreatedByColumnOptions {
  entityName: string;
  isKibanaVersioningEnabled?: boolean;
}

export interface UpdatedByColumnOptions {
  entityName: string;
  isKibanaVersioningEnabled?: boolean;
}

/**
 * Helper function to render the createdBy cell
 * Can be used directly in table column definitions
 */
export function renderCreatedByCell(
  record: { createdBy?: string; managed?: boolean },
  options: CreatedByColumnOptions
): React.ReactElement | null {
  if (record.createdBy) {
    return <UserAvatarTip uid={record.createdBy} />;
  }
  
  if (record.managed) {
    return <ManagedAvatarTip entityName={options.entityName} />;
  }
  
  return (
    <NoCreatorTip 
      iconType="minus" 
      includeVersionTip={options.isKibanaVersioningEnabled} 
    />
  );
}

/**
 * Helper function to render the updatedBy cell
 */
export function renderUpdatedByCell(
  record: { updatedBy?: string; managed?: boolean },
  options: UpdatedByColumnOptions
): React.ReactElement | null {
  if (record.updatedBy) {
    return <UserAvatarTip uid={record.updatedBy} />;
  }
  
  if (record.managed) {
    return <ManagedAvatarTip entityName={options.entityName} />;
  }
  
  return (
    <NoCreatorTip 
      iconType="minus" 
      includeVersionTip={options.isKibanaVersioningEnabled} 
    />
  );
}

/**
 * Helper to check if items have createdBy metadata
 */
export function hasCreatedByMetadata(
  items: Array<{ createdBy?: string }>
): boolean {
  return items.some((item) => Boolean(item.createdBy));
}

/**
 * Helper to check if items have updatedBy metadata
 */
export function hasUpdatedByMetadata(
  items: Array<{ updatedBy?: string }>
): boolean {
  return items.some((item) => Boolean(item.updatedBy));
}

/**
 * Helper to extract unique creators from items
 */
export function getUniqueCreators(
  items: Array<{ createdBy?: string; managed?: boolean }>
): {
  allCreators: string[];
  hasUnattributedItems: boolean;
} {
  const creators = new Set<string>();
  let hasUnattributedItems = false;

  items.forEach((item) => {
    if (item.createdBy) {
      creators.add(item.createdBy);
    } else if (!item.managed) {
      hasUnattributedItems = true;
    }
  });

  return {
    allCreators: Array.from(creators),
    hasUnattributedItems,
  };
}

/**
 * Helper to extract unique updaters from items
 */
export function getUniqueUpdaters(
  items: Array<{ updatedBy?: string; managed?: boolean }>
): {
  allUpdaters: string[];
  hasUnattributedItems: boolean;
} {
  const updaters = new Set<string>();
  let hasUnattributedItems = false;

  items.forEach((item) => {
    if (item.updatedBy) {
      updaters.add(item.updatedBy);
    } else if (!item.managed) {
      hasUnattributedItems = true;
    }
  });

  return {
    allUpdaters: Array.from(updaters),
    hasUnattributedItems,
  };
}
```

#### 1.2 Filter Support Utilities

**New File:** `src/creator_filter.ts`

```typescript
import { useMemo } from 'react';

export const USER_FILTER_NULL_USER = '__null__';

export interface CreatorFilterOptions {
  items: Array<{ id: string; createdBy?: string; managed?: boolean }>;
  selectedCreators: string[];
}

export interface UpdaterFilterOptions {
  items: Array<{ id: string; updatedBy?: string; managed?: boolean }>;
  selectedUpdaters: string[];
}

/**
 * Hook to filter items by creator
 * Similar to favorites filtering pattern
 */
export function useCreatorFilter({ 
  items, 
  selectedCreators 
}: CreatorFilterOptions) {
  const filteredItems = useMemo(() => {
    if (selectedCreators.length === 0) {
      return items;
    }

    return items.filter((item) => {
      if (item.createdBy) {
        return selectedCreators.includes(item.createdBy);
      }
      
      if (item.managed) {
        return false;
      }
      
      // Item without creator
      return selectedCreators.includes(USER_FILTER_NULL_USER);
    });
  }, [items, selectedCreators]);

  return filteredItems;
}

/**
 * Hook to filter items by updater
 */
export function useUpdaterFilter({ 
  items, 
  selectedUpdaters 
}: UpdaterFilterOptions) {
  const filteredItems = useMemo(() => {
    if (selectedUpdaters.length === 0) {
      return items;
    }

    return items.filter((item) => {
      if (item.updatedBy) {
        return selectedUpdaters.includes(item.updatedBy);
      }
      
      if (item.managed) {
        return false;
      }
      
      // Item without updater
      return selectedUpdaters.includes(USER_FILTER_NULL_USER);
    });
  }, [items, selectedUpdaters]);

  return filteredItems;
}
```

#### 1.3 Update Package Exports

**Update:** `index.ts`

```typescript
// Existing exports
export { UserAvatarTip, NoUpdaterTip, NoCreatorTip, ManagedAvatarTip } from './src/components';
export { useUserProfile, useUserProfiles } from './src/queries';
export {
  UserProfilesKibanaProvider,
  type UserProfilesKibanaDependencies,
  UserProfilesProvider,
  type UserProfilesServices,
  useUserProfilesServices,
} from './src/services';

// NEW: Column helpers for easy integration
export {
  renderCreatedByCell,
  renderUpdatedByCell,
  hasCreatedByMetadata,
  hasUpdatedByMetadata,
  getUniqueCreators,
  getUniqueUpdaters,
  type CreatedByColumnOptions,
  type UpdatedByColumnOptions,
} from './src/column_helpers';

// NEW: Filter support
export {
  useCreatorFilter,
  useUpdaterFilter,
  USER_FILTER_NULL_USER,
  type CreatorFilterOptions,
  type UpdaterFilterOptions,
} from './src/creator_filter';
```

### Phase 2: ContentList Integration

#### 2.1 Update ContentListItem Type

The `ContentListItem` type already has the necessary fields:

```typescript
export interface ContentListItem {
  id: string;
  title: string;
  description?: string;
  type?: string;
  updatedAt?: Date;
  createdAt?: Date;
  updatedBy?: string;  // ✅ Already exists
  createdBy?: string;  // ✅ Already exists
  tags?: string[];
  [key: string]: unknown;
}
```

No changes needed!

#### 2.2 Add Creator Column to ContentListTable

**Example Integration:**

```typescript
// In ContentListTable component or consumer
import { useMemo } from 'react';
import { useContentList } from '@kbn/content-list-provider';
import {
  UserProfilesKibanaProvider,
  renderCreatedByCell,
  hasCreatedByMetadata,
} from '@kbn/content-management-user-profiles';

export function DashboardListingTable(props) {
  return (
    <UserProfilesKibanaProvider core={{ userProfile: coreServices.userProfile }}>
      <ContentListProvider
        entityName="dashboard"
        entityNamePlural="dashboards"
        dataSource={dashboardDataSource}
      >
        <DashboardTableWithCreator />
      </ContentListProvider>
    </UserProfilesKibanaProvider>
  );
}

function DashboardTableWithCreator() {
  const { items } = useContentList();
  const showCreatorColumn = hasCreatedByMetadata(items);

  const columns = useMemo(() => {
    const cols = [
      {
        id: 'title',
        name: 'Title',
        field: 'title',
        // ... title column config
      },
      // ... other columns
    ];

    if (showCreatorColumn) {
      cols.push({
        id: 'createdBy',
        name: 'Creator',
        field: 'createdBy',
        render: (field, record) =>
          renderCreatedByCell(record, {
            entityName: 'dashboard',
            isKibanaVersioningEnabled: !serverlessService,
          }),
        width: '100px',
        align: 'center',
      });
    }

    return cols;
  }, [showCreatorColumn]);

  return <ContentListTable columns={columns} />;
}
```

#### 2.3 Optional: Add Creator Filtering

```typescript
import { useCreatorFilter, getUniqueCreators } from '@kbn/content-management-user-profiles';

function DashboardListWithFiltering() {
  const { items } = useContentList();
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  
  const { allCreators, hasUnattributedItems } = getUniqueCreators(items);
  const filteredItems = useCreatorFilter({ items, selectedCreators });

  return (
    <>
      <CreatorFilterPanel
        allCreators={allCreators}
        selectedCreators={selectedCreators}
        onChange={setSelectedCreators}
        showNoCreatorOption={hasUnattributedItems}
      />
      <ContentListTable items={filteredItems} />
    </>
  );
}
```

### Phase 3: Documentation

#### 3.1 Enhanced README.md

Create comprehensive documentation for `@kbn/content-management-user-profiles`:

**File:** `user_profiles/README.md`

```markdown
# @kbn/content-management-user-profiles

Shared user profile components and utilities for content management.

## Overview

This package provides:
- **Context Provider**: Manages user profile services via React Context
- **Display Components**: Avatar components for creators, updaters, managed content
- **React Query Hooks**: Efficient user profile fetching with caching
- **Column Helpers**: Ready-to-use utilities for table columns
- **Filter Support**: Filter items by creator/updater

## Quick Start

### 1. Setup Provider

Wrap your application with the provider:

```tsx
import { UserProfilesKibanaProvider } from '@kbn/content-management-user-profiles';

function App() {
  return (
    <UserProfilesKibanaProvider core={{ userProfile: coreServices.userProfile }}>
      <YourContent />
    </UserProfilesKibanaProvider>
  );
}
```

### 2. Display User Avatars

```tsx
import { UserAvatarTip } from '@kbn/content-management-user-profiles';

function ItemRow({ item }) {
  return (
    <div>
      {item.createdBy && <UserAvatarTip uid={item.createdBy} />}
    </div>
  );
}
```

### 3. Add Creator Column to Tables

```tsx
import { renderCreatedByCell, hasCreatedByMetadata } from '@kbn/content-management-user-profiles';

function MyTable({ items }) {
  const showCreatorColumn = hasCreatedByMetadata(items);

  const columns = [
    { name: 'Title', field: 'title' },
    // ... other columns
  ];

  if (showCreatorColumn) {
    columns.push({
      name: 'Creator',
      field: 'createdBy',
      render: (field, record) => 
        renderCreatedByCell(record, { 
          entityName: 'dashboard',
          isKibanaVersioningEnabled: true 
        }),
      width: '100px',
      align: 'center',
    });
  }

  return <EuiBasicTable columns={columns} items={items} />;
}
```

### 4. Filter by Creator

```tsx
import { useCreatorFilter, getUniqueCreators } from '@kbn/content-management-user-profiles';

function ContentList({ items }) {
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const filteredItems = useCreatorFilter({ items, selectedCreators });
  const { allCreators, hasUnattributedItems } = getUniqueCreators(items);

  return (
    <>
      <CreatorFilterPanel 
        allCreators={allCreators}
        selectedCreators={selectedCreators}
        onChange={setSelectedCreators}
        showNoCreatorOption={hasUnattributedItems}
      />
      <ItemList items={filteredItems} />
    </>
  );
}
```

## API Reference

### Components

#### `<UserAvatarTip uid={string} />`
Displays user avatar with tooltip showing full name and email.

**Props:**
- `uid: string` - User profile ID

**Features:**
- Fetches user profile via React Query
- Shows avatar image
- Tooltip with user details
- Handles loading and error states

#### `<ManagedAvatarTip entityName={string} />`
Shows managed content indicator for system-managed items.

**Props:**
- `entityName: string` - Type of entity (e.g., "dashboard")

#### `<NoCreatorTip iconType={string} includeVersionTip={boolean} />`
Displays placeholder for items without creator information.

**Props:**
- `iconType: string` - Icon to display (e.g., "minus")
- `includeVersionTip: boolean` - Show versioning explanation

### Hooks

#### `useUserProfile(uid: string)`
Fetches a single user profile with React Query caching.

**Returns:** `UseQueryResult<UserProfile>`

**Features:**
- Infinite cache (`staleTime: Infinity`)
- Automatic batching via batcher utility
- Deduplication

#### `useUserProfiles(uids: string[], options?)`
Bulk fetches multiple user profiles efficiently.

**Parameters:**
- `uids: string[]` - Array of user profile IDs
- `options?: { enabled?: boolean }` - Query options

**Returns:** `UseQueryResult<UserProfile[]>`

#### `useCreatorFilter({ items, selectedCreators })`
Filters items by selected creators.

**Parameters:**
- `items: Array<{ id: string; createdBy?: string; managed?: boolean }>`
- `selectedCreators: string[]` - Array of selected user IDs

**Returns:** Filtered array of items

#### `useUpdaterFilter({ items, selectedUpdaters })`
Filters items by selected updaters.

**Parameters:**
- `items: Array<{ id: string; updatedBy?: string; managed?: boolean }>`
- `selectedUpdaters: string[]` - Array of selected user IDs

**Returns:** Filtered array of items

### Utilities

#### `renderCreatedByCell(record, options)`
Helper function for rendering creator column cells.

**Parameters:**
```typescript
record: { createdBy?: string; managed?: boolean }
options: {
  entityName: string;
  isKibanaVersioningEnabled?: boolean;
}
```

**Returns:** `React.ReactElement | null`

**Logic:**
1. If `createdBy` exists → render `UserAvatarTip`
2. If `managed` → render `ManagedAvatarTip`
3. Otherwise → render `NoCreatorTip`

#### `renderUpdatedByCell(record, options)`
Helper function for rendering updater column cells.

**Parameters:**
```typescript
record: { updatedBy?: string; managed?: boolean }
options: {
  entityName: string;
  isKibanaVersioningEnabled?: boolean;
}
```

**Returns:** `React.ReactElement | null`

#### `hasCreatedByMetadata(items)`
Checks if any items have creator information.

**Parameters:** `items: Array<{ createdBy?: string }>`

**Returns:** `boolean`

**Usage:** Conditionally show creator column

#### `hasUpdatedByMetadata(items)`
Checks if any items have updater information.

**Parameters:** `items: Array<{ updatedBy?: string }>`

**Returns:** `boolean`

#### `getUniqueCreators(items)`
Extracts unique creators from item list.

**Parameters:** `items: Array<{ createdBy?: string; managed?: boolean }>`

**Returns:**
```typescript
{
  allCreators: string[];
  hasUnattributedItems: boolean;
}
```

**Usage:** Build filter options

#### `getUniqueUpdaters(items)`
Extracts unique updaters from item list.

**Parameters:** `items: Array<{ updatedBy?: string; managed?: boolean }>`

**Returns:**
```typescript
{
  allUpdaters: string[];
  hasUnattributedItems: boolean;
}
```

### Constants

#### `USER_FILTER_NULL_USER`
Constant representing items without creator/updater.

**Value:** `'__null__'`

**Usage:** Include unattributed items in filters

## Integration with ContentList

### Basic Integration

```tsx
import { useContentList } from '@kbn/content-list-provider';
import { 
  UserProfilesKibanaProvider, 
  renderCreatedByCell,
  hasCreatedByMetadata 
} from '@kbn/content-management-user-profiles';

function DashboardList() {
  return (
    <UserProfilesKibanaProvider core={{ userProfile: coreServices.userProfile }}>
      <ContentListProvider
        entityName="dashboard"
        dataSource={dashboardDataSource}
      >
        <DashboardTableWithCreator />
      </ContentListProvider>
    </UserProfilesKibanaProvider>
  );
}

function DashboardTableWithCreator() {
  const { items } = useContentList();
  const showCreatorColumn = hasCreatedByMetadata(items);

  const columns = useMemo(() => {
    const cols = [
      { name: 'Title', field: 'title' },
    ];

    if (showCreatorColumn) {
      cols.push({
        name: 'Creator',
        field: 'createdBy',
        render: (_, record) => 
          renderCreatedByCell(record, { entityName: 'dashboard' }),
      });
    }

    return cols;
  }, [showCreatorColumn]);

  return <ContentListTable columns={columns} />;
}
```

### With Filtering

```tsx
function DashboardListWithFiltering() {
  const { items, updateFilter } = useContentList();
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  
  const { allCreators, hasUnattributedItems } = getUniqueCreators(items);
  const filteredItems = useCreatorFilter({ items, selectedCreators });

  return (
    <>
      <UserFilterPanel
        allUsers={allCreators}
        selectedUsers={selectedCreators}
        onChange={setSelectedCreators}
        showNoUserOption={hasUnattributedItems}
      />
      <ContentListTable items={filteredItems} />
    </>
  );
}
```

## Architecture

### Context Pattern
Uses React Context to provide user profile services throughout the component tree, avoiding prop drilling.

### React Query Integration
All user profile fetches use React Query for:
- Automatic caching (`staleTime: Infinity`)
- Deduplication of requests
- Batching via custom batcher utility
- Optimistic updates

### Batching Optimization
Multiple simultaneous requests for individual profiles are automatically batched into a single `bulkGet` call for performance.

**Batcher Logic:**
```typescript
// Multiple calls within same event loop:
getUserProfile('user1');
getUserProfile('user2');
getUserProfile('user3');

// Result: Single bulkGet(['user1', 'user2', 'user3']) call
```

### Performance Considerations

1. **Infinite Cache:** User profiles rarely change, so we cache forever
2. **Batching:** Reduces API calls dramatically
3. **Lazy Loading:** Avatars only load when visible
4. **Conditional Rendering:** Column only added when data exists

## Comparison with Alternatives

### Alternative 1: Inline User Profile Logic

**Cons:**
- ❌ Duplicates code across components
- ❌ No consistent caching strategy
- ❌ Harder to test
- ❌ Can't optimize batching
- ❌ Tight coupling to each consumer

### Alternative 2: Keep in TableListViewTable

**Cons:**
- ❌ Tightly coupled to TableListViewTable
- ❌ Hard to reuse in ContentListTable
- ❌ Creates duplication when ContentList needs same feature

### Alternative 3: Separate Package (Current) ✅

**Pros:**
- ✅ Single source of truth
- ✅ Reusable across all content management features
- ✅ Centralized caching and optimization
- ✅ Easy to test and maintain
- ✅ Follows established Kibana patterns (like Favorites)
- ✅ Optional - don't import if not needed

## Testing

### Unit Tests

```tsx
import { renderCreatedByCell, hasCreatedByMetadata } from '@kbn/content-management-user-profiles';

describe('renderCreatedByCell', () => {
  it('renders UserAvatarTip when createdBy exists', () => {
    const result = renderCreatedByCell(
      { createdBy: 'user123' },
      { entityName: 'dashboard' }
    );
    expect(result.type).toBe(UserAvatarTip);
  });

  it('renders ManagedAvatarTip for managed content', () => {
    const result = renderCreatedByCell(
      { managed: true },
      { entityName: 'dashboard' }
    );
    expect(result.type).toBe(ManagedAvatarTip);
  });
});

describe('hasCreatedByMetadata', () => {
  it('returns true when items have createdBy', () => {
    const items = [{ createdBy: 'user1' }, { createdBy: undefined }];
    expect(hasCreatedByMetadata(items)).toBe(true);
  });

  it('returns false when no items have createdBy', () => {
    const items = [{ createdBy: undefined }];
    expect(hasCreatedByMetadata(items)).toBe(false);
  });
});
```

### Integration Tests

```tsx
import { render, screen } from '@testing-library/react';
import { UserProfilesProvider } from '@kbn/content-management-user-profiles';

describe('ContentList with creator column', () => {
  it('displays creator avatars', async () => {
    const mockGetUserProfile = jest.fn().mockResolvedValue({
      uid: 'user1',
      user: { username: 'john' },
      data: { avatar: {} },
    });

    render(
      <UserProfilesProvider getUserProfile={mockGetUserProfile}>
        <ContentListTable items={[{ id: '1', createdBy: 'user1' }]} />
      </UserProfilesProvider>
    );

    expect(await screen.findByTestId('userAvatarTip-john')).toBeVisible();
  });
});
```

## Migration Guide

### From TableListViewTable to ContentList

**Before (TableListViewTable):**
```tsx
<TableListViewKibanaProvider core={coreServices}>
  <TableListViewTable
    createdByEnabled={true}
    findItems={findItems}
    // ... other props
  />
</TableListViewKibanaProvider>
```

**After (ContentList):**
```tsx
<UserProfilesKibanaProvider core={{ userProfile: coreServices.userProfile }}>
  <ContentListProvider
    entityName="dashboard"
    dataSource={dataSource}
  >
    <ContentListTableWithCreator />
  </ContentListProvider>
</UserProfilesKibanaProvider>
```

**Key Differences:**
1. User profiles provider is separate from table provider
2. Creator column added explicitly via `columns` prop
3. Use helper utilities for column rendering
4. More flexible - can customize column behavior

## Related Packages

- **`@kbn/content-management-favorites-public`** - Similar pattern for favorites
- **`@kbn/content-management-tags-public`** - Similar pattern for tags (proposed)
- **`@kbn/user-profile-components`** - Base avatar components used internally
- **`@kbn/content-management-table-list-view-table`** - Current consumer
- **`@kbn/content-list-provider`** - New content list system
- **`@kbn/content-list-table`** - New table component

## Future Enhancements

### Potential Additions

1. **Filter UI Components**
   - `<CreatorFilterPanel />` - Pre-built filter UI
   - `<UserSelectableList />` - User selection component
   
2. **Advanced Filtering**
   - Filter by multiple user properties (role, team, etc.)
   - Date-based filtering (created in last N days)
   
3. **Sorting Support**
   - Sort by creator name (not just ID)
   - Group by creator
   
4. **Bulk Operations**
   - Preload profiles for entire list
   - Export with user names instead of IDs

### Open Questions

1. **Should we add pre-built filter UI components?**
   - Recommendation: Yes, copy from `table_list_view_table` for consistency
   
2. **Should creator column be sortable?**
   - Recommendation: No, sorting by user ID doesn't make semantic sense
   - Future: Could sort by fetched username, but adds complexity
   
3. **How to handle deleted users?**
   - Current: Shows user ID when profile not found
   - Future: Could show "Deleted User" indicator

4. **Should we support team/group attribution?**
   - Recommendation: Not for v1, keep simple
   - Future: Could extend for organizational use cases

## Implementation Checklist

### Phase 1: Package Enhancement
- [ ] Add `src/column_helpers.ts` with render utilities
- [ ] Add `src/creator_filter.ts` with filter hooks
- [ ] Update `index.ts` exports
- [ ] Add comprehensive README.md
- [ ] Add unit tests for new utilities
- [ ] Update `kibana.jsonc` if needed

### Phase 2: ContentList Integration
- [ ] Add example integration in ContentList docs
- [ ] Update ContentListTable stories to show creator column
- [ ] Add integration tests
- [ ] Update PLAN.md with creator column documentation

### Phase 3: Documentation & Examples
- [ ] Add usage examples to Storybook
- [ ] Create migration guide from TableListViewTable
- [ ] Document performance considerations
- [ ] Add troubleshooting section

### Phase 4: Dashboard Migration (Optional)
- [ ] Evaluate migrating Dashboard to use ContentList
- [ ] Ensure feature parity
- [ ] Performance testing
- [ ] Gradual rollout

## Success Metrics

1. **Adoption:** Number of content types using creator column
2. **Performance:** Reduction in user profile API calls via batching
3. **Developer Experience:** Time to add creator column to new content type
4. **Code Reuse:** Lines of code shared vs. duplicated
5. **Consistency:** Visual consistency across all content listings

## Conclusion

The `@kbn/content-management-user-profiles` package already provides excellent foundation for creator/updater functionality. By adding a small set of helper utilities, we can make it extremely easy to integrate creator columns into ContentList and other content management features while maintaining the clean, reusable architecture that the Favorites package established.

**Key Benefits:**
- ✅ Package already exists - minimal new code needed
- ✅ Follows established patterns (Favorites, Tags)
- ✅ Already decoupled from Dashboard
- ✅ Performance optimizations built-in (caching, batching)
- ✅ Simple API for consumers
- ✅ Optional - only used when needed

**Next Steps:**
1. Review and approve this proposal
2. Implement Phase 1 enhancements
3. Add examples to ContentList stories
4. Gather feedback from early adopters
5. Iterate based on usage patterns

