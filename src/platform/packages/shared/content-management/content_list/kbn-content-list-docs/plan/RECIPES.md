# ContentList Recipes and Examples

## Document Purpose

This document provides practical code examples for using the ContentList components. It serves as a reference for common usage patterns and migration guides for teams moving from `TableListView` to the new architecture.

**Related Documents:**
- **[LISTING_COMPONENT.md](./LISTING_COMPONENT.md)** - Component API specifications
- **[LISTING_PROVIDER.md](./LISTING_PROVIDER.md)** - Provider implementation details
- **[LISTING_PAGE.md](./LISTING_PAGE.md)** - Page wrapper specification
- **[PLAN.md](./PLAN.md)** - Implementation phases

---

## Table of Contents

1. [Quick Start Examples](#quick-start-examples)
   - [Simple Listing](#simple-listing)
   - [Embedded Usage (No Page Wrapper)](#embedded-usage-no-page-wrapper)
   - [Read-Only Mode](#read-only-mode)

2. [Transform Function Examples](#transform-function-examples)
   - [Default Transform (Elasticsearch SavedObject)](#default-transform-elasticsearch-savedobject)
   - [Custom Transform](#custom-transform)
   - [Transform with Type Safety](#transform-with-type-safety)

3. [Usage Patterns](#usage-patterns)
   - [Pattern 1: Simple Listing (Default Experience)](#pattern-1-simple-listing-default-experience)
   - [Pattern 2: Grid Layout with Custom Filters](#pattern-2-grid-layout-with-custom-filters)
   - [Pattern 3: Custom Table with Additional Content](#pattern-3-custom-table-with-additional-content)
   - [Pattern 4: No Page Template (Embedded in Management)](#pattern-4-no-page-template-embedded-in-management)
   - [Pattern 5: Completely Custom (Maximum Flexibility)](#pattern-5-completely-custom-maximum-flexibility)

4. [ContentList Convenience Component](#contentlist-convenience-component)
   - [Minimal Usage (6 props)](#minimal-usage-6-props)
   - [With Actions (7 props)](#with-actions-7-props)
   - [With Custom Columns and Bulk Actions (8 props)](#with-custom-columns-and-bulk-actions-8-props)
   - [Columns as Function - Add Custom Columns](#columns-as-function---add-custom-columns)
   - [Columns as Function - Reorder or Filter Defaults](#columns-as-function---reorder-or-filter-defaults)
   - [Full Featured](#full-featured)
   - [Custom Layout Using Children](#custom-layout-using-children)

5. [Migration Examples for Current Consumers](#migration-examples-for-current-consumers)
   - [Migration 1: Maps (Simple Case)](#migration-1-maps-simple-case)
   - [Migration 2: Files Management (Embedded + Custom Actions)](#migration-2-files-management-embedded--custom-actions)
   - [Migration 3: Dashboard (Complex with Many Features)](#migration-3-dashboard-complex-with-many-features)
   - [Migration 4: Visualizations (Tabbed Variant)](#migration-4-visualizations-tabbed-variant)

6. [Smart Defaults in Action](#smart-defaults-in-action)
   - [Zero Config](#zero-config)
   - [Explicit Override](#explicit-override)
   - [Advanced Custom Positioning](#advanced-custom-positioning)

7. [Package Import Strategies](#package-import-strategies)
   - [Strategy 1: Granular (Best Tree-Shaking)](#strategy-1-granular-best-tree-shaking)
   - [Strategy 2: Barrel Export (Convenience)](#strategy-2-barrel-export-convenience)
   - [Strategy 3: Mixed (Balance)](#strategy-3-mixed-balance)
   - [Strategy 4: Custom UI with Standard State Management](#strategy-4-custom-ui-with-standard-state-management)

8. [Expandable Row Details](#expandable-row-details)
   - [Simple Inline](#simple-inline)
   - [Dashboard with Error Details](#dashboard-with-error-details)
   - [File Listing with Metadata](#file-listing-with-metadata)
   - [Conditional Expansion](#conditional-expansion)
   - [Complex Content Preview](#complex-content-preview)

---

## Quick Start Examples

### Simple Listing

```tsx
<ContentListPage>
  <ContentListPage.Header>
    <Header title="Dashboards">
      <Header.Right>
        <EuiButton onClick={createDashboard}>Create dashboard</EuiButton>
      </Header.Right>
    </Header>
  </ContentListPage.Header>
  
  <ContentListPage.Section>
    <ContentListProvider
      entityName="dashboard"
      entityNamePlural="dashboards"
      dataSource={{ findItems: findDashboards }}
      search={true}
      sorting={true}
      pagination={true}
      actions={{
        selection: { onDelete: deleteDashboards },
      }}
    >
      <ContentListToolbar />
      <ContentListTable columns={defaultColumns} />
      <ContentListFooter />
    </ContentListProvider>
  </ContentListPage.Section>
</ContentListPage>
```

### Embedded Usage (No Page Wrapper)

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
      <ContentListToolbar />
      <ContentListTable columns={compactColumns} />
    </ContentListProvider>
  </EuiFlyoutBody>
</EuiFlyout>
```

### Read-Only Mode

```tsx
<ContentListProvider
  isReadOnly={!hasWritePermission}  // Single prop disables all actions
  entityName="map"
  dataSource={{ findItems: findMaps }}
  item={{
    actions: {
      onEdit: editMap,  // Ignored when isReadOnly=true
    }
  }}
  actions={{
    onCreate: createMap,              // Ignored when isReadOnly=true
    selection: { onDelete: deleteMaps },  // Ignored when isReadOnly=true
  }}
  search={true}
  sorting={true}
>
  <ContentListToolbar />
  <ContentListTable />
</ContentListProvider>
```

---

## Transform Function Examples

The `transform` property in `DataSourceConfig` allows you to decouple rendering logic from your datasource return type by converting raw items into the standardized `ContentListItem` format.

### Default Transform (Elasticsearch SavedObject)

If you don't provide a `transform` in your `dataSource` config, the provider uses a default transform that expects Elasticsearch SavedObject-like structure:

```typescript
<ContentListProvider<SavedObject>
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{
    findItems: fetchDashboards,
    // No transform specified - uses defaultTransform
  }}
>
  <ContentListTable />
</ContentListProvider>
```

The default transform expects items like:
```typescript
{
  id: string;
  type?: string;
  attributes: {
    title?: string;
    description?: string;
  };
  updatedAt?: string;
  createdAt?: string;
  updatedBy?: string;
  createdBy?: string;
}
```

### Custom Transform

For datasources with different structures, provide a custom transform function in your `dataSource` config:

```typescript
import type { TransformFunction, ContentListItem } from '@kbn/content-list-provider';

interface CustomApiResponse {
  uuid: string;
  name: string;
  summary?: string;
  lastModified: number;
  author: {
    name: string;
  };
}

const customTransform: TransformFunction<CustomApiResponse> = (item) => ({
  id: item.uuid,
  title: item.name,
  description: item.summary,
  updatedAt: new Date(item.lastModified),
  updatedBy: item.author.name,
  // Add any additional fields you need
  customField: item.anyOtherData,
});

<ContentListProvider<CustomApiResponse>
  entityName="report"
  entityNamePlural="reports"
  dataSource={{
    findItems: fetchReports,
    transform: customTransform,
  }}
>
  <ContentListTable />
</ContentListProvider>
```

### Transform with Type Safety

TypeScript enforces transform requirements based on datasource type:

**Standard ES Format - Transform Optional:**
```typescript
interface Dashboard extends UserContentCommonSchema {
  attributes: {
    title: string;
    description: string;
  };
}

// Transform optional - TypeScript allows this
<ContentListProvider<Dashboard>
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{
    findItems: fetchDashboards,
    // No transform needed
  }}
>
  <ContentListTable />
</ContentListProvider>
```

**Custom Type - Transform Required:**
```typescript
interface CustomReport {
  uuid: string;
  name: string;
  modified: Date;
}

// Transform REQUIRED - TypeScript enforces this
<ContentListProvider<CustomReport>
  entityName="report"
  entityNamePlural="reports"
  dataSource={{
    findItems: fetchReports,
    // ❌ TypeScript error if transform is missing
    transform: (item) => ({
      id: item.uuid,
      title: item.name,
      updatedAt: item.modified,
    }),
  }}
>
  <ContentListTable />
</ContentListProvider>
```

**ContentListItem Interface:**

The standardized interface that all items are transformed into:

```typescript
interface ContentListItem {
  id: string;              // Required: unique identifier
  title: string;           // Required: display title
  description?: string;    // Optional: description text
  type?: string;          // Optional: item type
  updatedAt?: Date;       // Optional: last update timestamp
  createdAt?: Date;       // Optional: creation timestamp
  updatedBy?: string;     // Optional: last updater name
  createdBy?: string;     // Optional: creator name
  tags?: string[];        // Optional: tags array
  [key: string]: unknown; // Any additional custom fields
}
```

**Benefits:**
1. **Decoupling**: Rendering components work with a consistent interface regardless of datasource
2. **Flexibility**: Support any backend API structure without changing rendering logic
3. **Type Safety**: Full TypeScript support with generics only where needed
4. **Reusability**: Same rendering components work across different content types
5. **Simplicity**: State management only deals with standardized items

---

## Usage Patterns

### Pattern 1: Simple Listing (Default Experience)

```tsx
import {
  ContentListPage,
  Header,
  ContentListProvider,
  ContentList,
} from '@kbn/content-list';

function DashboardListing() {
  return (
    <ContentListPage>
      <ContentListPage.Header>
        <Header
          title="Dashboards"
          description="Create and manage your dashboards"
        >
          <Header.Right>
            <EuiButton onClick={createDashboard}>Create dashboard</EuiButton>
          </Header.Right>
        </Header>
      </ContentListPage.Header>
      
      <ContentListPage.Section>
        <ContentListProvider
          entityName="dashboard"
          entityNamePlural="dashboards"
          dataSource={{ findItems: findDashboards }}
          search={true}  // Enable search with defaults
          sorting={true}  // Enable sorting with defaults
          pagination={true}  // Enable pagination with defaults
          actions={{
            selection: { onDelete: deleteDashboards },
          }}
          urlState={true}
        >
          {/* Default toolbar renders automatically based on provider features */}
          <ContentListToolbar />
          <ContentListTable columns={defaultColumns} />
        </ContentListProvider>
      </ContentListPage.Section>
    </ContentListPage>
  );
}
```

**Result**: Full-featured listing with search, filters, sorting, pagination!

**Note**: `true` enables features with defaults. Pass an object to customize. Omit to disable.

---

### Pattern 2: Grid Layout with Custom Filters

```tsx
import { ContentListProvider, ContentList, Toolbar, Filters } from '@kbn/content-list';

function VisualizationLibrary() {
  return (
    <ContentListProvider
      entityName="visualization"
      entityNamePlural="visualizations"
      dataSource={{ findItems: findVisualizations }}
      search={true}
      sorting={true}
      filtering={{
        tags: true,
        // Add custom filter component
        custom: [{
          id: 'type',
          component: VisualizationTypeFilter,
        }],
      }}
    >
      {/* Smart default: Auto-renders SearchBox, Filters (Sort, Tags, + custom VisualizationTypeFilter) */}
      <ContentListToolbar />
      {/* Render as grid instead of table */}
      <ContentListGrid
        columns={3}
        item={{
          render: (item) => (
            <VisualizationCard visualization={item} />
          )
        }}
      />
    </ContentListProvider>
  );
}
```

---

### Pattern 3: Custom Table with Additional Content

```tsx
import { ContentListProvider, ContentList } from '@kbn/content-list';

function SavedObjectsListing() {
  return (
    <ContentListProvider
      entityName="saved object"
      entityNamePlural="saved objects"
      dataSource={{ findItems: findSavedObjects }}
      search={true}
      sorting={true}
      pagination={true}
    >
      {/* Custom banner above toolbar */}
      <EuiCallOut
        title="Import saved objects"
        iconType="importAction"
      >
        <p>You can also import saved objects from a file.</p>
        <EuiButton onClick={openImportModal}>Import</EuiButton>
      </EuiCallOut>
      
      <ContentListToolbar />
      
      <ContentListTable
        columns={[
          {
            field: 'type',
            name: 'Type',
            render: (type) => <ObjectTypeIcon type={type} />,
          },
          {
            field: 'namespaces',
            name: 'Spaces',
            render: (namespaces) => <SpacesBadges spaces={namespaces} />,
          },
        ]}
      />
      
      {/* Custom content below table */}
      <EuiText size="s" color="subdued">
        <p>Showing objects from all accessible spaces</p>
      </EuiText>
    </ContentListProvider>
  );
}
```

---

### Pattern 4: No Page Template (Embedded in Management)

```tsx
import { ContentListProvider, ContentList } from '@kbn/content-list';

function EmbeddedListing() {
  return (
    // No ContentListPage wrapper - just the components!
    <ContentListProvider
      entityName="index pattern"
      entityNamePlural="index patterns"
      dataSource={{ findItems: findIndexPatterns }}
      search={true}
      sorting={true}
      pagination={true}
      // No URL state for embedded usage
    >
      <ContentListToolbar />
      <ContentListTable columns={defaultColumns} />
    </ContentListProvider>
  );
}
```

---

### Pattern 5: Completely Custom (Maximum Flexibility)

```tsx
function AdvancedCustomListing() {
  return (
    <ContentListProvider
      entityName="report"
      entityNamePlural="reports"
      dataSource={{ findItems: findReports }}
      search={{ 
        queryParser: customReportQueryParser,
        debounceMs: 500,
      }}
      sorting={{
        options: customReportSortOptions,
        persist: true,
      }}
      actions={{
        selection: {
          onDelete: deleteReports,
          exportReports: exportReports,
        },
      }}
    >
      {/* Use hooks to build completely custom UI */}
      <CustomListingImplementation />
    </ContentListProvider>
  );
}

function CustomListingImplementation() {
  const { state } = useContentListState();
  const { setSearch } = useContentListActions();
  const { selectedItems, toggleSelection } = useContentListSelection();
  
  // Extract what you need from state
  const { items, isLoading } = state;
  
  return (
    <div>
      <MyCustomSearchBar onSearch={setSearch} />
      <MyCustomFilters />
      
      {isLoading ? (
        <MyCustomLoader />
      ) : (
        <MyCustomCardLayout
          items={items}
          selected={selectedItems}
          onSelect={toggleSelection}
        />
      )}
      
      <MyCustomPagination />
    </div>
  );
}
```

---

## ContentList Convenience Component

The `ContentList` convenience component wraps the common pattern for the 80% use case.

### Minimal Usage (6 props)

```tsx
import { ContentList } from '@kbn/content-list';

<ContentList
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems }}
  search={true}
  sorting={true}
  pagination={true}
/>
```

### With Actions (7 props)

```tsx
<ContentList
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems }}
  search={true}
  sorting={true}
  pagination={true}
  item={{
    actions: {
      onEdit: editDashboard,
    }
  }}
  actions={{
    onCreate: createDashboard,
  }}
/>
```

### With Custom Columns and Bulk Actions (8 props)

```tsx
<ContentList
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems }}
  search={true}
  sorting={true}
  pagination={true}
  actions={{
    selection: { onDelete },
  }}
  columns={customColumns}
/>
```

### Columns as Function - Add Custom Columns

```tsx
<ContentList
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems }}
  search={true}
  sorting={true}
  pagination={true}
  columns={(defaults) => [...defaults, myCustomColumn]}
/>
```

### Columns as Function - Reorder or Filter Defaults

```tsx
<ContentList
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems }}
  search={true}
  sorting={true}
  pagination={true}
  columns={(defaults) => [
    myCustomColumn,
    ...defaults.filter((col) => col.field !== 'updatedAt'),
  ]}
/>
```

### Full Featured

```tsx
<ContentList
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems }}
  search={{ initialQuery: 'test' }}
  sorting={{ defaultSort: { field: 'updatedAt', direction: 'desc' } }}
  filtering={{ tags: true, users: true, favorites: true }}
  pagination={{ initialPageSize: 20 }}
  urlState={true}
  item={{
    getHref: (item) => `/dashboard/${item.id}`,
    actions: {
      onClick: (item) => navigateTo(item.id),
      onEdit: editDashboard,
      onDuplicate: duplicateDashboard,
    },
  }}
  actions={{
    onCreate: createDashboard,
    selection: {
      onDelete,
      onExport: exportDashboards,
    },
  }}
  recentlyAccessed={recentlyAccessedService}
  columns={customColumns}
/>
```

### Custom Layout Using Children

```tsx
<ContentList
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems }}
  search={true}
  sorting={true}
  pagination={true}
>
  <MyCustomToolbar />
  <ContentListTable columns={(defaults) => [...defaults, myColumn]} />
  <MyCustomFooter />
</ContentList>
```

---

## Migration Examples for Current Consumers

These examples demonstrate migration patterns for 4 of the 6 current consumers, chosen to represent the range of complexity:
- **Maps** - Simple case with minimal customization
- **Files** - Embedded usage with custom actions
- **Dashboard** - Complex case with many features
- **Visualizations** - Tabbed variant with content editor

The remaining consumers (Graph, Event Annotations) follow similar patterns and can use these as templates.

### Migration 1: Maps (Simple Case)

**Before** (Current implementation):

```tsx
<TableListView<MapUserContent>
  id="map"
  headingId="mapsListingPage"
  onCreate={isReadOnly ? undefined : navigateToNewMap}
  findItems={findMaps}
  onDelete={isReadOnly ? undefined : deleteMaps}
  initialFilter={''}
  initialPageSize={initialPageSize}
  entityName="map"
  entityNamePlural="maps"
  title={APP_NAME}
  getOnClickTitle={({ id }) => () => history.push(getEditPath(id))}
/>
```

**After** (New composable approach - even simpler!):

```tsx
<ContentListPage>
  <ContentListPage.Header>
    <Header title={APP_NAME} />
  </ContentListPage.Header>
  
  <ContentListPage.Section>
    <ContentListProvider
      id="map"
      entityName="map"
      entityNamePlural="maps"
      dataSource={{ findItems: findMaps }}
      search={true}  // Enable search with defaults
      pagination={{ initialPageSize }}
      isReadOnly={isReadOnly}  // Automatically disables all actions if true
      item={{
        actions: {
          onClick: ({ id }) => history.push(getEditPath(id)),
          onEdit: editMap,
        }
      }}
      actions={{
        onCreate: navigateToNewMap,
        selection: { onDelete: deleteMaps },
      }}
    >
      <ContentListToolbar />
      <ContentListTable columns={defaultColumns} />
    </ContentListProvider>
  </ContentListPage.Section>
</ContentListPage>
```

**Benefits**: Cleaner, more readable, same functionality

> **Note on Content Editing**: The inline metadata editor (used by Dashboard and Visualizations) is now a separate integration. Consumers who want inline editing can use the `useOpenContentEditor()` hook. See [LISTING_COMPONENT.md](./LISTING_COMPONENT.md#inline-metadata-editing) for complete integration details.

---

### Migration 2: Files Management (Embedded + Custom Actions)

**Before** (Current - requires hacks):

```tsx
<TableListView<FilesUserContentSchema>
  title={title}
  description={description}
  titleColumnName="File"
  emptyPrompt={<EmptyPrompt />}
  entityName="file"
  entityNamePlural="files"
  findItems={findFiles}
  customTableColumn={{
    name: 'Size',
    field: 'attributes.size',
    render: (value) => numeral(value).format('0[.]0 b'),
    sortable: true,
  }}
  getOnClickTitle={({ attributes }) => () => setSelectedFile(attributes)}
  deleteItems={deleteFiles}
  withoutPageTemplateWrapper  // Deprecated hack
  additionalRightSideActions={[  // Limited to 2
    <EuiButtonEmpty onClick={() => setShowDiagnostics(true)}>
      Diagnostics
    </EuiButtonEmpty>,
  ]}
  rowItemActions={({ attributes }) => ({
    delete: getFileKindDefinition(attributes.fileKind)?.managementUiActions?.delete,
  })}
/>
```

**After** (Clean embedded usage):

```tsx
{/* No page template wrapper needed - just use the components! */}
<ContentListProvider
  entityName="file"
  entityNamePlural="files"
  dataSource={{ findItems: findFiles }}
  search={true}  // Enable search
  sorting={true}  // Enable sorting
  pagination={true}
  item={{
    actions: {
      onClick: ({ attributes }) => setSelectedFile(attributes)
    }
  }}
  actions={{
    selection: { onDelete: deleteFiles },
  }}
>
  {/* Custom header with unlimited actions */}
  <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
    <EuiFlexItem grow={false}>
      <EuiTitle><h1>{title}</h1></EuiTitle>
      <EuiText size="s" color="subdued">{description}</EuiText>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiFlexGroup gutterSize="s">
        <EuiFlexItem><Toolbar.BulkActions /></EuiFlexItem>
        <EuiFlexItem>
          <EuiButtonEmpty onClick={() => setShowDiagnostics(true)}>
            Diagnostics
          </EuiButtonEmpty>
        </EuiFlexItem>
        {/* Add more actions as needed! */}
      </EuiFlexGroup>
    </EuiFlexItem>
  </EuiFlexGroup>
  
  <ContentListToolbar />
  
  <ContentListTable
    columns={[
      {
        name: 'Size',
        field: 'attributes.size',
        render: (value) => numeral(value).format('0[.]0 b'),
        sortable: true,
      },
    ]}
    builtInColumns={{ 
      name: { columnTitle: 'File' } 
    }}
    row={{
      actions: (item) => {
        const definition = getFileKindDefinition(item.attributes.fileKind);
        return definition?.managementUiActions?.delete?.enabled ? ['delete'] : [];
      }
    }}
    emptyState={<EmptyPrompt />}
  />
</ContentListProvider>

{/* Flyouts managed separately as before */}
{showDiagnostics && <DiagnosticsFlyout onClose={() => setShowDiagnostics(false)} />}
{selectedFile && <FileFlyout file={selectedFile} onClose={() => setSelectedFile(undefined)} />}
```

**Benefits**: No deprecated hack, unlimited actions, better control over layout

---

### Migration 3: Dashboard (Complex with Many Features)

**Before** (Current - abbreviated here):

```tsx
// Complex setup code in useDashboardListingTable hook...
const tableListViewTableProps = useMemo(() => ({
  contentEditor: {
    isReadonly: !showWriteControls,
    onSave: updateItemMeta,
    customValidators: contentEditorValidators,
  },
  createItem: !showWriteControls || !showCreateButton ? undefined : createItem,
  deleteItems: !showWriteControls ? undefined : deleteItems,
  editItem: !showWriteControls ? undefined : editItem,
  emptyPrompt,
  entityName,
  entityNamePlural,
  findItems,
  getDetailViewLink,
  headingId,
  id: dashboardListingId,
  initialFilter,
  initialPageSize,
  listingLimit,
  onFetchSuccess,
  setPageDataTestSubject,
  title,
  urlStateEnabled,
  createdByEnabled: true,
  recentlyAccessed: getDashboardRecentlyAccessedService(),
}), [/* 15 dependencies */]);

// In render:
<TableListView {...tableListViewTableProps}>
  <DashboardUnsavedListing />
</TableListView>
```

**After** (Cleaner separation of concerns):

```tsx
<ContentListPage>
  <ContentListPage.Header>
    <Header title={title}>
      <Header.Right>
        <EuiButton onClick={createItem}>Create dashboard</EuiButton>
      </Header.Right>
    </Header>
  </ContentListPage.Header>
  
  <ContentListPage.Section>
    <ContentListProvider
      id="dashboard"
      entityName="dashboard"
      entityNamePlural="dashboards"
      dataSource={{ 
        findItems,
        onFetchSuccess,
      }}
      search={{ 
        initialQuery: initialFilter,
      }}
      sorting={{
        persist: true,
      }}
      pagination={true}
      urlState={true}
      filtering={{
        tags: true,
        users: true,
        favorites: true,
      }}
      isReadOnly={!showWriteControls}  // Automatically disables all actions
      item={{
        getHref: getDetailViewLink,
        actions: {
          onEdit: editItem,
        }
      }}
      actions={{
        onCreate: createItem,
        selection: { onDelete: deleteItems },
      }}
      recentlyAccessed={getDashboardRecentlyAccessedService()}
    >
      {/* Custom content above toolbar */}
      <DashboardUnsavedListing />
      
      {/* Smart default: Auto-renders SearchBox, Filters (Sort, Tags, Users, Favorites), BulkActions */}
      <ContentListToolbar />
      
      <ContentListTable
        columns={defaultColumns}
        emptyState={emptyPrompt}
      />
    </ContentListProvider>
  </ContentListPage.Section>
</ContentListPage>
```

**Benefits**: Clearer structure, easier to understand, easier to modify

---

### Migration 4: Visualizations (Tabbed Variant)

**Before** (Current - uses TabbedTableListView):

```tsx
// Complex tab definition
const visualizeTab: TableListTab<VisualizeUserContent> = {
  title: 'Visualizations',
  id: 'visualizations',
  getTableList: (propsFromParent) => (
    <>
      <EuiCallOut title={calloutMessage} />
      <EuiSpacer size="m" />
      <div css={styles.table}>
        <TableListViewTable<VisualizeUserContent>
          id="vis"
          customTableColumn={getCustomColumn()}
          customSortingOptions={getCustomSortingOptions()}
          entityName="visualization"
          entityNamePlural="visualizations"
          {...tableViewProps}
          {...propsFromParent}
        />
      </div>
    </>
  ),
};

<TabbedTableListView
  headingId="visualizeListingHeading"
  title={title}
  tabs={[visualizeTab, ...registryTabs]}
  activeTabId={activeTab}
  changeActiveTab={changeTab}
/>
```

**After** (Built-in tab support):

```tsx
<ContentListPage>
  <ContentListPage.Header>
    <Header title="Visualize library" initialTab="visualizations">
      {/* Tabs defined as compound components - state managed automatically */}
      <Header.Tab id="visualizations" label="Visualizations">
        {/* Tab content auto-rendered when active */}
        <EuiCallOut title="Building a dashboard?..." />
        <EuiSpacer size="m" />
        
        <ContentListProvider
          id="vis"
          entityName="visualization"
          entityNamePlural="visualizations"
          dataSource={{ findItems }}
          search={true}
          sorting={{ 
            options: customSortingOptions,
          }}
          filtering={{
            tags: true,
          }}
          item={{
            getHref: getVisualizeListItemLink,
            actions: {
              onClick: (item) => 
                !item.attributes.readOnly && !item.error && editItem?.(item),
              onEdit: editItem,
            }
          }}
          actions={{
            onCreate: createNewVis,
            selection: { onDelete: deleteItems },
          }}
        >
          {/* Smart default: Auto-renders SearchBox, Filters (Sort, Tags), BulkActions */}
          <ContentListToolbar />
          
          <ContentListTable
            columns={[getCustomColumn()]}
            emptyState={noItemsFragment}
          />
        </ContentListProvider>
      </Header.Tab>
      
      {/* Dynamic tabs from registry */}
      {registryTabs.map(tab => (
        <Header.Tab key={tab.id} id={tab.id} label={tab.title}>
          <tab.Component />
        </Header.Tab>
      ))}
    </Header>
  </ContentListPage.Header>
</ContentListPage>
```

**Benefits**: No special tabbed variant needed, standard page template, easier customization

---

## Smart Defaults in Action

### Zero Config

Components auto-render based on provider features:

```tsx
<ContentListProvider
  search={true}
  sorting={true}
  filtering={{ tags: true, users: true }}
  actions={{
    selection: { onDelete },
  }}
  pagination={true}
  {...}
>
  <ContentListToolbar />  {/* Auto-renders: SearchBox, Filters (Sort, Tags, Users), BulkActions */}
  <ContentListTable />
  <ContentListFooter />   {/* Auto-renders: Pagination */}
</ContentListProvider>
```

### Explicit Override

Override defaults with custom structure:

```tsx
<ContentListToolbar>
  <Toolbar.SearchBox />
  <Toolbar.Filters>
    <Filters.SortSelect />
    <Filters.TagFilter />
  </Toolbar.Filters>
  <Toolbar.Button iconType="inspect" onClick={handleDiagnostics}>
    Diagnostics
  </Toolbar.Button>
  <Toolbar.BulkActions />
</ContentListToolbar>
```

### Advanced Custom Positioning

Custom positioning with EuiFlexGroup:

```tsx
<ContentListToolbar>
  <EuiFlexGroup justifyContent="spaceBetween" gutterSize="s" alignItems="center">
    <EuiFlexItem grow={false}>
      <Toolbar.SearchBox />
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiFlexGroup gutterSize="s" alignItems="center">
        <EuiFlexItem grow={false}>
          <Toolbar.Button onClick={handleExport}>Export</Toolbar.Button>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <Toolbar.BulkActions />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  </EuiFlexGroup>
</ContentListToolbar>
```

---

## Package Import Strategies

### Strategy 1: Granular (Best Tree-Shaking)

Only imports table + provider for lightweight embeds:

```tsx
import { ContentListProvider } from '@kbn/content-list-provider';
import { ContentListTable } from '@kbn/content-list-table';

// Minimal bundle - embedded, no toolbar
```

### Strategy 2: Barrel Export (Convenience)

Single component that wraps provider + table + toolbar + footer:

```tsx
import { ContentList } from '@kbn/content-list';

// Convenient for standard lists
```

### Strategy 3: Mixed (Balance)

```tsx
import { ContentListProvider } from '@kbn/content-list';
import { MyCustomTable } from './custom_table';

// Use provider with custom UI
```

### Strategy 4: Custom UI with Standard State Management

Provider + services + types only for custom implementations:

```tsx
import { ContentListProvider, useContentListState } from '@kbn/content-list-provider';
import { parseQuery } from '@kbn/content-list-services';

// Build completely custom UI using hooks
```

---

## Expandable Row Details

The `ContentListTable` component supports expandable rows for displaying additional content. The Name column already shows title, description, and tags inline, so expandable rows are ideal for error details, extended metadata, previews, or any custom content.

### Simple Inline

Basic inline expandable content:

```tsx
import { ContentListProvider } from '@kbn/content-list-provider';
import { ContentListTable } from '@kbn/content-list-table';

<ContentListProvider
  entityName="document"
  entityNamePlural="documents"
  dataSource={{ findItems: findDocuments }}
>
  <ContentListTable
    renderDetails={(item) => (
      <EuiText size="s">{item.additionalInfo}</EuiText>
    )}
  />
</ContentListProvider>
```

### Dashboard with Error Details

Extract render function for reusability and maintainability:

```tsx
import { EuiCallOut, EuiButton } from '@elastic/eui';

// Extracted render function
const renderDashboardError = (item) => {
  if (!item.error) return null;
  
  return (
    <EuiCallOut title="Dashboard Load Error" color="danger" iconType="error">
      <p>{item.error.message}</p>
      <EuiSpacer size="s" />
      <EuiButton size="s" onClick={() => retryLoad(item.id)}>
        Retry Loading
      </EuiButton>
    </EuiCallOut>
  );
};

// Use in table
<ContentListProvider
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems: findDashboards }}
>
  <ContentListTable renderDetails={renderDashboardError}>
    <Column.Name />
    <Column.UpdatedAt />
    <Column.Actions>
      <Action.Edit />
      <Action.Delete />
    </Column.Actions>
  </ContentListTable>
</ContentListProvider>
```

### File Listing with Metadata

Display extended metadata in a structured format:

```tsx
import { EuiDescriptionList } from '@elastic/eui';
import numeral from '@elastic/numeral';

<ContentListProvider
  entityName="file"
  entityNamePlural="files"
  dataSource={{ findItems: findFiles }}
>
  <ContentListTable
    renderDetails={(item) => {
      const showSize = item.fileType !== 'folder';
      
      return (
        <div style={{ padding: 16 }}>
          <EuiDescriptionList
            type="column"
            compressed
            listItems={[
              { title: 'File Type', description: item.fileType },
              ...(showSize ? [{ 
                title: 'Size', 
                description: numeral(item.size).format('0[.]0 b')
              }] : []),
              { title: 'Location', description: item.path },
              { title: 'Modified', description: formatDate(item.updatedAt) },
              { title: 'Owner', description: item.owner },
            ]}
          />
        </div>
      );
    }}
  />
</ContentListProvider>
```

### Conditional Expansion

Only expand rows when certain conditions are met:

```tsx
import { EuiCallOut } from '@elastic/eui';

<ContentListProvider
  entityName="visualization"
  entityNamePlural="visualizations"
  dataSource={{ findItems: findVisualizations }}
>
  <ContentListTable
    renderDetails={(item) => {
      // Only expand rows that have warnings
      if (!item.warnings?.length) return null;
      
      return (
        <EuiCallOut title="Warnings" color="warning" iconType="warning">
          <ul>
            {item.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </EuiCallOut>
      );
    }}
  />
</ContentListProvider>
```

### Complex Content Preview

Render rich preview content with multiple sections:

```tsx
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiDescriptionList } from '@elastic/eui';

const renderVisualizationPreview = (item) => {
  if (!item.visualization) return null;
  
  return (
    <div style={{ padding: 16 }}>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiText size="s">
            <h4>Visualization Preview</h4>
          </EuiText>
          <EuiSpacer size="s" />
          <VisualizationRenderer
            config={item.visualization.config}
            data={item.visualization.sampleData}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
          <EuiDescriptionList
            compressed
            listItems={[
              { title: 'Chart Type', description: item.visualization.type },
              { title: 'Data Source', description: item.visualization.dataSource },
              { title: 'Last Updated', description: formatDate(item.updatedAt) },
            ]}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};

<ContentListProvider
  entityName="visualization"
  entityNamePlural="visualizations"
  dataSource={{ findItems: findVisualizations }}
>
  <ContentListTable renderDetails={renderVisualizationPreview}>
    <Column.Name />
    <Column.UpdatedAt />
  </ContentListTable>
</ContentListProvider>
```

**Key Points:**

- The Name column already displays title, description, and tags inline
- Use expandable rows for **additional** content beyond what's in the Name column
- Return `null` from renderDetails to conditionally prevent expansion
- Extract render functions for reusability and testing
- Full access to item data and context for custom logic

---

## Related Documents

- **[proposals/PROPOSAL_CONTENT_LIST_PAGE.md](./proposals/PROPOSAL_CONTENT_LIST_PAGE.md)** - High-level architecture and rationale
- **[LISTING_PAGE.md](./LISTING_PAGE.md)** - ContentListPage component specification
- **[LISTING_COMPONENT.md](./LISTING_COMPONENT.md)** - ContentListProvider & components specification
- **[PLAN.md](./PLAN.md)** - Phased implementation plan

