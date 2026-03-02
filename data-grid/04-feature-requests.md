# EuiDataGrid Feature Requests

This document catalogs open and notable closed feature requests for `EuiDataGrid` across both `elastic/eui` and `elastic/kibana`, establishing unmet needs and enhancement pressure.

## Open Feature Requests in `elastic/eui`

### High Priority (Actively Needed by Kibana)

| Issue | Title | Age | Requested By |
|-------|-------|-----|-------------|
| [#2839](https://github.com/elastic/eui/issues/2839) | **Allow sticky columns** | 2020-02 (6 years) | Multiple Kibana teams. Fundamental layout capability that `react-window` prevents. |
| [#8830](https://github.com/elastic/eui/issues/8830) | **Support single cell editing** | 2025-06 | Design decision pending. Would enable inline editing workflows in Discover and other grids. |
| [#8002](https://github.com/elastic/eui/issues/8002) | **Add Row Summary** | 2024-09 | Aggregate/summary row at bottom of grid. Used by analytics and ML workflows. |
| [#8615](https://github.com/elastic/eui/issues/8615) | **Make `EuiDataGridCellActions` reusable outside `EuiDataGrid`** | 2025-04 | Requested for standalone cell action menus. |
| [#8656](https://github.com/elastic/eui/issues/8656) | **Investigate smooth scrolling** | 2025-04 | UX quality improvement. Current `react-window` scrolling is janky. |
| [#9182](https://github.com/elastic/eui/issues/9182) | **Update to `react-window` v2** | 2025-11 | Tech debt. v1 is unmaintained and limits architecture. |

### Medium Priority

| Issue | Title | Age |
|-------|-------|-----|
| [#8745](https://github.com/elastic/eui/issues/8745) | Allow control over column actions in columns popover | 2025-06 |
| [#6561](https://github.com/elastic/eui/issues/6561) | Add support for copying focused cell value with keyboard shortcut | 2023-01 |
| [#7138](https://github.com/elastic/eui/issues/7138) | Add column highlighting | 2023-08 |

### Accessibility Enhancements

| Issue | Title | Age |
|-------|-------|-----|
| [#8449](https://github.com/elastic/eui/issues/8449) | Prevent duplicate header cell screen reader output | 2025-03 |
| [#8520](https://github.com/elastic/eui/issues/8520) | Column selector dragging accessibility improvements | 2025-03 |

## Open Feature Requests in `elastic/kibana`

### `UnifiedDataTable` / Discover Enhancements

| Issue | Title | Team | Age |
|-------|-------|------|-----|
| [#168619](https://github.com/elastic/kibana/issues/168619) | Add support for flyout pagination in `UnifiedDataTable` | Cloud Security | 2023-10 |
| [#171393](https://github.com/elastic/kibana/issues/171393) | Add breakdown by colors | DataDiscovery | 2023-11 |
| [#249026](https://github.com/elastic/kibana/issues/249026) | Save scroll position in Discover | DataDiscovery | 2026-01 |
| [#248843](https://github.com/elastic/kibana/issues/248843) | In-table search: logical search and highlight terms separately | DataDiscovery | 2026-01 |
| [#249143](https://github.com/elastic/kibana/issues/249143) | Field editing: support adding new fields from data grid | DataDiscovery | 2026-01 |
| [#210411](https://github.com/elastic/kibana/issues/210411) | Keep column width and density user preferences in sync | DataDiscovery | 2025-02 |
| [#207282](https://github.com/elastic/kibana/issues/207282) | Improve keyboard navigation in data grid | DataDiscovery | 2024-12 |
| [#250542](https://github.com/elastic/kibana/issues/250542) | Persist column selection in group by data grid | DataDiscovery | 2026-01 |
| [#248314](https://github.com/elastic/kibana/issues/248314) | Update overview fields table with `headerVisibility` | obs-exploration | 2026-01 |
| [#235070](https://github.com/elastic/kibana/issues/235070) | Support sort in Lookup index editor | ES\|QL | 2025-09 |
| [#213427](https://github.com/elastic/kibana/issues/213427) | Implement custom criticality sorting | Cloud Security | 2025-03 |
| [#189294](https://github.com/elastic/kibana/issues/189294) | Refactor Security components to use `rowAdditionalLeadingControls` | SecuritySolution | 2024-07 |
| [#251014](https://github.com/elastic/kibana/issues/251014) | Don't show filter icons when cell violates `ignore_above` | DataDiscovery | 2026-01 |
| [#255200](https://github.com/elastic/kibana/issues/255200) | Support very large datasets in Kibana | Presentation | 2026-02 |

### Security-Specific

| Issue | Title | Team | Age |
|-------|-------|------|-----|
| [#250431](https://github.com/elastic/kibana/issues/250431) | Adopt Entity Resolution for entity data grid | Cloud Security | 2026-01 |

### Cross-Cutting

| Issue | Title | Team | Age |
|-------|-------|------|-----|
| [#88482](https://github.com/elastic/kibana/issues/88482) | Improve handling of panels with data grid content | Visualizations/DataDiscovery | 2021-01 |
| [#193826](https://github.com/elastic/kibana/issues/193826) | Follow up on column actions after EUI 95 upgrade | Visualizations | 2024-09 |

## Feature Request Themes

### 1. Layout and Scrolling

- **Sticky/pinned columns** (6 years old, highest priority)
- **Smooth scrolling** (janky virtualized scrolling)
- **Scroll position persistence** (save/restore scroll on navigation)
- **Infinite height / flex container issues** (layout bugs)
- **Large dataset support** (performance at scale)

### 2. Editing and Interaction

- **Cell editing** (inline editing workflows)
- **Keyboard copy** (Ctrl+C for focused cell)
- **Column highlighting** (visual emphasis on active column)
- **Improved keyboard navigation** (a11y and power user workflows)

### 3. Data Display

- **Row summary / aggregation row** (footer with computed values)
- **Breakdown by colors** (color-coded rows by category)
- **Custom column actions** (more control over column header menus)
- **Header visibility toggle** (hide headers for compact views)

### 4. State Management

- **Persist column selection** across views
- **Sync column width and density preferences**
- **Flyout pagination** (paginate within row detail flyouts)

### 5. Search and Filtering

- **Logical in-table search** (AND/OR operators)
- **Separate highlight from search** (highlight terms independently)
- **Filter icon awareness** (`ignore_above` mapping violations)

## Relationship to TanStack Table

Many of these feature requests map directly to TanStack Table capabilities or would be significantly easier to implement with a headless approach:

| Request | TanStack Table Support |
|---------|----------------------|
| Sticky columns | Built-in column pinning with CSS sticky examples |
| Scroll position persistence | Full control over scroll state via virtualization |
| Cell editing | Community patterns, full control over cell rendering |
| Row summary | Footer rows are a standard table pattern, easy with headless |
| Column highlighting | Full control over cell/column styling |
| Custom column actions | Full control over header rendering |
| Keyboard navigation | Full control, can implement custom key handlers |
| Large dataset support | TanStack Virtual for high-performance virtualization |
| Column state persistence | Built-in state serialization/deserialization |
| Custom sorting | Extensible sorting functions with `sortingFn` |

## EUI Team's Own Investigation

The EUI team has opened [#8859](https://github.com/elastic/eui/issues/8859) acknowledging that:

> "We're at a point where the current architecture of EuiDataGrid limits us quite heavily. Features like sticky rows and columns aren't possible to implement without workarounds due to the underlying virtualization library limitations, and a major refactor is long overdue."

Their investigation objectives include:
1. Documenting the current technical implementation.
2. Analyzing all internal usages, including `UnifiedDataTable`.
3. Understanding real Kibana needs.
4. Estimating effort for: maintaining as-is, refactoring, or integrating TanStack Table.
5. Planning the future with proper separation of concerns.

They note that **Krzysztof and Eyo have experimented with TanStack Table in Kibana with "excellent results."**

This investigation is closely related to the `@kbn/data-grid` proposal. Coordination with the EUI team will be important regardless of the approach taken -- whether `@kbn/data-grid` is built independently or informed by their findings.
