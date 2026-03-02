# EuiDataGrid Feature Inventory

This document provides a detailed inventory of every `EuiDataGrid` feature utilized by `UnifiedDataTable` (and by extension, Discover), organized by category. For each feature, we note whether it is hardcoded internally or exposed to consumers for configuration.

## 1. Core Props

| Prop | How Used | Dynamic/Hardcoded | Exposed to Consumers |
|------|----------|-------------------|---------------------|
| `id` | Generated via `useFullScreenWatcher` | Dynamic | No |
| `aria-describedby` | Random ID via `htmlIdGenerator()` | Dynamic | No |
| `aria-labelledby` | From `ariaLabelledBy` prop | Consumer-provided | Yes |
| `columns` | Built from `getEuiGridColumns()` using `visibleColumns`, `settings`, `columnsMeta` | Dynamic | Yes |
| `columnVisibility` | `{ canDragAndDropColumns, visibleColumns, setVisibleColumns }` | Dynamic | Yes |
| `rowCount` | `displayedRows.length` | Dynamic | Yes (via `rows`) |
| `leadingControlColumns` | Built from `getLeadControlColumns` + color indicator + actions | Dynamic | Yes |
| `trailingControlColumns` | Pass-through from consumer | Consumer-provided | Yes |
| `ref` | Forwarded via `useImperativeHandle` | Internal | Yes |

## 2. Column Configuration

### 2.1 Schema

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| `schema` | `getSchemaByKbnType()` maps Kibana field types to EUI schemas: `numeric`, `boolean`, `string`, `datetime`, `kibana-json` | Indirectly via `columnsMeta` |
| `schemaDetectors` | `getSchemaDetectors()` returns custom `kibanaJSON` detector | No (hardcoded) |

### 2.2 Column Display

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| `display` | Custom header components: `DataTableColumnHeader`, `DataTableTimeColumnHeader`, `DataTableScoreColumnHeader`, `UnifiedDataTableSummaryColumnHeader` | Yes (`showColumnTokens`, `customGridColumnsConfiguration`) |
| `displayAsText` | From `getColumnDisplayName()` | Yes (via `settings.columns[].display`) |
| `initialWidth` | From `settings.columns[column].width` or `defaultTimeColumnWidth` (212px) | Yes (via `settings`, `onResize`) |
| `displayHeaderCellProps` | `{ className: 'unifiedDataTable__headerCell' }` | No (hardcoded) |

### 2.3 Column Actions

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| `actions.showHide` | Remove column; disabled for `_source` and time field | No |
| `actions.showMoveLeft/Right` | Disabled for default columns | No |
| `actions.additional` | Reset width, copy column name, copy column values, edit field | Partially |
| `cellActions` | Default: Filter In, Filter Out, Copy; or from `useDataGridColumnsCellActions` | Yes (`cellActionsTriggerId`, `cellActionsMetadata`, `cellActionsHandling`, `disableCellActions`) |
| `visibleCellActions` | Per-column limit (default 3 in Discover) | Yes |
| `isExpandable` | `false` when `disableCellActions` | Yes |
| `isSortable` | From `isSortable()` based on field type and mode | Yes (`isSortEnabled`) |

## 3. Cell Rendering

### 3.1 `renderCellValue`

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| Core render function | `getRenderCellValueFn()` → `UnifiedDataTableRenderCellValue`; wrapped by `useDataGridInTableSearch` when enabled | Yes (`externalCustomRenderers`) |
| Cell content | `SourceDocument` for `_source`/top-level objects; `formatFieldValue` for scalars; custom renderers per column | Yes (`externalCustomRenderers`) |
| `setCellProps` | Used for anchor highlight (`unifiedDataTable__cell--highlight`) and expanded row (`unifiedDataTable__cell--expanded`) | No |
| `isDetails` | Drives popover vs inline content | EUI-driven |

### 3.2 `renderCellPopover`

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| Popover rendering | `getCustomCellPopoverRenderer()` or consumer `renderCellPopover` | Yes (`renderCellPopover`, `disableCellPopover`) |
| Popover styling | `panelClassName: 'unifiedDataTable__cellPopover'`; max width capped at `min(75vw, 600px)` for `_source` | No (hardcoded) |

### 3.3 `cellContext`

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| Context pass-through | Extended by in-table search with `{ inTableSearchTerm, activeMatch, ... }` | Yes (`cellContext`) |

## 4. Row Heights

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| `rowHeightsOptions` | From `useRowHeightsOptions({ rowHeightLines, rowLineHeight })` | Yes |
| `defaultHeight` | `'auto'` or `{ lineCount: N }` (1-20) | Yes (`rowHeightState`, `onUpdateRowHeight`, `configRowHeight`) |
| `lineHeight` | `defaultRowLineHeight` (1.6em) or `rowLineHeightOverride` | Yes (`rowLineHeightOverride`) |
| Header row height | Separate `useRowHeight` for header | Yes (`headerRowHeightState`, `onUpdateHeaderRowHeight`, `configHeaderRowHeight`) |

