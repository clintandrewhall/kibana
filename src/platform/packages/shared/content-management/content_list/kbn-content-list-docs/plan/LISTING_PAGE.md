# ContentListPage Component

## Document Purpose

This document specifies the `ContentListPage` component, an optional page-level wrapper that provides consistent layout patterns for content listing pages.

**Related Documents:**
- **[LISTING_COMPONENT.md](./LISTING_COMPONENT.md)** - Core list component specifications
- **[LISTING_PROVIDER.md](./LISTING_PROVIDER.md)** - Provider implementation details
- **[RECIPES.md](./RECIPES.md)** - Usage examples
- **[PLAN.md](./PLAN.md)** - Implementation phases

---

## Overview

`ContentListPage` is an **optional** page-level wrapper component that provides a consistent layout structure for content list pages across Kibana. It uses `KibanaPageTemplate` patterns and provides slots for headers, tabs, and content sections.

**Key Points:**
- Optional - you can use `ContentListProvider` without it
- Provides consistent page layout patterns
- Handles breadcrumbs, headers, and tabs
- Uses compound components for flexible composition

---

## Component Hierarchy

```
ContentListPage (optional layout wrapper)
├── ContentListPage.Header
│   └── Header (title, description, actions, tabs)
│       ├── Header.Right (action buttons)
│       ├── Header.Bottom (bottom content)
│       └── Header.Tab (tab definitions)
└── ContentListPage.Section (content area)
    └── [Your content - typically ContentListProvider]
```

---

## Components

### ContentListPage

```tsx
interface ContentListPageProps {
  // Standard Kibana page template props
  restrictWidth?: boolean | number;
  grow?: boolean;
  offset?: number;
  paddingSize?: 's' | 'm' | 'l' | 'none';
  
  children: ReactNode;
}

// Sub-components
ContentListPage.Header = ({ children }: { children: ReactNode }) => children;
ContentListPage.Section = ({ children }: { children: ReactNode }) => children;
```

**Purpose**: Optional layout wrapper using KibanaPageTemplate patterns with composable slots

**Usage:**

```tsx
<ContentListPage restrictWidth={1200}>
  <ContentListPage.Header>
    <Header title="Dashboards">
      <Header.Right>
        <EuiButton>Create dashboard</EuiButton>
      </Header.Right>
    </Header>
  </ContentListPage.Header>
  
  <ContentListPage.Section>
    {/* Your listing components */}
  </ContentListPage.Section>
</ContentListPage>
```

---

## Hooks

### useContentListPage

Access to ContentListPage context, primarily for tab state when using tabbed layouts.

```tsx
import { useContentListPage } from '@kbn/content-list-page';

interface ContentListPageContext {
  activeTab?: string;
  setActiveTab: (tabId: string) => void;
}

function useContentListPage(): ContentListPageContext;
```

**Usage:**

```tsx
function CustomTabContent() {
  const { activeTab, setActiveTab } = useContentListPage();
  
  // Access current tab
  console.log('Active tab:', activeTab);
  
  // Programmatically switch tabs
  const switchToSettings = () => setActiveTab('settings');
  
  return <div>Current tab: {activeTab}</div>;
}

// Used within ContentListPage.Header.Tab children
<Header.Tab id="visualizations" label="Visualizations">
  <CustomTabContent />
</Header.Tab>
```

**When to use:**
- Reading active tab state in child components
- Programmatically switching tabs from within tab content
- Conditional rendering based on which tab is active

**Note:** This hook must be called within a `ContentListPage` component tree. It will throw an error if used outside this context.

---

### Header

```tsx
interface HeaderProps {
  title: ReactNode;
  description?: ReactNode;
  
  // Optional breadcrumbs integration
  breadcrumbs?: EuiBreadcrumb[];
  
  // Tab support (for tabbed listings like Visualizations)
  // Tabs are defined and managed automatically via compound components
  initialTab?: string;  // Optional: specify initial active tab (before URL or first tab)
  
  // Compound component slots via children
  children?: ReactNode;
}

// Compound components for slot positioning
Header.Right = ({ children }: { children: ReactNode }) => children;
Header.Bottom = ({ children }: { children: ReactNode }) => children;

// Tab definition (automatically manages state internally)
Header.Tab = ({ 
  id: string;
  label: ReactNode;
  isDisabled?: boolean;
  children: ReactNode;  // Tab content
}) => children;
```

**Tab State Management:**

When using tabs, the `Header` component automatically:
- Manages active tab state internally
- Syncs tab state to URL (query param: `tab=<id>`)
- Provides active tab via context to children
- Only renders content for the active tab

Access active tab state via hook:
```tsx
const { activeTab } = useContentListPage();
```

**Usage:**

