# `@kbn/data-grid` Research

Preliminary research for a new `@kbn/data-grid` package that composes [TanStack Table](https://tanstack.com/table/latest) (headless logic and state) with [EUI](https://eui.elastic.co/) presentation components. The goal is to address long-standing limitations in `EuiDataGrid` -- particularly around virtualization, column pinning, and extensibility -- while maintaining visual consistency with the Elastic design system.

This is not a proposal to replace every `EuiDataGrid` in Kibana. Many grids are well-served by the current component and would stay on it. The focus is on high-complexity consumers like Discover, Security Timeline, and Alerts tables, where `EuiDataGrid`'s architectural constraints have become a bottleneck.

## Documents

### [01-usage-inventory.md](./01-usage-inventory.md)

Where `EuiDataGrid` is used across Kibana. Identifies 7 wrapper abstraction layers (`UnifiedDataTable`, `AlertsDataGrid`, `DataTableComponent`, etc.), ~20 direct usages, and ~57 total consumer locations. Includes a full dependency chain diagram showing how changes propagate.

### [02-feature-inventory.md](./02-feature-inventory.md)

Detailed inventory of every `EuiDataGrid` feature utilized by `UnifiedDataTable` and Discover, organized into 17 categories: column schema, display, and actions; cell rendering, popovers, and context; row heights; toolbar controls; grid styling; pagination; sorting; virtualization; control columns; and extended features like in-table search and document comparison. Documents 30+ consumer-configurable props and identifies which are hardcoded vs exposed.

### [03-issues-and-bugs.md](./03-issues-and-bugs.md)

Open and closed issues across `elastic/eui` and `elastic/kibana`. Catalogs 85 open issues spanning rendering bugs (row overlap, infinite height), performance, accessibility, DnD, and missing features. Highlights blocked issues where Kibana teams are waiting on upstream EUI fixes, and long-standing requests dating back to 2020.

### [04-feature-requests.md](./04-feature-requests.md)

Feature requests organized by theme: layout and scrolling (sticky columns, smooth scrolling), editing and interaction (cell editing, keyboard copy), data display (row summary, color breakdown), state management (column persistence), and search/filtering. Maps each request to TanStack Table capabilities and references the EUI team's own investigation epic ([elastic/eui#8859](https://github.com/elastic/eui/issues/8859)).

### [05-feature-matrix.md](./05-feature-matrix.md)

Side-by-side comparison of `EuiDataGrid` and TanStack Table + EUI across core logic, rendering, toolbar controls, styling, and accessibility. Includes LOE estimates (14-21 weeks baseline), risk assessment, guidance on when to use `@kbn/data-grid` vs stay on `EuiDataGrid`, and projections for agent-accelerated development (9-15 weeks).

### [06-assembly-pattern.md](./06-assembly-pattern.md)

How the [assembly pattern](../src/platform/packages/shared/content-management/content_list/kbn-content-list-assembly/README.md) from `@kbn/content-list-assembly` could shape the `@kbn/data-grid` consumer API. Replaces the 30+ prop surface with declarative JSX children (`<Column.Timestamp>`, `<Toolbar.SortSelector>`, `<CellAction.FilterIn>`), where JSX order is rendering order. Reduces toolbar and migration adapter LOE, and provides a combined estimate of 8-14 weeks with assembly pattern + agent assistance.

## Key Findings

- **~57 consumer locations** across Kibana depend on `EuiDataGrid`, most through 7 wrapper abstraction layers.
- **`UnifiedDataTable`** is the most important wrapper, used by Discover, ES|QL, Security Timeline, Cloud Security, and SLO. It is also the surface most constrained by current limitations.
- The largest pain points are **rendering/layout bugs** (row overlap, infinite height in flex containers), **performance** (virtualization limitations via `react-window` v1), and **missing features** (sticky columns, cell editing, smooth scrolling).
- **21 open issues** exist on `elastic/eui` for `EuiDataGrid`, plus **14 open issues** on `elastic/kibana` and **50+ `UnifiedDataTable` issues**.
- TanStack Table provides **native solutions** for many of the most-requested features (column pinning, row pinning, global filtering, column ordering) and a more flexible architecture for custom features.
- The EUI team has opened [#8859](https://github.com/elastic/eui/issues/8859), their own epic acknowledging that the current architecture "limits us quite heavily" and explicitly investigating TanStack Table as a replacement for internal logic.
- A new `@kbn/data-grid` package is feasible but large-scope. Baseline LOE is **14-21 weeks**, reducible to **8-14 weeks** with the assembly pattern and agent assistance. Migration should be opt-in and incremental.

## Related

- [elastic/eui#8859](https://github.com/elastic/eui/issues/8859) -- EUI team's epic investigating the long-term plan for `EuiDataGrid`, including TanStack Table integration.
- [elastic/eui#2839](https://github.com/elastic/eui/issues/2839) -- Sticky columns request (open since 2020).
- [elastic/kibana#255200](https://github.com/elastic/kibana/issues/255200) -- Investigation: support very large datasets in Kibana.
- [`@kbn/content-list-assembly`](../src/platform/packages/shared/content-management/content_list/kbn-content-list-assembly/README.md) -- The assembly pattern implementation.
- [`@kbn/unified-data-table`](../src/platform/packages/shared/kbn-unified-data-table/) -- The current primary `EuiDataGrid` wrapper for Discover and related consumers.
