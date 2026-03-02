# The Assembly Pattern for `@kbn/data-grid`

This document explores how the [assembly pattern](../src/platform/packages/shared/content-management/content_list/kbn-content-list-assembly/README.md) from `@kbn/content-list-assembly` could shape the API design of `@kbn/data-grid`, and the effect it would have on the LOE estimates in [05-feature-matrix.md](./05-feature-matrix.md).

## The Problem the Assembly Pattern Solves

`UnifiedDataTable` currently has **30+ consumer-configurable props**. Some are flat values, some are callbacks, some are render functions, some are arrays of objects, some are configuration objects containing other configuration objects. The result is an API surface that is:

- **Hard to read.** A Discover grid declaration is a wall of props with no visual correspondence to the rendered UI.
- **Hard to extend.** Adding a feature means adding more props. Every new prop increases cognitive load for every consumer, even those who don't need it.
- **Rigid in ordering.** Column order, toolbar control order, and cell action order are determined by array indices or implicit conventions, not by visual position in JSX.
- **Entangled.** Toolbar visibility, column configuration, cell actions, and control columns are all separate prop trees that interact in non-obvious ways.

The assembly pattern replaces prop-based configuration with **declarative JSX children** that look like the UI they configure.

## What the Assembly Pattern Is

A three-layer model for building declarative component APIs in React. Components that return `null` carry typed configuration via props. A parent component (the "assembly") reads its children, identifies declarative components by static Symbol properties, extracts their props, and resolves them into concrete output.

```
Assembly → Part → Preset
```

| Layer | What it is | Data Grid Example |
|-------|-----------|-------------------|
| **Assembly** | A named parent that parses children for configuration. | `DataGrid` |
| **Part** | A category of declarative component. Typed with a preset-to-props mapping. | `column`, `toolbar`, `cellAction` |
| **Preset** | A named variant for a part. Props type is inferred from the mapping. | `column.timestamp`, `toolbar.columnSelector`, `cellAction.filterIn` |

Each preset registers a `resolve` callback that converts declared attributes into concrete output -- a TanStack `ColumnDef`, a `ReactNode` for the toolbar, or a cell action definition. The assembly dispatches automatically; no manual switch statements or cast maps needed.

For full API documentation and recipes, see the [`@kbn/content-list-assembly` README](../src/platform/packages/shared/content-management/content_list/kbn-content-list-assembly/README.md) and [RECIPES.md](../src/platform/packages/shared/content-management/content_list/kbn-content-list-assembly/RECIPES.md).

## How It Applies to `@kbn/data-grid`

### Before: Prop-Based API (Current `UnifiedDataTable` Style)

```tsx
<DataGrid
  columns={columns}
  columnVisibility={{ visibleColumns, setVisibleColumns }}
  leadingControlColumns={[selectColumn, expandColumn]}
  trailingControlColumns={[actionsColumn]}
  toolbarVisibility={{
    showSortSelector: true,
    showColumnSelector: { allowHide: false, allowReorder: true },
    showDisplaySelector: true,
    additionalControls: { left: <MyControl /> },
  }}
  renderCustomToolbar={getRenderCustomToolbarWithElements}
  cellActionsTriggerId="DISCOVER_CELL_ACTIONS_TRIGGER"
  cellActionsHandling="append"
  visibleCellActions={3}
  enableInTableSearch
  enableComparisonMode
  rowHeightState={3}
  gridStyleOverride={{ border: 'horizontal', stripes: true }}
  sort={sortColumns}
  onSort={handleSort}
  onResize={handleResize}
  getRowIndicator={getRowIndicator}
  rowAdditionalLeadingControls={additionalControls}
  externalCustomRenderers={customRenderers}
  // ... more props
/>
```

### After: Declarative API

```tsx
<DataGrid data={rows} sorting={sorting} onSortingChange={setSorting}>
  <Column.Select />
  <Column.Expand />
  <Column.Timestamp width={212} />
  <Column id="message" name="Message" cellActions={discoverCellActions} />
  <Column id="host" name="Host" pinned="left" />
  <Column id="agent" name="Agent" />

  <Toolbar>
    <Toolbar.ColumnSelector allowHide={false} allowReorder />
    <Toolbar.SortSelector />
    <MyControl />
    <Toolbar.Search />
    <Toolbar.Density />
    <Toolbar.FullScreen />
  </Toolbar>

  <CellAction.FilterIn />
  <CellAction.FilterOut />
  <CellAction.Copy />
</DataGrid>
```