## 5. Toolbar

### 5.1 `toolbarVisibility`

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| `showColumnSelector` | `{ allowHide: false, allowReorder: true }`; `false` when default columns | Partially |
| `showSortSelector` | From `isSortEnabled` | Yes |
| `additionalControls` | Document selection, bulk actions, in-table search, `externalAdditionalControls` | Yes (`externalAdditionalControls`, `enableComparisonMode`, `enableInTableSearch`) |
| `showDisplaySelector` | Shown when density/row height/sample size callbacks exist | Yes |
| `showKeyboardShortcuts` | Default `true` | Yes (`showKeyboardShortcuts`) |
| `showFullScreenSelector` | Default `true` | Yes (`showFullScreenButton`) |

### 5.2 `renderCustomToolbar`

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| Custom toolbar rendering | Wraps consumer `renderCustomToolbar` with `additionalControls` and `inTableSearchControl` | Yes (`renderCustomToolbar`) |
| Internal toolbar layout | Column control, sort control, additional controls, keyboard shortcuts, display, full screen | Partially (via `getRenderCustomToolbarWithElements`) |

### 5.3 Display Selector

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| `customRender` | `UnifiedDataTableAdditionalDisplaySettings`: row height, header row height, sample size, density | Yes (via callbacks) |
| `allowDensity` | When `onUpdateDataGridDensity` provided | Yes |
| `allowRowHeight` | When row/header row height callbacks provided | Yes |
| `allowResetButton` | `false` | No (hardcoded) |

## 6. Grid Styling

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| `gridStyle` | `DATA_GRID_STYLE_DEFAULT` + `DATA_GRID_DENSITY_STYLE_MAP[density]` + `gridStyleOverride` | Yes (`gridStyleOverride`, `dataGridDensityState`, `onUpdateDataGridDensity`) |
| Default style | `border: 'horizontal'`, `stripes: true`, `rowHover: 'highlight'`, `header: 'underline'` | No (hardcoded) |
| Density styles | COMPACT (s/s), NORMAL (m/m), EXPANDED (l/l) | Yes |

## 7. Pagination

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| Pagination mode | Used only when `paginationMode === 'multiPage'` | Yes (`isPaginationEnabled`, `paginationMode`) |
| `pageIndex` | From `currentPageIndex` (restorable) | Yes (`onUpdatePageIndex`) |
| `pageSize` | From `rowsPerPageState` or `DEFAULT_ROWS_PER_PAGE` (100) | Yes (`rowsPerPageState`, `onUpdateRowsPerPage`) |
| `pageSizeOptions` | `getRowsPerPageOptions()` or `rowsPerPageOptions` | Yes |
| Infinite scroll | Throttled `onScroll` handler for scroll-to-bottom / load more | Yes (`loadMore`) |

## 8. Sorting

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| Sorting state | From `useSorting()` | Yes (`sort`, `onSort`, `isSortEnabled`) |
| `sorting.columns` | From `sort` prop | Yes |
| `sorting.onSort` | Calls `onSort` with `[id, direction][]` | Yes |
| In-memory sorting | Used for ES\|QL when `isPlainRecord && defaultColumns` is false | Yes (`isPlainRecord`) |
| Server-side sorting | When `!isPlainRecord` or not default columns | Yes |

## 9. Column Resize

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| `onColumnResize` | Passed to `onResize` | Yes (`onResize`) |
| Reset width | Column action available when `columnWidth > 0` and `onResize` provided | Yes |

## 10. Custom Grid Body

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| `renderCustomGridBody` | Pass-through to `EuiDataGrid` | Yes (`renderCustomGridBody`) |

## 11. Virtualization

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| `virtualizationOptions` | `{ overscanRowCount: 20 }` when not default columns | No (internal) |
| `onScroll` | Throttled handler for infinite scroll / load more | No (internal) |

## 12. Control Columns

### 12.1 Leading Control Columns

| Column | Description | Exposed |
|--------|-------------|---------|
| Color indicator | From `getColorIndicatorControlColumn` when `getRowIndicator` provided | Yes (`getRowIndicator`) |
| Select (checkbox) | `SelectButton` / `getSelectAllButton` | Yes (`controlColumnIds`) |
| Open details (expand) | `ExpandButton` | Yes (`controlColumnIds`) |
| Row menu | From `getActionsColumn` | Yes (`rowAdditionalLeadingControls`, `externalControlColumns`) |

### 12.2 Trailing Control Columns

