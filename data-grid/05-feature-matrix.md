# Feature Matrix: EuiDataGrid vs TanStack Table

This document compares `EuiDataGrid` and TanStack Table, identifies what `@kbn/data-grid` needs, and estimates the level of effort (LOE). The framing here is not "built-in vs build-from-scratch" -- EUI's component library (`EuiPopover`, `EuiButtonGroup`, `EuiSearchBar`, `EuiDragDropContext`, etc.) provides the building blocks for any controls we need. The question is how table *logic* is managed and how much control we have over *rendering*.

## Key Architectural Differences

| Aspect | EuiDataGrid | TanStack Table |
|--------|-------------|----------------|
| **Philosophy** | Opinionated component (markup + styles + logic coupled) | Headless (logic + state only) |
| **Rendering** | Owns the DOM; renders cells via `react-window` v1 | We own the DOM; render with EUI components |
| **Styling** | EUI theme baked in, limited override surface | We apply EUI tokens and Emotion directly |
| **Virtualization** | `react-window` v1 (unmaintained, limits sticky columns, smooth scrolling) | `@tanstack/react-virtual` (actively maintained, flexible) |
| **State management** | Internal, partially controllable via props | Fully controllable, external state ownership |
| **Extensibility** | Constrained by EUI's API surface; feature requests require upstream changes | Unconstrained; features are implemented at the Kibana level |
| **Bundle size** | Part of `@elastic/eui` (~large) | ~15-25 KB (table core + react adapter) |

## Feature Comparison

### How to Read This Table

The "EuiDataGrid" column reflects the current state of the component -- including its limitations. The "TanStack + EUI" column reflects what `@kbn/data-grid` would provide: TanStack Table for logic, EUI components for presentation, `@tanstack/react-virtual` for virtualization.

### Core Table Logic

These features are about state management and data processing -- the domain where TanStack Table excels.