**JSX order is rendering order.** Column order, toolbar control order, and cell action order are all determined by position in JSX. Consumers see the structure of their grid reflected in their code.

## Part Definitions

### `column` Part

The highest-value application of the assembly pattern. Each column preset resolves to a TanStack `ColumnDef<TData>`.

```typescript
const dataGrid = defineAssembly({ name: 'DataGrid' });

const column = dataGrid.definePart<
  ColumnPresets,
  ColumnDef<DataGridRow>,
  ColumnBuilderContext
>({ name: 'column' });
```

| Preset | Props | Resolves To | Notes |
|--------|-------|-------------|-------|
| `timestamp` | `TimestampColumnProps` (width, format) | `ColumnDef` with timestamp formatter, default 212px width | Pre-configured for `@timestamp`. |
| `source` | `SourceColumnProps` (maxFields, showMultiFields) | `ColumnDef` with `SourceDocument` renderer | Renders `_source` with field truncation. |
| `score` | `ScoreColumnProps` (width) | `ColumnDef` with numeric score display | For `_score` in relevance-sorted results. |
| `summary` | `SummaryColumnProps` | `ColumnDef` with summary renderer | Multi-field summary column. |
| `select` | `SelectColumnProps` | `ColumnDef` pinned left, checkbox renderer | Row selection. Maps to TanStack `rowSelection`. |
| `expand` | `ExpandColumnProps` | `ColumnDef` pinned left, expand button | Row detail expansion. |
| `colorIndicator` | `ColorIndicatorColumnProps` | `ColumnDef` pinned left, color bar | Row-level color indicator (e.g., log level). |
| (base) `Column` | `ColumnProps` (id, name, width, render, pinned, cellActions, sortable) | `ColumnDef` from explicit config | Custom columns, identified by `props.id`. |

**Runtime context** (`ColumnBuilderContext`) provides data view field types, feature flags, active profile, and sorting support -- passed to `resolve` callbacks so presets can adapt without consumers needing to specify this information.

The `useColumns` hook pattern from `@kbn/content-list-table` applies directly:

```typescript
const useColumns = (children: ReactNode): ColumnDef<DataGridRow>[] => {
  const { dataView, profile, supports } = useDataGridConfig();

  return useMemo(() => {
    const context: ColumnBuilderContext = { dataView, profile, supports };
    const parts = column.parseChildren(children);
    return parts.map((part) => column.resolve(part, context)!);
  }, [children, dataView, profile, supports]);
};
```

### `toolbar` Part

Each toolbar preset resolves to a `ReactNode` -- an EUI component wired to TanStack state.

| Preset | Props | Resolves To |
|--------|-------|-------------|
| `columnSelector` | `ColumnSelectorProps` (allowHide, allowReorder) | `EuiPopover` + `EuiDragDropContext` bound to `columnVisibility`/`columnOrder` state |
| `sortSelector` | `SortSelectorProps` | `EuiPopover` + `EuiSelect` bound to `sorting` state |
| `density` | `DensityProps` | `EuiButtonGroup` controlling density state |
| `search` | `SearchProps` | `EuiFieldSearch` bound to `globalFilter` state |
| `fullScreen` | `FullScreenProps` | `EuiButtonIcon` toggling full-screen mode |
| `keyboardShortcuts` | `KeyboardShortcutsProps` | `EuiButtonIcon` opening `EuiModal` overlay |
| (base) `Toolbar` | -- | Container; children parsed for toolbar presets |

JSX order determines control order in the toolbar. Non-preset children (plain React elements) render inline, so consumers can drop custom controls between standard ones without any special API.

### `cellAction` Part

Each cell action preset resolves to a cell action definition.

| Preset | Props | Resolves To |
|--------|-------|-------------|
| `filterIn` | `FilterInProps` | Cell action that applies a positive filter |
| `filterOut` | `FilterOutProps` | Cell action that applies a negative filter |
| `copy` | `CopyProps` | Cell action that copies cell value to clipboard |
| (base) `CellAction` | `CellActionProps` (icon, label, onClick) | Custom cell action from explicit config |

## Effect on LOE Estimates