| Feature | Implementation | Exposed |
|---------|---------------|---------|
| Trailing columns | Pass-through | Yes (deprecated in favor of `rowAdditionalLeadingControls`) |

## 13. Imperative API (ref)

| Method | Usage | Internal/External |
|--------|-------|-------------------|
| `closeCellPopover` | Used in cell actions and `renderCellValue` | Internal |
| `scrollToItem` | Used by in-table search | Internal |
| `setIsFullScreen` | Used by full-screen watcher | Internal |

## 14. Extended Features (Built on Top of EuiDataGrid)

### 14.1 In-Table Search

- **Hook:** `useDataGridInTableSearch` wraps `renderCellValue`, adds `cellContext`, provides toolbar control.
- **Search control:** Rendered in toolbar via `additionalControls.right` or `renderCustomToolbar`.
- **Highlighting:** `inTableSearchTermCss` applied to grid wrapper.
- **State persistence:** Search term and active match persisted via `initialState`/`onInitialStateChange`.
- **Consumer prop:** `enableInTableSearch`.

### 14.2 Document Comparison

- **Component:** `CompareDocuments` renders a separate `EuiDataGrid` when `isCompareActive`.
- **Features:** `inMemory: { level: 'sorting' }`, `rowHeightsOptions: { defaultHeight: 'auto' }`, custom toolbar.
- **Behavior:** Main grid is swapped for comparison view when active.
- **Consumer prop:** `enableComparisonMode`.

### 14.3 Document Selection and Bulk Actions

- **Component:** `DataTableDocumentToolbarBtn`.
- **Features:** Filter to selected, compare, copy, custom bulk actions.
- **Consumer prop:** `customBulkActions`.

### 14.4 Full Screen

- **Hook:** `useFullScreenWatcher` tracks full-screen state and grid wrapper ref.
- **Prop:** `onFullScreenChange` passed to `EuiDataGrid`.
- **Consumer prop:** `showFullScreenButton`.

## 15. Discover-Specific Configuration

Discover passes these notable configuration values to `UnifiedDataTable`:

| Prop | Value | Purpose |
|------|-------|---------|
| `showColumnTokens` | `true` | Field type tokens in column headers |
| `canDragAndDropColumns` | `true` | Column reorder via DnD |
| `enableComparisonMode` | `true` | Document comparison feature |
| `enableInTableSearch` | `true` | In-table search feature |
| `visibleCellActions` | `3` | Max cell actions visible on hover |
| `renderCustomToolbar` | `getRenderCustomToolbarWithElements` | Custom toolbar with view mode toggle, callouts, loading indicators |
| `getRowIndicator` | From profile (Security, Logs) | Row color indicator based on data type |
| `rowAdditionalLeadingControls` | From profile | Extra row actions based on data type |
| `customGridColumnsConfiguration` | From profile | Column customization per data type |
| `cellActionsTriggerId` | `DISCOVER_CELL_ACTIONS_TRIGGER_ID` | Cell actions trigger for uiActions |
| `cellActionsHandling` | `"append"` | Append cell actions to defaults |
| `externalCustomRenderers` | From profile `getCellRenderers` | Custom cell renderers per data type |

## 16. EuiDataGrid Props Not Utilized by `UnifiedDataTable`

The following `EuiDataGrid` props are **not used** by `UnifiedDataTable`:

- `inMemory` (only in `CompareDocuments`)
- `minSizeForControls`
- `renderFooterCellValue`
- `className` / `css` (applied to wrapper div, not `EuiDataGrid`)
- `height` / `width` (handled by parent layout)

## 17. Feature Summary by Exposure Level

**Consumer-configurable (30+ props):** `ariaLabelledBy`, `columns`, `columnsMeta`, `settings`, `canDragAndDropColumns`, `controlColumnIds`, `rowAdditionalLeadingControls`, `externalControlColumns`, `trailingControlColumns`, `getRowIndicator`, `externalCustomRenderers`, `renderCellPopover`, `disableCellPopover`, `cellContext`, `rowHeightState`, `headerRowHeightState`, `renderCustomToolbar`, `gridStyleOverride`, `dataGridDensityState`, `sort`, `onSort`, `onResize`, `renderCustomGridBody`, `onFullScreenChange`, `enableInTableSearch`, `enableComparisonMode`, `customBulkActions`, `cellActionsTriggerId`, `cellActionsMetadata`, `cellActionsHandling`, `visibleCellActions`, `disableCellActions`, `rowsPerPageOptions`, `showFullScreenButton`, `showKeyboardShortcuts`, and more.

**Internal/hardcoded:** `schemaDetectors`, `displayHeaderCellProps`, `virtualizationOptions`, default toolbar layout, default cell actions (Filter In/Out, Copy), default popover styling, density style map, default grid style.