| Feature | EuiDataGrid | TanStack + EUI | Notes |
|---------|-------------|----------------|-------|
| Column definitions | Yes | Yes | API shapes differ; mapping is straightforward. |
| Column visibility | Yes | Yes | TanStack `columnVisibility` state. |
| Column ordering | Yes (DnD, beta, [buggy](https://github.com/elastic/eui/issues/8572)) | Yes | TanStack `columnOrder` state. DnD UI via `@hello-pangea/dnd` or `EuiDragDropContext`. |
| Column sizing / resize | Yes | Yes | TanStack `columnSizing` with `onEnd`/`onChange` modes. Resize handle is a simple div. |
| Column pinning / sticky | **No** ([requested since 2020](https://github.com/elastic/eui/issues/2839)) | **Yes** | TanStack `columnPinning` + CSS `position: sticky`. |
| Row pinning | No | **Yes** | TanStack `rowPinning`. |
| Multi-sort | Yes | Yes | TanStack supports configurable multi-sort with shift-click. |
| Custom sort functions | Yes (schema-based) | Yes | TanStack `sortingFn` per column; 6 built-in functions + custom. |
| Server-side sorting | Yes | Yes | TanStack `manualSorting`. |
| Pagination | Yes | Yes | TanStack pagination state. Pagination UI via `EuiTablePagination`. |
| Server-side pagination | Yes | Yes | TanStack `manualPagination`. |
| Row selection | Yes (via control columns) | Yes | TanStack `rowSelection` state. Checkbox UI via `EuiCheckbox`. |
| Row expanding | Yes (popovers + expand button) | Yes | TanStack `expanding` state. Expand UI is custom (we already customize this heavily). |
| Global filtering | No (custom in-table search in `UnifiedDataTable`) | **Yes** | TanStack `globalFilter`. |
| Column filtering | No (handled externally) | **Yes** | TanStack `columnFiltering`. |
| Grouping | No | **Yes** | TanStack `grouping`. |
| Faceting | No | **Yes** | TanStack `faceting`. |

### Rendering and Virtualization

These features are about how cells, rows, and the grid container are rendered.

| Feature | EuiDataGrid | TanStack + EUI | Notes |
|---------|-------------|----------------|-------|
| Virtualized rendering | `react-window` v1 (unmaintained) | `@tanstack/react-virtual` | Actively maintained; supports dynamic sizes, smooth scrolling, sticky items. |
| Custom cell rendering | `renderCellValue` callback | We own all cell rendering | More flexible; cells are just React components. |
| Cell popovers | `renderCellPopover` callback | `EuiPopover` + custom content | Already how `UnifiedDataTable` customizes popovers. |
| Cell actions (hover) | `cellActions` prop | Custom overlay with EUI buttons | `UnifiedDataTable` already customizes these via `cellActionsTriggerId`. |
| Row heights (auto/fixed/line count) | `rowHeightsOptions` | `@tanstack/react-virtual` dynamic measurement | More flexible; supports any measurement strategy. |
| Header rendering | EuiDataGrid-controlled | We render headers with EUI components | Full control over tokens, actions, custom elements. |
| Footer / summary row | `renderFooterCellValue` | We render footer rows | Simple; just another row in the DOM. |
| Smooth scrolling | **No** ([react-window limitation](https://github.com/elastic/eui/issues/8656)) | **Yes** | `@tanstack/react-virtual` supports smooth scrolling natively. |
| Scroll position persistence | **No** ([requested](https://github.com/elastic/kibana/issues/249026)) | **Yes** | Direct control over scroll offset via virtualizer API. |

### Controls and Toolbar

These are UI components. TanStack Table has no opinion on them, but EUI provides all the building blocks.

| Feature | EuiDataGrid | TanStack + EUI | Notes |
|---------|-------------|----------------|-------|
| Column selector | EuiDataGrid toolbar | `EuiPopover` + `EuiDragDropContext` + `EuiSwitch`/`EuiCheckbox` | Bind to TanStack `columnVisibility` and `columnOrder` state. |
| Sort selector | EuiDataGrid toolbar | `EuiPopover` + `EuiSelect` | Bind to TanStack `sorting` state. |
| Density selector | EuiDataGrid toolbar | `EuiButtonGroup` | Local state controlling CSS class / EUI size tokens. |
| Full-screen toggle | EuiDataGrid toolbar | `EuiButtonIcon` + portal/CSS | Straightforward. |
| Keyboard shortcuts overlay | EuiDataGrid toolbar | `EuiModal` + `EuiDescriptionList` | Static content. |
| Search bar | Not built-in (custom in `UnifiedDataTable`) | `EuiSearchBar` or `EuiFieldSearch` | Can integrate with TanStack `globalFilter`. |
| Custom toolbar | `renderCustomToolbar` prop | We own the toolbar entirely | More flexible; Discover already uses `renderCustomToolbar`. |
| Bulk action controls | Custom (in `UnifiedDataTable`) | `EuiPopover` + `EuiContextMenu` | Bind to TanStack `rowSelection` state. |

### Styling

Grid styling is CSS. EUI provides the design tokens; we apply them.

| Feature | EuiDataGrid | TanStack + EUI | Notes |
|---------|-------------|----------------|-------|
| Density (compact/normal/expanded) | `gridStyle.cellPadding` / `fontSize` | EUI size tokens (`euiSizeS`, `euiSizeM`, etc.) | Map density state to EUI spacing/font tokens via Emotion. |
| Borders | `gridStyle.border` | CSS `border` with `euiBorderThin` token | Trivial. |
| Row striping | `gridStyle.stripes` | CSS `nth-child` with EUI color tokens | Trivial. |
| Row hover | `gridStyle.rowHover` | CSS `:hover` with EUI color tokens | Trivial. |
| Header styles | `gridStyle.header` | CSS with EUI typography tokens | Trivial. |

### Accessibility and Keyboard Navigation

This is the area with the highest implementation effort, because it requires manual testing with assistive technology.

| Feature | EuiDataGrid | TanStack + EUI | Notes |
|---------|-------------|----------------|-------|
| ARIA grid role | Yes | Must implement | Follow [WAI-ARIA Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/). |
| Arrow key navigation | Yes | Must implement | Row/cell focus management. |
| Enter to expand / Escape to close | Yes | Must implement | Popover lifecycle. |
| Screen reader announcements | Yes | Must implement | Live regions for sort changes, selection, etc. |
| Focus return after modal/menu close | [Buggy](https://github.com/elastic/kibana/issues/195082) | Can fix properly | We own focus management entirely. |

## Feature Requests Addressed

Features requested in `elastic/eui` or `elastic/kibana` that `@kbn/data-grid` would resolve:

| Request | Issue | How `@kbn/data-grid` Addresses It |
|---------|-------|------------------------------------|
| Sticky columns | [eui#2839](https://github.com/elastic/eui/issues/2839) (6 years old) | TanStack `columnPinning` + CSS `position: sticky`. |
| Smooth scrolling | [eui#8656](https://github.com/elastic/eui/issues/8656) | `@tanstack/react-virtual` supports smooth scrolling. |
| Row summary | [eui#8002](https://github.com/elastic/eui/issues/8002) | We render footer rows; no upstream dependency. |
| Column highlighting | [eui#7138](https://github.com/elastic/eui/issues/7138) | Custom column state + CSS class. |
| Custom column actions | [eui#8745](https://github.com/elastic/eui/issues/8745) | We own header rendering. |
| Very large datasets | [kibana#255200](https://github.com/elastic/kibana/issues/255200) | `@tanstack/react-virtual` with dynamic sizing. |
| Save scroll position | [kibana#249026](https://github.com/elastic/kibana/issues/249026) | Direct scroll offset control via virtualizer. |
| Custom sorting | [kibana#213427](https://github.com/elastic/kibana/issues/213427) | TanStack `sortingFn` per column. |
| Persist column state | [kibana#250542](https://github.com/elastic/kibana/issues/250542) | TanStack state is serializable. |
| Logical in-table search | [kibana#248843](https://github.com/elastic/kibana/issues/248843) | TanStack `globalFilter` + custom filter function. |
| Cell editing | [eui#8830](https://github.com/elastic/eui/issues/8830) | We own cell rendering; can make cells editable. |
| Column DnD while scrolled | [eui#8572](https://github.com/elastic/eui/issues/8572) | Column ordering is state-based, not DOM-based. |
| Infinite height in flex | [eui#7769](https://github.com/elastic/eui/issues/7769) | We control the container. |
| Row overlap rendering | [eui#8936](https://github.com/elastic/eui/issues/8936) | Fresh virtualization; no `react-window` v1 baggage. |

## What We Need to Build

TanStack Table handles logic and state. EUI provides presentation components. The work is in *composing* them into a cohesive grid experience.

### Core (Critical Path)

| Component | Description | LOE | EUI Components Used |
|-----------|-------------|-----|---------------------|
| **Virtualized grid renderer** | Compose `@tanstack/react-virtual` with EUI styling into a grid layout | Medium-High | EUI theme tokens, Emotion |
| **Toolbar** | Assemble column selector, sort selector, density, full-screen, shortcuts from EUI parts | Medium | `EuiPopover`, `EuiButtonGroup`, `EuiButtonIcon`, `EuiDragDropContext`, `EuiSwitch`, `EuiSelect` |
| **Cell popover** | Cell expansion with content and actions | Medium | `EuiPopover`, `EuiPopoverTitle`, `EuiPopoverFooter` |
| **Cell actions** | Hover/focus action buttons on cells | Medium | `EuiButtonIcon`, `EuiToolTip` |
| **Keyboard navigation** | ARIA grid pattern with arrow key navigation and focus management | High | -- (this is custom logic, not UI components) |
| **Accessibility** | ARIA roles, live regions, screen reader support | High | -- (custom logic with manual a11y testing) |
| **Grid styles** | Density, borders, stripes, hover, header styles | Low | EUI theme tokens applied via Emotion |

### Feature Parity

| Component | Description | LOE | Notes |
|-----------|-------------|-----|-------|
| **In-table search** | Search + highlight within visible data | Medium | TanStack `globalFilter` handles matching; highlight is CSS. `EuiFieldSearch` for input. |
| **Document comparison** | Side-by-side document comparison mode | Medium | Port from existing `CompareDocuments`. |
| **Bulk actions** | Selection toolbar with actions | Low | TanStack `rowSelection` + `EuiPopover`/`EuiContextMenu`. |
| **Full-screen mode** | Full viewport toggle | Low | `EuiButtonIcon` + CSS/portal. |
| **Schema detection** | Column type inference for sort/render | Low | Port `getSchemaByKbnType()`. |
| **Column DnD** | Drag-and-drop column reorder | Low-Medium | TanStack `columnOrder` state + `EuiDragDropContext` or `@hello-pangea/dnd`. |

### Deferrable

| Component | Description | LOE |
|-----------|-------------|-----|
| Copy cell via keyboard | Ctrl+C for focused cell | Low |
| Column highlighting | Visual emphasis on focused column | Low |
| Row color indicators | Color bar on row leading edge | Low |

## LOE Summary

> **Note:** These estimates reflect the baseline effort. [06-assembly-pattern.md](./06-assembly-pattern.md) proposes using the [assembly pattern](../src/platform/packages/shared/content-management/content_list/kbn-content-list-assembly/README.md) for the consumer API, which reduces toolbar and migration adapter timelines and provides a combined estimate of **8-14 weeks** with agent assistance.

| Category | Estimated LOE |
|----------|---------------|
| Core architecture (virtual renderer, state management, types) | 3-4 weeks |
| Toolbar (assembled from EUI components) | 1-2 weeks |
| Cell rendering (popovers, actions, formatting) | 1-2 weeks |
| Keyboard navigation and accessibility | 3-4 weeks |
| Grid styling and theming | 0.5-1 week |
| Extended features (search, comparison, bulk actions) | 1.5-2 weeks |
| Testing (unit, integration, visual regression) | 2-3 weeks |
| Migration adapter / compatibility layer for `UnifiedDataTable` | 2-3 weeks |
| **Total estimated** | **14-21 weeks** (1-2 engineers) |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Accessibility regression | Medium | High | Invest in a11y testing; involve EUI team for review. |
| Performance regression | Low-Medium | High | Benchmark against current `EuiDataGrid`; `@tanstack/react-virtual` is battle-tested. |
| Consumer migration friction | Medium | Medium | Build compatibility layer; phase migration gradually; opt-in adoption. |
| Feature parity gaps discovered late | Medium | Medium | Thorough feature inventory ([02-feature-inventory.md](./02-feature-inventory.md)); staged rollout. |
| EUI team builds their own TanStack integration | Low | Low | Coordinate with EUI team on [#8859](https://github.com/elastic/eui/issues/8859); our work could inform or merge with theirs. |

## When to Use `@kbn/data-grid` vs `EuiDataGrid`

The two can coexist. Not every grid needs the flexibility of a headless approach.

### Good candidates for `@kbn/data-grid`

- Grids that need **column pinning/sticky columns** (Discover, Timeline).
- Grids hitting **performance limits** with large datasets or many columns.
- Grids that need **custom virtualization** (variable row heights, smooth scrolling, scroll persistence).
- Grids that are **blocked on upstream EUI features** they cannot unblock themselves.
- Grids that need **grouping, faceting, or global filtering** at the table engine level.

### Good candidates to stay on `EuiDataGrid`

- **Simple, low-column-count grids** where the turnkey experience is sufficient (event logs, inspector tables, small previews).
- Grids with **no performance complaints** and no need for features `EuiDataGrid` lacks.
- Grids where the **cost of migration exceeds the benefit** -- if it works, leave it.

### Trade-offs

| | `EuiDataGrid` | `@kbn/data-grid` (TanStack + EUI) |
|---|---|---|
| Setup cost | Low (turnkey) | Medium (compose logic + presentation) |
| Feature ceiling | Constrained by upstream API surface | Unconstrained |
| Upstream dependency for features | High (blocked on EUI releases) | Low (logic owned by Kibana; EUI only for visual components) |
| Maintenance burden | On EUI team | On Kibana team |
| Accessibility | Provided by EUI | Must be built (highest-cost item) |
| Styling consistency | Automatic | Intentional (same EUI tokens, applied by us) |

## Assessment

Building `@kbn/data-grid` on TanStack Table is viable and addresses many long-standing issues, but it is not a blanket replacement. The key benefits are:

1. **Unblocked feature development**: Column pinning, smooth scrolling, row pinning, grouping, global filtering -- available immediately without upstream changes.
2. **Architectural control**: Full ownership of rendering and DOM eliminates the class of layout bugs (`react-window` v1 row overlap, infinite height, container sizing) that have resisted fixes for years.
3. **Performance flexibility**: `@tanstack/react-virtual` supports dynamic row heights, smooth scrolling, and can be tuned for specific use cases.
4. **Reduced cross-team friction**: Feature work is no longer blocked on EUI releases. EUI remains the source of visual components and design tokens, but table logic is Kibana-owned.
5. **Alignment with EUI team**: The EUI team is investigating TanStack integration ([#8859](https://github.com/elastic/eui/issues/8859)), and Kibana engineers have prototyped it successfully.

The primary effort is **keyboard navigation and accessibility** -- the one area where there is no shortcut. The toolbar, cell popovers, cell actions, and styling are largely assembly work using existing EUI components. A phased approach -- starting with a minimal viable grid for Discover and expanding incrementally -- would validate the approach before committing to broader adoption.

## Agent-Accelerated Development

An AI coding agent can meaningfully compress the LOE estimates above, particularly for work that is pattern-based, well-specified by existing code, or involves composing known EUI components.

### High-acceleration areas

| Category | Human LOE | Agent-Accelerated LOE | How |
|----------|-----------|----------------------|-----|
| **Grid styling** | 0.5-1 week | 1-2 days | Translating EUI tokens into Emotion styles is mechanical. An agent can generate the full density/border/stripe/hover/header style matrix from existing `DATA_GRID_STYLE_DEFAULT` and `DATA_GRID_DENSITY_STYLE_MAP`. |
| **Toolbar assembly** | 1-2 weeks | 3-5 days | Each toolbar control follows a consistent pattern: EUI popover/button + TanStack state binding. An agent can scaffold each control and its state wiring, with a human reviewing for UX fit. |
| **Cell rendering and popovers** | 1-2 weeks | 3-5 days | The cell renderer, `EuiPopover` integration, and cell action overlays are well-specified by existing `UnifiedDataTable` code. An agent can port the logic and compose the EUI components. |
| **Schema detection** | Part of extended features | 1-2 days | Porting `getSchemaByKbnType()` and `getSchemaDetectors()` is a direct translation. |
| **Testing** | 2-3 weeks | 1-2 weeks | An agent can generate unit tests from component interfaces, port existing test patterns, and scaffold visual regression harnesses. Human review needed for edge cases and a11y scenarios. |
| **Migration adapter** | 2-3 weeks | 1-1.5 weeks | Mapping `UnifiedDataTable` props to `@kbn/data-grid` props is mechanical. An agent can generate the prop mapping, type adapters, and deprecation warnings from existing interfaces. |
| **Type definitions** | Spread across categories | 2-3 days | Generating TypeScript interfaces from TanStack Table generics + Kibana-specific extensions is ideal agent work. |

### Medium-acceleration areas

| Category | Human LOE | Agent-Accelerated LOE | How |
|----------|-----------|----------------------|-----|
| **Core architecture** | 3-4 weeks | 2-3 weeks | The virtual renderer and state management layer require design decisions. An agent can generate scaffolding once decisions are made, but the architectural choices need human judgment. |
| **Extended features** | 1.5-2 weeks | 1-1.5 weeks | In-table search, document comparison, and bulk actions have existing implementations to reference. An agent can port and adapt, with human review for behavioral parity. |

### Low-acceleration areas (human-driven)

| Category | LOE | Why |
|----------|-----|-----|
| **Keyboard navigation** | 3-4 weeks | ARIA grid patterns require manual testing across screen readers and browsers. The [WAI-ARIA Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) spec is clear, but verifying correctness requires assistive technology. An agent can scaffold key handlers and focus management, but the nuances need human attention. |
| **Accessibility** | Part of above | Same. An agent can generate ARIA attributes and role assignments, but verification requires manual testing. |
| **Architectural decisions** | Ongoing | Virtualization strategy, component tree, state ownership, API surface design. Judgment calls informed by Kibana's constraints. |

### Revised LOE with Agent Assistance

| Category | Without Agent | With Agent | Reduction |
|----------|--------------|------------|-----------|
| Core architecture | 3-4 weeks | 2-3 weeks | ~25% |
| Toolbar assembly | 1-2 weeks | 3-5 days | ~50% |
| Cell rendering | 1-2 weeks | 3-5 days | ~50% |
| Keyboard nav / a11y | 3-4 weeks | 2.5-3.5 weeks | ~15% |
| Grid styling | 0.5-1 week | 1-2 days | ~70% |
| Extended features | 1.5-2 weeks | 1-1.5 weeks | ~30% |
| Testing | 2-3 weeks | 1-2 weeks | ~40% |
| Migration adapter | 2-3 weeks | 1-1.5 weeks | ~50% |
| **Total** | **14-21 weeks** | **9-15 weeks** | **~30-35%** |

### Agent workflow recommendations

1. **Architecture-first, then generate.** Make the key design decisions (virtualization strategy, component tree, state ownership) with human judgment. Once decided, have the agent scaffold the full component structure, types, and boilerplate.
2. **Port by reference.** For each feature, point the agent at the existing `UnifiedDataTable` implementation and the TanStack Table API docs. It can generate the adapted implementation and flag areas where the paradigm shift requires a design choice.
3. **Test generation in parallel.** As each component is built, have the agent generate tests from the interface contracts. This catches regressions early and lets the human focus on manual a11y testing.
4. **Incremental migration.** Have the agent generate the `UnifiedDataTable` compatibility adapter early. This lets the new grid be tested in Discover behind a feature flag while the old implementation continues to serve production.