The assembly pattern changes the nature of the work in several categories from [05-feature-matrix.md](./05-feature-matrix.md). Instead of building monolithic components with complex internal dispatch, we define small, focused presets with typed `resolve` callbacks. The framework handles composition, ordering, identification, and dispatch.

### Toolbar: Reduced Scope

The feature matrix estimates **1-2 weeks** for the toolbar. With the assembly pattern, this work decomposes into:

1. **Assembly + part definition** (~1 day). Define the `toolbar` part with its preset map. This is boilerplate following the established pattern.
2. **Individual preset `resolve` callbacks** (~1 day each). Each preset is a small, self-contained unit: compose an EUI component, bind it to TanStack state, return `ReactNode`. The column selector is the most complex (drag-drop reorder + visibility toggles); the others are simpler.
3. **Container renderer** (~1 day). Parse toolbar children, render in a flex layout.
4. **No custom toolbar framework needed.** `renderCustomToolbar` in `UnifiedDataTable` exists because consumers need to rearrange or inject controls into EuiDataGrid's opinionated toolbar. With the assembly pattern, consumers own toolbar composition directly -- just put children in the order you want. No framework; just JSX.

**Revised estimate: 3-5 days** (down from 1-2 weeks).

### Cell Actions: Reduced Scope

The feature matrix estimates cell actions as part of the **1-2 week** cell rendering category. With the assembly pattern:

1. **Part definition + preset map** (~0.5 day).
2. **Three preset `resolve` callbacks** (filterIn, filterOut, copy) (~1 day). Each is a small function that returns an action definition.
3. **Base component for custom actions** (~0.5 day). `CellAction` with `createComponent`.
4. **Action overlay renderer** (~1-2 days). The UI that shows action buttons on hover/focus. This is the only non-trivial piece, and it's the same regardless of whether we use the assembly pattern.

The key saving is that the *dispatch and configuration* layer is handled by the assembly framework. No manual switch on action type, no `cellActionsTriggerId` / `cellActionsHandling` / `visibleCellActions` prop matrix.

### Column Configuration: Reduced Scope

Column configuration is currently the most complex part of `UnifiedDataTable` -- it touches `columns`, `columnsMeta`, `settings`, `customGridColumnsConfiguration`, `externalCustomRenderers`, `controlColumnIds`, `rowAdditionalLeadingControls`, `externalControlColumns`, `trailingControlColumns`, and more. With the assembly pattern:

1. **All of these collapse into `<Column>` children.** Pre-built columns (timestamp, source, score, select, expand) are presets. Custom columns use the base `Column` component with `id`, `name`, `render`. Control columns (select, expand, color indicator) are column presets pinned left.
2. **No separate column configuration vs control column API.** They're all columns; some are pinned.
3. **Ordering is JSX order.** No `controlColumnIds` array, no `columnVisibility.setVisibleColumns` callback to keep in sync.
4. **Custom renderers are per-column props**, not a separate `externalCustomRenderers` map keyed by column ID.

This doesn't change the LOE for the *underlying* column implementation (TanStack `ColumnDef` generation, cell rendering), but it significantly simplifies the API surface and eliminates the wiring code that connects disparate props.

### Migration Adapter: Reduced Scope

The feature matrix estimates **2-3 weeks** for a `UnifiedDataTable` compatibility layer. The assembly pattern offers a more natural migration path:

1. **The adapter translates props to children.** A thin `UnifiedDataTable` shim can convert its current prop API into `<DataGrid>` children internally. The assembly's `parseChildren` doesn't care whether children come from a consumer's JSX or from a generated React element tree.
2. **Consumers can migrate incrementally.** Start by using the prop-based shim. Then gradually replace prop-based configuration with declarative children, one part at a time.
3. **Default parts provide backward compatibility.** When no `<Column>` children are provided, the grid uses a default column set -- exactly like `useColumns` in `@kbn/content-list-table`.

**Revised estimate: 1-2 weeks** (down from 2-3 weeks).

### Revised LOE Summary