```tsx
// With right actions
<Header title="Dashboards" description="Manage dashboards">
  <Header.Right>
    <EuiButton onClick={createDashboard}>Create dashboard</EuiButton>
    <EuiButton onClick={importDashboard}>Import</EuiButton>
  </Header.Right>
</Header>

// Without right actions (default: no right-side content)
<Header title="Dashboards" description="Manage dashboards" />

// With tabs - state managed automatically
<Header title="Visualize library" initialTab="visualizations">
  <Header.Tab id="visualizations" label="Visualizations">
    <VisualizationsContent />
  </Header.Tab>
  <Header.Tab id="lens" label="Lens">
    <LensContent />
  </Header.Tab>
  <Header.Tab id="maps" label="Maps">
    <MapsContent />
  </Header.Tab>
</Header>
```

**Slot Behavior:**
- `Right` slot omitted → No right-side content (default)
- `Bottom` slot omitted → No bottom content (default)
- Both omitted → Just title and description

**Tab Behavior:**
- Tabs automatically manage state internally
- Active tab syncs to URL (`?tab=visualizations`)
- Only active tab content is rendered
- `initialTab` sets the starting tab (falls back to first tab or URL param)

**Purpose**: Page header with title, description, actions, and optional tabs using compound components

---

## Complete Examples

### Simple Listing Page

```tsx
<ContentListPage>
  <ContentListPage.Header>
    <Header title="Dashboards" description="Create and manage dashboards">
      <Header.Right>
        <EuiButton iconType="plusInCircle" onClick={createDashboard}>
          Create dashboard
        </EuiButton>
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
      <ContentListTable />
      <ContentListFooter />
    </ContentListProvider>
  </ContentListPage.Section>
</ContentListPage>
```

### Tabbed Listing Page

```tsx
<ContentListPage>
  <ContentListPage.Header>
    <Header title="Visualize library" initialTab="visualizations">
      {/* Tab 1: Visualizations */}
      <Header.Tab id="visualizations" label="Visualizations">
        <EuiCallOut title="Building a dashboard?" iconType="iInCircle">
          <p>Consider using Lens for most visualizations.</p>
        </EuiCallOut>
        <EuiSpacer size="m" />
        
        <ContentListProvider
          id="vis"
          entityName="visualization"
          entityNamePlural="visualizations"
          dataSource={{ findItems: findVisualizations }}
          search={true}
          sorting={true}
          item={{
            actions: { onEdit: editItem },
          }}
          actions={{
            onCreate: createNewVis,
            selection: { onDelete: deleteItems },
          }}
        >
          <ContentListToolbar />
          <ContentListTable />
        </ContentListProvider>
      </Header.Tab>
      
      {/* Tab 2: Lens */}
      <Header.Tab id="lens" label="Lens">
        <LensListingContent />
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

### Embedded Usage (No Page Wrapper)

You don't need `ContentListPage` at all - use `ContentListProvider` directly:

```tsx
// Embedded in a flyout, modal, or custom layout
<EuiFlyout onClose={onClose}>
  <EuiFlyoutHeader>
    <EuiTitle><h2>Select an index pattern</h2></EuiTitle>
  </EuiFlyoutHeader>
  
  <EuiFlyoutBody>
    <ContentListProvider
      entityName="index pattern"
      entityNamePlural="index patterns"
      dataSource={{ findItems: findIndexPatterns }}
      search={true}
      sorting={true}
    >
      <ContentListToolbar />
      <ContentListTable />
    </ContentListProvider>
  </EuiFlyoutBody>
</EuiFlyout>
```

---

## When to Use ContentListPage

**Use `ContentListPage` when:**
- Building a full-page listing view
- Need consistent page layout with Kibana standards
- Want built-in breadcrumb and header support
- Using tabs to organize multiple lists

**Don't use `ContentListPage` when:**
- Embedding a list in a flyout, modal, or popover
- Building a custom layout with unique requirements
- Creating a dashboard widget or embedded component
- Need complete control over page structure

In these cases, use `ContentListProvider` directly with your own layout.

---

## Integration with KibanaPageTemplate

`ContentListPage` is a thin wrapper around `KibanaPageTemplate` and respects all its standard props:

- `restrictWidth` - Limit page width
- `grow` - Allow content to grow
- `paddingSize` - Control page padding
- Breadcrumbs via `Header` component
- Page header via `Header` component

This ensures consistency with other Kibana pages while providing listing-specific patterns.

---

## See Also

- **[LISTING_COMPONENT.md](./LISTING_COMPONENT.md)** - Complete documentation for `ContentListProvider` and all listing components
- **[reference/CURRENT_USAGE.md](./reference/CURRENT_USAGE.md)** - Analysis of the existing `TableListView` implementation
- **[reference/ANALYSIS_DEFAULTS.md](./reference/ANALYSIS_DEFAULTS.md)** - Feature defaults and uiSettings integration strategy

