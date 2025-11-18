# Content List Component Architecture

This directory contains planning documentation for the `ContentList` architecture, a composable replacement for the monolithic `TableListView`.

> [!NOTE]
> These are **planning documents** for the architecture and implementation. For consumer-facing API documentation, see the README files in each package (e.g., `kbn-content-list-provider/README.md`).

---

## Document Map

### Where to Start

| If you want to... | Read this |
|-------------------|-----------|
| Understand the overall architecture and why we're building this | [proposals/PROPOSAL_CONTENT_LIST_PAGE.md](./proposals/PROPOSAL_CONTENT_LIST_PAGE.md) |
| See code examples and usage patterns | [RECIPES.md](./RECIPES.md) |
| Understand the implementation phases | [PLAN.md](./PLAN.md) |

### Component Specifications

| Document | Purpose |
|----------|---------|
| [LISTING_COMPONENT.md](./LISTING_COMPONENT.md) | Specifies UI components: Table, Grid, Toolbar, Footer, and their APIs |
| [LISTING_PROVIDER.md](./LISTING_PROVIDER.md) | Specifies the provider: context, state management, reducer, hooks |
| [LISTING_PAGE.md](./LISTING_PAGE.md) | Specifies the optional page wrapper component |

### Architecture Decisions

| Document | Purpose |
|----------|---------|
| [reference/ANALYSIS_DEFAULTS.md](./reference/ANALYSIS_DEFAULTS.md) | Analyzes which features can use `true` for defaults vs requiring config |
| [reference/ANALYSIS_HEADLESS.md](./reference/ANALYSIS_HEADLESS.md) | Documents the decision to use component-based vs headless architecture |

### Reference Material

Analysis of the existing `TableListView` that informs the new design:

| Document | Purpose |
|----------|---------|
| [reference/CURRENT_USAGE.md](./reference/CURRENT_USAGE.md) | Analyzes where and how TableListView is used |
| [reference/CURRENT_FEATURES.md](./reference/CURRENT_FEATURES.md) | Complete inventory of 27 end-user features |
| [reference/CURRENT_IMPL.md](./reference/CURRENT_IMPL.md) | Technical implementation details |
| [reference/CURRENT_DEV_HISTORY.md](./reference/CURRENT_DEV_HISTORY.md) | Historical bug fixes and enhancements |

### Proposals

| Document | Purpose |
|----------|---------|
| [proposals/PROPOSAL_CONTENT_LIST_PAGE.md](./proposals/PROPOSAL_CONTENT_LIST_PAGE.md) | Architecture proposal with design principles and rationale |
| [proposals/PROPOSAL_CREATOR.md](./proposals/PROPOSAL_CREATOR.md) | Proposal for creator column integration |

---

## Package Structure

The ContentList architecture is organized into multiple packages within `content_list/`:

```
content_list/
├── kbn-content-list-docs/      # Planning docs (this directory) + Storybook stories
├── kbn-content-list-provider/  # State management and context
├── kbn-content-list-table/     # Table view component
├── kbn-content-list-toolbar/   # Toolbar (search, filters, bulk actions)
├── kbn-content-list-mocks/     # Test utilities and mock data
├── kbn-content-list-grid/      # Grid view component
├── kbn-content-list-footer/    # Footer and pagination
├── kbn-content-list-page/      # Optional page wrapper
└── kbn-content-list/           # Main barrel export package
```

---

## Quick Start Example

```tsx
import { ContentListProvider } from '@kbn/content-list-provider';
import { ContentListTable } from '@kbn/content-list-table';
import { ContentListToolbar } from '@kbn/content-list-toolbar';

<ContentListProvider
  entityName="dashboard"
  entityNamePlural="dashboards"
  dataSource={{ findItems: fetchDashboards }}
  item={{
    actions: {
      onEdit: (item) => editDashboard(item.id),
      onDelete: (item) => deleteDashboard(item.id),
    }
  }}
>
  <ContentListToolbar />
  <ContentListTable />
</ContentListProvider>
```

For comprehensive examples, see [RECIPES.md](./RECIPES.md).

---

## Related Documentation

- **Package READMEs** - Consumer API documentation in each package
- **Storybook** - Interactive examples in `kbn-content-list-docs/*.stories.tsx`
