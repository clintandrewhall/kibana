# Migrating from TableListView to ContentListKibanaProvider

This guide documents how to migrate from `TableListView`/`TableListViewTable` to `ContentListKibanaProvider`. Each section shows the equivalent `ContentListKibanaProvider` configuration and a feature parity analysis.

## Table of Contents

- [Overview](#overview)
- [Feature Parity Summary](#feature-parity-summary)
- [Migration Examples](#migration-examples)
  - [Dashboard](#dashboard)
  - [Visualizations](#visualizations)
  - [Maps](#maps)
  - [Graph](#graph)
  - [Files Management](#files-management)
  - [Event Annotations](#event-annotations)
- [Common Migration Patterns](#common-migration-patterns)

---

## Overview

The `ContentListKibanaProvider` is a modern replacement for `TableListView` that uses a context-based architecture. Key differences:

| Aspect | TableListView | ContentListKibanaProvider |
|--------|--------------|---------------------------|
| **Architecture** | Monolithic component with 30+ props | Context provider with feature-specific hooks |
| **State Management** | Internal reducer + local state | React Query + context |
| **Customization** | Limited (custom columns, empty prompts) | Composable (any table component, custom columns) |
| **Services** | Provided via `TableListViewKibanaProvider` wrapper | Integrated into single provider |
| **Data Fetching** | `findItems` prop with specific signature | `contentTypeId` + `contentManagement` (simplest), `dataSource.searchService`, or `dataSource.findItems` |

---

## Feature Parity Summary

### ✅ Full Parity

| Feature | TableListView | ContentListKibanaProvider |
|---------|--------------|---------------------------|
| Entity naming | `entityName`, `entityNamePlural` | `entityName`, `entityNamePlural` |
| Data fetching | `findItems` | `dataSource.findItems` or `contentTypeId` |
| Search | Built-in search bar | `features.search` |
| Tag filtering | Via `TableListViewKibanaProvider` | `savedObjectsTagging` prop |
| User profile filtering | `createdByEnabled` | `core.userProfile` |
| Favorites | Via `favorites` prop on provider | `favorites` prop |
| Sorting | Built-in, `customSortingOptions` | `features.sorting` with `fields` |
| Pagination | Built-in, `initialPageSize` | `features.pagination` with `initialPageSize` |
| Selection/bulk delete | `deleteItems` | `features.selection.onSelectionDelete` |
| Item navigation | `getDetailViewLink`, `getOnClickTitle` | `item.getHref`, `item.actions.onClick` |
| Item editing | `editItem` | `item.actions.onEdit` |
| Item view details | N/A | `item.actions.onViewDetails` |
| Item duplication | N/A | `item.actions.onDuplicate` |
| Item export | N/A | `item.actions.onExport` |
| Item deletion | `deleteItems` | `item.actions.onDelete` |
| Create action | `createItem` | `features.globalActions.onCreate` |
| Empty state | `emptyPrompt` | Via `ContentListTable` `emptyState` prop |
| Custom columns | `customTableColumn` | `<Column>` children in `ContentListTable` |
| Read-only mode | Conditional `deleteItems`/`editItem` | `isReadOnly` prop |

### ⚠️ Different Approach

| Feature | TableListView | ContentListKibanaProvider |
|---------|--------------|---------------------------|
| URL state | `urlStateEnabled` | `features.urlState` (types defined, implementation in progress) |
| Content editor | `contentEditor` prop | Not included (use separate component) |
| Custom sorting labels | `customSortingOptions` | `features.sorting.fields` with `ascLabel`/`descLabel` |
| Row item actions | `rowItemActions` callback | `item.actions.custom` array |
| Recently accessed | `recentlyAccessed` prop | `features.recentlyAccessed` (types defined, implementation in progress) |
| Tabbed view | `TabbedTableListView` wrapper | Compose multiple providers (planned) |

### ❌ Not Yet Supported

| Feature | TableListView | ContentListKibanaProvider Status |
|---------|--------------|----------------------------------|
| Content insights | `contentInsightsClient` | Not planned |
| `withoutPageTemplateWrapper` | Disable page template | Use provider anywhere (no page template) |

---

## Migration Examples

### Dashboard

Full-featured listing with favorites, recently accessed, content editor, bulk delete, and user filtering.

**ContentListKibanaProvider equivalent (simplest approach using `contentTypeId`):**

```tsx
<ContentListKibanaProvider
  // Use contentTypeId for automatic data fetching via Content Management
  contentTypeId="dashboard"
  contentManagement={contentManagementService}  // Pass the full plugin start contract
  entityName="dashboard"
  entityNamePlural="dashboards"
  savedObjectsTagging={savedObjectsTaggingService?.getTaggingApi()}
  core={coreServices}
  favorites={dashboardFavoritesClient}
  isReadOnly={!showWriteControls}
  item={{
    getHref: (item) => getDashboardUrl(item.id, item.timeRestore),
    actions: {
      onClick: (item) => goToDashboard(item.id),
      onEdit: showWriteControls ? (item) => editDashboard(item) : undefined,
      onDelete: showWriteControls ? (item) => deleteDashboard(item) : undefined,
    },
  }}
  features={{
    search: { placeholder: 'Search dashboards...' },
    // filtering: true is the default; tags/users/favorites auto-enabled when services are provided.
    // Use `filtering: { tags: false }` to explicitly disable specific filters.
    sorting: { initialSort: { field: 'updatedAt', direction: 'desc' } },
    pagination: { initialPageSize: 20 },
    selection: showWriteControls
      ? { onSelectionDelete: (items) => bulkDeleteDashboards(items) }
      : undefined,
    globalActions: showWriteControls
      ? { onCreate: () => navigateTo('/app/dashboard/create') }
      : undefined,
  }}
>
  {children}
</ContentListKibanaProvider>
```

**Alternative with explicit `dataSource.findItems`** (for custom data fetching):

```tsx
<ContentListKibanaProvider
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{
    findItems: async ({ searchQuery, filters, sort, page }) => {
      const response = await contentManagement.search({
        contentTypeId: 'dashboard',
        query: {
          text: searchQuery ? `${searchQuery}*` : undefined,
          tags: { included: filters.tags?.include, excluded: filters.tags?.exclude },
        },
        options: { page: page.index + 1, perPage: page.size },
      });
      return { items: response.hits, total: response.pagination.total };
    },
  }}
  // ... rest of props
>
  {children}
</ContentListKibanaProvider>
```

**Feature Parity Analysis — Dashboard:**

| Feature | TableListView | ContentListKibanaProvider | Notes |
|---------|--------------|---------------------------|-------|
| ✅ Content editor | `contentEditor` prop | Separate component | Use `@kbn/content-management-content-editor` directly |
| ✅ Favorites | `favorites` prop | `favorites` prop | Same API |
| ✅ User filtering | `createdByEnabled: true` | `core.userProfile` | Auto-enabled when core provided |
| ✅ Tag filtering | Via provider | `savedObjectsTagging` prop | Same behavior |
| ✅ Recently accessed | `recentlyAccessed` prop | `features.recentlyAccessed` | Planned |
| ✅ Custom validators | `contentEditor.customValidators` | Separate component | Decouple validation |
| ✅ Children slot | JSX children | JSX children | Same pattern |
| ✅ Bulk delete | `deleteItems` | `features.selection.onSelectionDelete` | Same functionality |

---

### Visualizations

Tabbed variant with custom columns (type icons with experimental badges) and custom sorting options.

**ContentListKibanaProvider equivalent:**

```tsx
<ContentListKibanaProvider
  entityName="visualization"
  entityNamePlural="visualizations"
  dataSource={{
    findItems: async ({ searchQuery, filters, sort, page }) => {
      const { total, hits } = await findListItems(
        getTypes(),
        searchQuery,
        listingLimit,
        filters.tags?.include?.map((id) => ({ id, type: 'tag' })),
        filters.tags?.exclude?.map((id) => ({ id, type: 'tag' }))
      );
      return { items: hits, total };
    },
    transform: (item) => ({
      id: item.id,
      title: item.title ?? '',
      description: item.description,
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      // Custom fields for the type column
      type: item.savedObjectType,
      icon: item.icon,
      stage: item.stage,
      typeTitle: item.typeTitle,
      readOnly: item.readOnly,
      error: item.error,
    }),
  }}
  savedObjectsTagging={savedObjectsTagging}
  core={core}
  item={{
    getHref: getVisualizeListItemLink,
    actions: {
      onClick: {
        handler: (item) => editItem(item),
        isEnabled: (item) => !item.readOnly && !item.error,
      },
      onEdit: (item) => editItem(item),
      onDelete: visualizeCapabilities.save ? (item) => deleteItem(item) : undefined,
    },
  }}
  features={{
    sorting: {
      fields: [
        ...DEFAULT_SORT_FIELDS,
        {
          field: 'type',
          name: 'Type',
          ascLabel: 'Type A-Z',
          descLabel: 'Type Z-A',
        },
      ],
    },
    pagination: { initialPageSize },
    globalActions: { onCreate: createNewVis },
    selection: visualizeCapabilities.save
      ? { onSelectionDelete: deleteItems }
      : undefined,
  }}
>
  {children}
</ContentListKibanaProvider>
```

**Feature Parity Analysis — Visualizations:**

| Feature | TableListView | ContentListKibanaProvider | Notes |
|---------|--------------|---------------------------|-------|
| ✅ Custom column | `customTableColumn` | `<Column>` component | More flexible |
| ✅ Custom sorting | `customSortingOptions` | `features.sorting.fields` | Same capability |
| ✅ Tabbed view | `TabbedTableListView` | Multiple providers | Compose as needed |
| ✅ CSS customization | Custom CSS injection | CSS/styled components | Same approach |
| ✅ Conditional edit | `getOnClickTitle` returns undefined | `item.actions.onClick` | Same pattern |
| ✅ Row item actions | `rowItemActions` | `item.actions` | More explicit |
| ✅ Callout above table | Children slot | Children slot | Same pattern |

---

### Maps

Simple implementation with basic CRUD and read-only mode.

**ContentListKibanaProvider equivalent:**

```tsx
<ContentListKibanaProvider
  entityName="map"
  entityNamePlural="maps"
  dataSource={{
    findItems: async ({ searchQuery, filters, sort, page }) => {
      const { hits, pagination } = await getMapClient().search({
        text: searchQuery ? `${searchQuery}*` : undefined,
        limit: getUiSettings().get(SAVED_OBJECTS_LIMIT_SETTING),
        tags: {
          included: filters.tags?.include ?? [],
          excluded: filters.tags?.exclude ?? [],
        },
      });
      return { items: hits, total: pagination.total };
    },
  }}
  savedObjectsTagging={savedObjectsTagging}
  core={core}
  isReadOnly={isReadOnly}
  item={{
    actions: {
      onClick: (item) => history.push(getEditPath(item.id)),
    },
  }}
  features={{
    pagination: { initialPageSize },
    globalActions: isReadOnly ? undefined : { onCreate: navigateToNewMap },
    selection: isReadOnly
      ? undefined
      : { onSelectionDelete: (items) => deleteMaps(items) },
  }}
>
  {children}
</ContentListKibanaProvider>
```

**Feature Parity Analysis — Maps:**

| Feature | TableListView | ContentListKibanaProvider | Notes |
|---------|--------------|---------------------------|-------|
| ✅ Basic CRUD | Full support | Full support | Same functionality |
| ✅ Read-only mode | Conditional props | `isReadOnly` prop | Cleaner API |
| ✅ Custom navigation | `getOnClickTitle` | `item.actions.onClick` | Same pattern |
| ✅ Tag filtering | Via provider | `savedObjectsTagging` prop | Same behavior |
| ✅ Pagination | `initialPageSize` | `features.pagination` | Same capability |

---

### Graph

Custom empty prompts with sample data integration and URL-based initial filters.

**ContentListKibanaProvider equivalent:**

```tsx
<ContentListKibanaProvider
  entityName="graph"
  entityNamePlural="graphs"
  dataSource={{
    findItems: async ({ searchQuery, filters, sort, page }) => {
      const { hits, pagination } = await contentClient.search({
        contentTypeId: 'graph-workspace',
        query: {
          text: searchQuery ? `${searchQuery}*` : undefined,
          tags: {
            included: filters.tags?.include,
            excluded: filters.tags?.exclude,
          },
        },
      });
      return { items: hits, total: pagination.total };
    },
  }}
  core={core}
  isReadOnly={!capabilities.graph.save}
  item={{
    getHref: (item) => getEditUrl(addBasePath, { id: item.id }),
    actions: {
      onEdit: capabilities.graph.save ? (item) => editItem(item) : undefined,
      onDelete: capabilities.graph.delete ? (item) => deleteGraph(item) : undefined,
    },
  }}
  features={{
    search: { initialQuery: initialFilter },
    pagination: { initialPageSize },
    globalActions: capabilities.graph.save ? { onCreate: createItem } : undefined,
    selection: capabilities.graph.delete
      ? { onSelectionDelete: (items) => deleteGraphs(items) }
      : undefined,
  }}
>
  {children}
</ContentListKibanaProvider>
```

**Feature Parity Analysis — Graph:**

| Feature | TableListView | ContentListKibanaProvider | Notes |
|---------|--------------|---------------------------|-------|
| ✅ Custom empty prompt | `emptyPrompt` prop | `emptyState` prop on table | Same capability |
| ✅ Initial filter from URL | `initialFilter` | `features.search.initialQuery` | Same pattern |
| ✅ Capabilities-based actions | Conditional props | Conditional `item.actions` | Same approach |
| ✅ Sample data links | In empty prompt | In empty prompt | Same pattern |
| ✅ Detail view links | `getDetailViewLink` | `item.getHref` | Same functionality |

---

### Files Management

Embedded without page template, custom column (file size), and conditional row actions.

**ContentListKibanaProvider equivalent:**

```tsx
<ContentListKibanaProvider
  entityName="file"
  entityNamePlural="files"
  dataSource={{
    findItems: async ({ searchQuery }) => {
      const { files, total } = await filesClient.find({
        name: searchQuery ? naivelyFuzzify(searchQuery) : undefined,
        kindToExclude: kindToExcludeFromSearch,
      });
      return { items: files, total };
    },
    transform: (file) => ({
      id: file.id,
      title: file.name + (file.extension ? `.${file.extension}` : ''),
      updatedAt: file.updated ? new Date(file.updated) : undefined,
      // Custom fields
      size: file.size,
      fileKind: file.fileKind,
      ...file,
    }),
  }}
  core={core}
  item={{
    actions: {
      onClick: (item) => setSelectedFile(item),
      onDelete: {
        handler: (item) => filesClient.delete({ id: item.id }),
        isEnabled: canDeleteFile,
      },
    },
  }}
  features={{
    pagination: { initialPageSize: 50 },
    selection: {
      onSelectionDelete: async (items) => {
        const deletableItems = items.filter(canDeleteFile);
        await Promise.all(deletableItems.map(({ id }) => filesClient.delete({ id })));
      },
    },
  }}
>
  {children}
</ContentListKibanaProvider>
```

**Feature Parity Analysis — Files Management:**

| Feature | TableListView | ContentListKibanaProvider | Notes |
|---------|--------------|---------------------------|-------|
| ✅ Custom column | `customTableColumn` | `<Column>` component | More flexible |
| ✅ Additional actions | `additionalRightSideActions` | Separate toolbar component | More control |
| ✅ Conditional row actions | `rowItemActions` | `item.actions` with conditionals | Same pattern |
| ✅ No page template | `withoutPageTemplateWrapper` | Default (no page template) | Provider-only approach |
| ✅ Flyout integration | External state | External state | Same pattern |
| ✅ Title column name | `titleColumnName` | `<Column.Name columnTitle="...">` | More explicit |

---

### Event Annotations

Direct `TableListViewTable` usage with custom data view column and edit flyout.

**ContentListKibanaProvider equivalent:**

```tsx
<ContentListKibanaProvider
  entityName="annotation group"
  entityNamePlural="annotation groups"
  dataSource={{
    findItems: async ({ searchQuery, filters }) => {
      const { hits, total } = await eventAnnotationService.findAnnotationGroupContent(
        searchQuery,
        listingLimit,
        filters.tags?.include?.map((id) => ({ id, type: 'tag' })),
        filters.tags?.exclude?.map((id) => ({ id, type: 'tag' }))
      );
      return { items: hits, total };
    },
  }}
  savedObjectsTagging={savedObjectsTagging}
  core={core}
  item={{
    actions: {
      onEdit: (item) =>
        eventAnnotationService.loadAnnotationGroup(item.id).then(setEditingGroup),
      onDelete: visualizeCapabilities.delete
        ? (item) => eventAnnotationService.deleteAnnotationGroups([item.id])
        : undefined,
    },
  }}
  features={{
    pagination: { initialPageSize },
    selection: visualizeCapabilities.delete
      ? {
          onSelectionDelete: (items) =>
            eventAnnotationService.deleteAnnotationGroups(items.map(({ id }) => id)),
        }
      : undefined,
  }}
>
  {children}
</ContentListKibanaProvider>
```

**Feature Parity Analysis — Event Annotations:**

| Feature | TableListView | ContentListKibanaProvider | Notes |
|---------|--------------|---------------------------|-------|
| ✅ Direct table usage | `TableListViewTable` | `ContentListTable` | Same pattern |
| ✅ Custom column | `customTableColumn` | `<Column>` component | More flexible |
| ✅ Empty prompt | `emptyPrompt` | `emptyState` prop | Same capability |
| ✅ Edit flyout | External state | External state | Same pattern |
| ✅ Refresh bouncer | `refreshListBouncer` | `refetch` from hook | Different API |
| ✅ Parent props spread | `{...parentProps}` | `{...parentProps}` | Same pattern |

---

## Common Migration Patterns

### 1. Provider Setup

**Before (TableListView):**

```tsx
<TableListViewKibanaProvider
  core={core}
  savedObjectsTagging={savedObjectsTagging}
  FormattedRelative={FormattedRelative}
  favorites={favoritesClient}
>
  <TableListView {...props} />
</TableListViewKibanaProvider>
```

**After (ContentListKibanaProvider):**

```tsx
<ContentListKibanaProvider
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems }}
  savedObjectsTagging={savedObjectsTagging}
  core={core}
  favorites={favoritesClient}
>
  {children}
</ContentListKibanaProvider>
```

### 2. Data Fetching

**Before:**

```tsx
findItems={(searchTerm, { references, referencesToExclude }) =>
  api.search(searchTerm, references, referencesToExclude)
}
```

**After (Option 1 — Simplest with `contentTypeId`):**

```tsx
// Uses Content Management client automatically
contentTypeId="dashboard"
contentManagement={contentManagement}  // Pass the full plugin start contract
```

**After (Option 2 — With `searchService`):**

```tsx
dataSource={{
  searchService: {
    search: async (query) => {
      const response = await contentManagement.search({ contentTypeId: 'dashboard', query });
      return response.result;
    },
  },
}}
```

**After (Option 3 — With explicit `findItems`):**

```tsx
dataSource={{
  findItems: async ({ searchQuery, filters, sort, page }) => {
    const response = await api.search({
      query: searchQuery,
      tags: filters.tags,
      sort,
      page,
    });
    return { items: response.hits, total: response.total };
  },
}}
```

> **Tip:** Use `contentTypeId` for standard Content Management integration. Use `dataSource.searchService` when you need a custom search implementation. Use `dataSource.findItems` when you need full control over the data fetching logic (e.g., custom sorting, non-CM APIs).

### 3. Read-Only Mode

**Before:**

```tsx
<TableListView
  createItem={canWrite ? createFn : undefined}
  deleteItems={canWrite ? deleteFn : undefined}
  editItem={canWrite ? editFn : undefined}
/>
```

**After:**

```tsx
<ContentListKibanaProvider
  isReadOnly={!canWrite}
  features={{
    globalActions: canWrite ? { onCreate: createFn } : undefined,
    selection: canWrite ? { onSelectionDelete: deleteFn } : undefined,
  }}
  item={{
    actions: {
      onEdit: canWrite ? editFn : undefined,
      onDelete: canWrite ? deleteFn : undefined,
    },
  }}
/>
```

### 4. Custom Sorting

**Before:**

```tsx
customSortingOptions={{
  options: [
    { field: 'type', direction: 'asc', label: 'Type A-Z' },
    { field: 'type', direction: 'desc', label: 'Type Z-A' },
  ],
}}
```

**After:**

```tsx
features={{
  sorting: {
    fields: [
      ...DEFAULT_SORT_FIELDS,
      {
        field: 'type',
        name: 'Type',
        ascLabel: 'Type A-Z',
        descLabel: 'Type Z-A',
      },
    ],
  },
}}
```

---

## Related Documentation

- **[README](./README.md)** — Package overview, quick start, and API reference.
- **[RECIPES](./RECIPES.mdx)** — Common patterns and examples.