| Category | Without Assembly | With Assembly | Notes |
|----------|-----------------|---------------|-------|
| Core architecture | 3-4 weeks | 3-4 weeks | Unchanged. The assembly pattern doesn't affect the virtual renderer or state management core. |
| Toolbar | 1-2 weeks | 3-5 days | Preset-per-control model; no custom toolbar framework. |
| Cell rendering (popovers, actions) | 1-2 weeks | 1-1.5 weeks | Cell action dispatch simplified; popover is unchanged. |
| Keyboard nav / a11y | 3-4 weeks | 3-4 weeks | Unchanged. The assembly pattern doesn't affect keyboard or a11y implementation. |
| Grid styling | 0.5-1 week | 0.5-1 week | Unchanged. |
| Extended features | 1.5-2 weeks | 1.5-2 weeks | Unchanged. |
| Testing | 2-3 weeks | 2-3 weeks | Slightly more testing surface (parse + resolve for each preset), but individual tests are simpler. |
| Migration adapter | 2-3 weeks | 1-2 weeks | Prop-to-children translation is natural; incremental migration is built-in. |
| **Total** | **14-21 weeks** | **12-19 weeks** | ~15% reduction in LOE. |

The LOE reduction is modest because the assembly pattern primarily affects **API design and developer ergonomics**, not the underlying implementation. The virtual renderer, keyboard navigation, accessibility, and styling work are the same regardless of API shape. The savings come from:

- Eliminating the need for a custom toolbar composition framework.
- Simplifying cell action dispatch.
- Reducing migration adapter complexity.
- Removing the need to design and maintain a large, flat prop interface.

### Combined with Agent Assistance

| Category | Base | With Assembly | With Assembly + Agent |
|----------|------|---------------|----------------------|
| Core architecture | 3-4 weeks | 3-4 weeks | 2-3 weeks |
| Toolbar | 1-2 weeks | 3-5 days | 1.5-3 days |
| Cell rendering | 1-2 weeks | 1-1.5 weeks | 3-5 days |
| Keyboard nav / a11y | 3-4 weeks | 3-4 weeks | 2.5-3.5 weeks |
| Grid styling | 0.5-1 week | 0.5-1 week | 1-2 days |
| Extended features | 1.5-2 weeks | 1.5-2 weeks | 1-1.5 weeks |
| Testing | 2-3 weeks | 2-3 weeks | 1-2 weeks |
| Migration adapter | 2-3 weeks | 1-2 weeks | 3-5 days |
| **Total** | **14-21 weeks** | **12-19 weeks** | **8-14 weeks** |

The assembly pattern is especially agent-friendly. Each preset is a small, self-contained unit with a typed interface and a `resolve` callback. An agent can generate preset definitions, resolve callbacks, and tests from the existing `UnifiedDataTable` code with high confidence, because the pattern is rigid and well-documented.

## Benefits Beyond LOE

The most significant impact of the assembly pattern is not LOE reduction -- it's **long-term maintainability and developer experience**.

### Prop Surface Control

`UnifiedDataTable` has grown to 30+ props because every feature needed a new entry point. The assembly pattern caps the parent component's prop interface at a small number of structural props (`data`, `sorting`, `pagination`, `onSortingChange`, `onPaginationChange`). Everything else is a child.

### Independent Feature Development

New column presets, toolbar controls, and cell actions can be added without modifying the `DataGrid` component. A team that needs a `duration` column for APM defines a preset and a `resolve` callback. No cross-team coordination on the parent component's prop interface.

### Testability

Each preset is independently testable: parse it, resolve it, assert the output. No need to render the entire grid to verify that a column configuration produces the correct `ColumnDef`. The `@kbn/content-list-assembly` test patterns (identification, parsing, resolution) apply directly.

### Discoverability

`DataGrid.Column.Timestamp`, `DataGrid.Toolbar.Search`, `DataGrid.CellAction.FilterIn` -- the available configuration is visible through IDE autocomplete. Consumers don't need to know which prop controls which behavior; they compose named parts.

### Migration as Incremental Adoption

The assembly pattern supports mixed usage during migration. A `UnifiedDataTable` compatibility shim generates children from props. Consumers can adopt the declarative API one piece at a time -- switching columns to `<Column>` children first, then toolbar controls, then cell actions -- without a big-bang rewrite.

## Where the Assembly Pattern Does Not Help

- **Core architecture.** The virtual renderer, TanStack Table integration, and state management layer are internal implementation, not consumer API. The assembly pattern doesn't affect them.
- **Keyboard navigation and accessibility.** ARIA grid patterns and focus management are the same regardless of how consumers configure the grid.
- **Grid styling.** CSS is CSS. The assembly pattern adds no value to density/border/stripe theming.
- **Performance.** The assembly pattern has negligible runtime cost (a single `parseChildren` pass per render), but it doesn't improve or degrade rendering performance.
