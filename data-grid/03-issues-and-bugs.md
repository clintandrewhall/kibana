# EuiDataGrid Issues and Bugs

This document catalogs open and recent closed issues for `EuiDataGrid` across both the `elastic/kibana` and `elastic/eui` repositories. The purpose is to establish the level of churn, friction, and ongoing maintenance burden.

## Summary

| Repository | Open | Notes |
|-----------|------|-------|
| `elastic/eui` (data grid label) | 21 | Core component bugs and limitations |
| `elastic/kibana` (EuiDataGrid/data grid) | 14 | Kibana-specific integration issues |
| `elastic/kibana` (`UnifiedDataTable`) | 50 | Wrapper-level issues |
| **Total open** | **85** | |

## Open Issues in `elastic/eui`

These represent bugs and limitations in the `EuiDataGrid` component itself, which block or constrain Kibana development.

### Rendering and Layout Bugs

| Issue | Title | Age | Impact |
|-------|-------|-----|--------|
| [#8936](https://github.com/elastic/eui/issues/8936) | Rows overlap each other | 2025-08 | High - visual corruption, blocked in Kibana as [#221768](https://github.com/elastic/kibana/issues/221768) |
| [#8008](https://github.com/elastic/eui/issues/8008) | Grids wrapped in container with no set height & `defaultHeight: 'auto'` render with 0 height in webkit | 2024-09 | Medium - affects Safari users |
| [#7769](https://github.com/elastic/eui/issues/7769) | Grid grows to infinite height in flex container if `height` not provided | 2024-05 | High - known issue, affects dashboard embeds |
| [#8038](https://github.com/elastic/eui/issues/8038) | Width exceeds container with `customBodyRender` | 2024-09 | Medium |
| [#8927](https://github.com/elastic/eui/issues/8927) | Downsizing columns does not fill available container | 2025-07 | Low |
| [#8657](https://github.com/elastic/eui/issues/8657) | Actions menu and header overlap for the first row | 2025-04 | Low |
| [#9104](https://github.com/elastic/eui/issues/9104) | Column header height changes on hover | 2025-10 | Low |

### Feature Gaps and Technical Debt

| Issue | Title | Age | Impact |
|-------|-------|-----|--------|
| [#8859](https://github.com/elastic/eui/issues/8859) | **[Epic] EuiDataGrid long-term plan and investigation** | 2025-07 | Meta - the EUI team's own investigation into refactoring/replacing internals |
| [#9182](https://github.com/elastic/eui/issues/9182) | Update to latest `react-window` version (v2) | 2025-11 | High - virtualization tech debt |
| [#2839](https://github.com/elastic/eui/issues/2839) | Allow sticky columns | **2020-02** | High - **6 years old**, fundamental layout limitation |
| [#8656](https://github.com/elastic/eui/issues/8656) | Investigate implementing smooth scrolling | 2025-04 | Medium - UX quality |
| [#8830](https://github.com/elastic/eui/issues/8830) | Support single cell editing | 2025-06 | Medium - design decision needed |
| [#8002](https://github.com/elastic/eui/issues/8002) | Add Row Summary | 2024-09 | Medium |
| [#6561](https://github.com/elastic/eui/issues/6561) | Add support for copying focused cell value with keyboard shortcut | 2023-01 | Low |
| [#7138](https://github.com/elastic/eui/issues/7138) | Add column highlighting | 2023-08 | Low |

### Drag and Drop

| Issue | Title | Age | Impact |
|-------|-------|-----|--------|
| [#8454](https://github.com/elastic/eui/issues/8454) | [Beta] `canDragAndDropColumns` functionality tracking | 2025-03 | High - actively used by Discover |
| [#8572](https://github.com/elastic/eui/issues/8572) | Can't reorder columns with DnD while scrolled down | 2025-04 | Medium - UX bug |

### Accessibility

| Issue | Title | Age | Impact |
|-------|-------|-----|--------|
| [#8449](https://github.com/elastic/eui/issues/8449) | Prevent duplicate header cell screen reader output | 2025-03 | Medium |
| [#8520](https://github.com/elastic/eui/issues/8520) | Column selector dragging accessibility improvements | 2025-03 | Medium |

### API and Extensibility

| Issue | Title | Age | Impact |
|-------|-------|-----|--------|
| [#8615](https://github.com/elastic/eui/issues/8615) | Make `EuiDataGridCellActions` reusable outside `EuiDataGrid` | 2025-04 | Medium |
| [#8745](https://github.com/elastic/eui/issues/8745) | Allow control over column actions in columns popover | 2025-06 | Medium |

## Open Issues in `elastic/kibana`

### DataGrid-specific

| Issue | Title | Team | Age | Impact |
|-------|-------|------|-----|--------|
| [#221768](https://github.com/elastic/kibana/issues/221768) | Data grid renders incorrectly, rows overlap | DataDiscovery | 2025-05 | High - blocked on EUI upstream |
| [#235832](https://github.com/elastic/kibana/issues/235832) | ES\|QL results disappear when interacting with fields | DataDiscovery | 2025-09 | High - blocked on EUI upstream |
| [#252851](https://github.com/elastic/kibana/issues/252851) | Alerts/Events table breaks when exiting full-screen in Cases | SecuritySolution | 2026-02 | Medium |
| [#252856](https://github.com/elastic/kibana/issues/252856) | Pagination missing for Events table in full screen | SecuritySolution | 2026-02 | Medium |
| [#92886](https://github.com/elastic/kibana/issues/92886) | Timestamp column removal has no effect | DataDiscovery | **2021-02** | Low - **5 years old** |
| [#88482](https://github.com/elastic/kibana/issues/88482) | Improve handling of panels with data grid content | Visualizations/DataDiscovery | **2021-01** | Low - **5 years old** |
| [#242430](https://github.com/elastic/kibana/issues/242430) | Failing test: `EuiDataGrid` - data grid | QA | 2025-11 | Blocker - skipped test |
| [#255200](https://github.com/elastic/kibana/issues/255200) | [Investigation] Support very large datasets in Kibana | Presentation | 2026-02 | Epic - performance investigation |

### Accessibility

| Issue | Title | Team | Age |
|-------|-------|------|-----|
| [#195082](https://github.com/elastic/kibana/issues/195082) | Keyboard focus not returned when menu/modal closed | SecuritySolution | 2024-02 |
| [#195075](https://github.com/elastic/kibana/issues/195075) | Screen reader focus not returned when adding assignee | SecuritySolution | 2024-02 |

### Other

| Issue | Title | Team | Age |
|-------|-------|------|-----|
| [#250542](https://github.com/elastic/kibana/issues/250542) | Persist column selection in group by data grid | DataDiscovery | 2026-01 |
| [#248314](https://github.com/elastic/kibana/issues/248314) | Update overview fields table with `headerVisibility` | obs-exploration | 2026-01 |
| [#250431](https://github.com/elastic/kibana/issues/250431) | Adopt Entity Resolution for entity data grid | Cloud Security | 2026-01 |
| [#193826](https://github.com/elastic/kibana/issues/193826) | Follow up on column actions after EUI 95 upgrade | Visualizations | 2024-09 |

## Notable `UnifiedDataTable` Issues (Top 25 of 50)

| Issue | Title | State | Team | Age |
|-------|-------|-------|------|-----|
| [#251014](https://github.com/elastic/kibana/issues/251014) | Don't show filter icons when cell violates `ignore_above` | Open | DataDiscovery | 2026-01 |
| [#168619](https://github.com/elastic/kibana/issues/168619) | Add support for flyout pagination | Open | Cloud Security | 2023-10 |
| [#171393](https://github.com/elastic/kibana/issues/171393) | Add breakdown by colors | Open (blocked) | DataDiscovery | 2023-11 |
| [#235070](https://github.com/elastic/kibana/issues/235070) | Support sort in Lookup index editor | Open | ES\|QL | 2025-09 |
| [#213427](https://github.com/elastic/kibana/issues/213427) | Implement custom criticality sorting | Open | Cloud Security | 2025-03 |
| [#189294](https://github.com/elastic/kibana/issues/189294) | Refactor Security components to use `rowAdditionalLeadingControls` | Open | SecuritySolution | 2024-07 |
| [#249026](https://github.com/elastic/kibana/issues/249026) | Save scroll position in Discover | Open | DataDiscovery | 2026-01 |
| [#248843](https://github.com/elastic/kibana/issues/248843) | In-table search: use logical search and highlight terms separately | Open | DataDiscovery | 2026-01 |
| [#249143](https://github.com/elastic/kibana/issues/249143) | Field editing: support adding new fields from data grid | Open | DataDiscovery | 2026-01 |
| [#210411](https://github.com/elastic/kibana/issues/210411) | Keep column width and density user preferences in sync | Open | DataDiscovery | 2025-02 |
| [#207282](https://github.com/elastic/kibana/issues/207282) | Improve keyboard navigation in data grid | Open | DataDiscovery | 2024-12 |

## Patterns and Analysis

### Issue Age Distribution

The oldest open issues date back to **2020-2021**, indicating long-standing architectural limitations that have resisted resolution:
- Sticky columns (2020, 6 years)
- Timestamp column removal (2021, 5 years)
- Dashboard panel handling (2021, 5 years)

### Issue Categories

| Category | Count (approx) | Notes |
|----------|----------------|-------|
| Rendering/layout bugs | 10 | Row overlap, height issues, container sizing |
| Performance | 5 | Virtualization, large datasets, smooth scrolling |
| Accessibility | 6 | Keyboard nav, screen reader, focus management |
| Feature gaps | 12 | Sticky columns, cell editing, row summary, column highlighting |
| DnD/column reorder | 4 | Beta feature, scrolling bugs |
| API/extensibility | 5 | Cell actions reuse, column action control |
| Test failures | 2 | Flaky/failing EuiDataGrid tests |

### Blocked Issues

Multiple Kibana issues are explicitly **blocked** on upstream EUI fixes, creating a dependency bottleneck:
- [#221768](https://github.com/elastic/kibana/issues/221768) → blocked on [#8936](https://github.com/elastic/eui/issues/8936) (row overlap)
- [#235832](https://github.com/elastic/kibana/issues/235832) → blocked on EUI upstream
- [#171393](https://github.com/elastic/kibana/issues/171393) → blocked
- [#92886](https://github.com/elastic/kibana/issues/92886) → blocked

### Churn Indicators

- **21 open EUI issues** for a single component is a high issue density.
- **50 open `UnifiedDataTable` issues** indicates significant feature pressure on the wrapper layer.
- The EUI team has opened an **epic** ([#8859](https://github.com/elastic/eui/issues/8859)) specifically to investigate the long-term plan, acknowledging the current architecture "limits us quite heavily."
- The EUI epic explicitly mentions **TanStack Table** as a potential replacement for internal logic.
- Issues tagged `blocked` and `upstream` indicate Kibana teams are waiting on EUI changes they cannot unblock themselves.

### Relevance to `@kbn/data-grid`

Many of these issues stem from architectural constraints in `EuiDataGrid` (primarily the `react-window` v1 virtualization layer and the component-based rendering model). A headless approach would sidestep several classes of bugs:

- **Sticky columns** → TanStack has native column pinning with CSS sticky support.
- **Row overlap / height bugs** → A new virtualization approach would reset this class of bugs.
- **Infinite height in flex** → Full control over container sizing with headless approach.
- **Smooth scrolling** → Control over virtualization library choice.
- **Column DnD while scrolled** → TanStack has native column ordering state.
- **Cell editing** → TanStack has community patterns for editable cells.

That said, many of the simpler issues (accessibility, focus management, header overlap) are UI-layer concerns that would need to be solved regardless of the underlying table engine. A headless approach trades one set of problems (upstream blockers) for another (implementing and maintaining the UI layer ourselves).
