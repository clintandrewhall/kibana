# EuiDataGrid Usage Inventory

This document catalogs every location where `EuiDataGrid` is used across the Kibana codebase, including direct usages and consumption through wrapper abstractions.

## Wrapper Abstraction Layers

Seven wrapper components sit between consuming code and `EuiDataGrid`. These are the most critical targets for any migration effort, as replacing them propagates changes to all downstream consumers.

| Wrapper | Package | File | Description |
|---------|---------|------|-------------|
| `UnifiedDataTable` | `@kbn/unified-data-table` | `src/platform/packages/shared/kbn-unified-data-table/src/components/data_table.tsx` | Primary wrapper for Discover, ES\|QL, and related use cases. The most important abstraction layer. |
| `TimelineDataTable` | `security_solution` | `x-pack/solutions/security/plugins/security_solution/public/timelines/components/timeline/unified_components/data_table/index.tsx` | Security-specific wrapper around `UnifiedDataTable` for timelines. |
| `AlertsDataGrid` | `@kbn/response-ops-alerts-table` | `x-pack/platform/packages/shared/response-ops/alerts-table/components/alerts_data_grid.tsx` | Alerts-focused wrapper with bulk actions, row selection, and custom grid body. |
| `DataTableComponent` | `@kbn/securitysolution-data-table` | `x-pack/solutions/security/packages/data-table/components/data_table/index.tsx` | Legacy Security events viewer wrapper. |
| `CloudSecurityDataTable` | `cloud_security_posture` | `x-pack/solutions/security/plugins/cloud_security_posture/public/components/cloud_security_data_table/cloud_security_data_table.tsx` | CSP wrapper around `UnifiedDataTable` for findings and vulnerabilities. |
| `DataGrid` (ML) | `@kbn/ml-data-grid` | `x-pack/platform/packages/private/ml/data_grid/components/data_grid.tsx` | ML wrapper for index preview, transform, and data frame analytics. |
| `EventLogDataGrid` | `triggers_actions_ui` | `x-pack/platform/plugins/shared/triggers_actions_ui/public/application/sections/common/components/event_log/event_log_data_grid.tsx` | Wrapper for rule and connector execution logs. |

## Dependency Chain

```
EuiDataGrid (@elastic/eui)
│
├── UnifiedDataTable (@kbn/unified-data-table)
│   ├── Discover (main grid, context app, saved search embeddable)
│   ├── ES|QL DataGrid
│   ├── TimelineDataTable (Security) → Timeline tabs
│   ├── CloudSecurityDataTable → Findings, Vulnerabilities
│   ├── Asset Inventory
│   └── SLO Documents Table
│
├── AlertsDataGrid (@kbn/response-ops-alerts-table)
│   ├── Security: Alerts, Alert Summary, Cases EASE, Attack Discovery
│   ├── Observability: Alerts, Overview, Rule Details, Cases, Related Alerts
│   ├── Infra: Hosts, Alerts Overview
│   ├── APM, Synthetics, SLO Alerts
│   └── Embeddable Alerts Table
│
├── DataTableComponent (@kbn/securitysolution-data-table)
│   ├── Events Viewer (StatefulEventsViewer)
│   └── Case Events
│
├── DataGrid (@kbn/ml-data-grid)
│   ├── Transform: preview, step define, step summary
│   └── ML: analytics exploration, analytics creation
│
├── EventLogDataGrid (triggers_actions_ui)
│   ├── Rule event log
│   └── Connector event log
│
└── Direct EuiDataGrid (no wrapper)
    ├── Threat Intelligence Indicators Table
    ├── Stack Alerts test query table
    ├── Streams: preview table, schema editor
    ├── Osquery results
    ├── Lens datatable visualization
    ├── Profiling: top-N functions, differential top-N
    ├── ML classification evaluate panel
    ├── Workflows JSON data table
    ├── Unified Doc Viewer: table grid, attributes table
    ├── Vega inspector, Table vis
    └── Logs overview log categories grid
```

## Consumers via `UnifiedDataTable`

| Consumer | Plugin/Package | File |
|----------|---------------|------|
| Discover main grid | `discover` | `src/platform/plugins/shared/discover/public/components/discover_grid/discover_grid.tsx` |
| Cascaded documents | `discover` | `src/platform/plugins/shared/discover/public/application/main/components/layout/cascaded_documents/blocks/cascade_leaf_component.tsx` |
| Context app | `discover` | `src/platform/plugins/shared/discover/public/application/context/context_app_content.tsx` |
| Saved search embeddable | `discover` | `src/platform/plugins/shared/discover/public/embeddable/components/saved_search_grid.tsx` |
| ES\|QL data grid | `esql_datagrid` | `src/platform/plugins/shared/esql_datagrid/public/data_grid.tsx` |
| Security Timeline | `security_solution` | `x-pack/solutions/security/plugins/security_solution/public/timelines/components/timeline/unified_components/index.tsx` |
| Asset Inventory | `security_solution` | `x-pack/solutions/security/plugins/security_solution/public/asset_inventory/components/asset_inventory_data_table.tsx` |
| CSP Findings | `cloud_security_posture` | `x-pack/solutions/security/plugins/cloud_security_posture/public/pages/configurations/latest_findings/latest_findings_table.tsx` |
| CSP Vulnerabilities | `cloud_security_posture` | `x-pack/solutions/security/plugins/cloud_security_posture/public/pages/vulnerabilities/latest_vulnerabilities_table.tsx` |
| SLO Documents | `slo` | `x-pack/solutions/observability/plugins/slo/public/pages/slo_edit/components/common/documents_table.tsx` |

## Consumers via `AlertsDataGrid`

| Consumer | Plugin/Package | File |
|----------|---------------|------|
| Security Detection Alerts | `security_solution` | `x-pack/solutions/security/plugins/security_solution/public/detections/components/alerts_table/index.tsx` |
| Security Alert Summary | `security_solution` | `x-pack/solutions/security/plugins/security_solution/public/detections/components/alert_summary/table/table.tsx` |
| Cases EASE Alerts | `security_solution` | `x-pack/solutions/security/plugins/security_solution/public/cases/components/ease/table.tsx` |
| Attack Discovery Alerts | `security_solution` | `x-pack/solutions/security/plugins/security_solution/public/attack_discovery/pages/results/attack_discovery_panel/tabs/alerts_tab/ease/table.tsx` |
| Embeddable Alerts Table | `embeddable_alerts_table` | `x-pack/platform/plugins/shared/embeddable_alerts_table/public/components/embeddable_alerts_table.tsx` |
| Observability Alerts | `observability` | `x-pack/solutions/observability/plugins/observability/public/components/alerts_table/alerts_table.tsx` |
| Observability Overview | `observability` | `x-pack/solutions/observability/plugins/observability/public/pages/overview/components/sections/alerts/alerts_section.tsx` |
| Rule Details Alerts | `observability` | `x-pack/solutions/observability/plugins/observability/public/pages/rule_details/components/rule_details_tabs.tsx` |
| Related Alerts | `observability` | `x-pack/solutions/observability/plugins/observability/public/pages/alert_details/components/related_alerts/related_alerts_table.tsx` |
| Infra Hosts Alerts | `infra` | `x-pack/solutions/observability/plugins/infra/public/pages/metrics/hosts/components/tabs/alerts/alerts_tab_content.tsx` |
| Infra Alerts Overview | `infra` | `x-pack/solutions/observability/plugins/infra/public/components/shared/alerts/alerts_overview.tsx` |
| APM Alerts | `apm` | `x-pack/solutions/observability/plugins/apm/public/components/app/alerts_overview/index.tsx` |
| Synthetics Monitor Alerts | `synthetics` | `x-pack/solutions/observability/plugins/synthetics/public/apps/synthetics/components/monitor_details/monitor_alerts/monitor_detail_alerts.tsx` |
| SLO Detail Alerts | `slo` | `x-pack/solutions/observability/plugins/slo/public/pages/slo_details/components/slo_detail_alerts.tsx` |
| SLO Alerts Embeddable | `slo` | `x-pack/solutions/observability/plugins/slo/public/embeddable/slo/alerts/components/slo_alerts_table.tsx` |

## Direct `EuiDataGrid` Usages (No Wrapper)

| File | Plugin/Package | Description |
|------|---------------|-------------|
| `x-pack/solutions/security/plugins/security_solution/public/threat_intelligence/modules/indicators/components/table/table.tsx` | `security_solution` | Threat intelligence indicators |
| `x-pack/platform/plugins/shared/stack_alerts/public/rule_types/es_query/test_query_row/test_query_row_table.tsx` | `stack_alerts` | ES query rule test results |
| `x-pack/platform/plugins/shared/streams_app/public/components/data_management/shared/preview_table.tsx` | `streams_app` | Stream data preview |
| `x-pack/platform/plugins/shared/streams_app/public/components/data_management/schema_editor/schema_editor_table.tsx` | `streams_app` | Schema editor |
| `x-pack/platform/plugins/shared/osquery/public/results/results_table.tsx` | `osquery` | Osquery results |
| `x-pack/platform/plugins/shared/lens/public/visualizations/datatable/components/table_basic.tsx` | `lens` | Lens datatable visualization |
| `x-pack/platform/plugins/shared/ml/public/application/data_frame_analytics/pages/analytics_exploration/components/classification_exploration/evaluate_panel.tsx` | `ml` | Classification evaluation |
| `x-pack/solutions/observability/plugins/profiling/public/components/topn_functions/index.tsx` | `profiling` | Top-N functions grid |
| `x-pack/solutions/observability/plugins/profiling/public/components/differential_topn_functions_grid/index.tsx` | `profiling` | Differential top-N functions |
| `src/platform/plugins/shared/workflows_management/public/shared/ui/execution_data_viewer/json_data_table.tsx` | `workflows_management` | JSON execution data viewer |
| `src/platform/plugins/shared/unified_doc_viewer/public/components/doc_viewer_table/table_grid.tsx` | `unified_doc_viewer` | Doc viewer table (field/value) |
| `src/platform/plugins/shared/unified_doc_viewer/public/components/observability/attributes/doc_viewer_attributes_overview/attributes_table.tsx` | `unified_doc_viewer` | Attributes overview table |
| `src/platform/plugins/private/vis_types/vega/public/vega_inspector/components/inspector_data_grid.tsx` | `vis_types_vega` | Vega inspector |
| `src/platform/plugins/private/vis_types/table/public/components/table_vis_basic.tsx` | `vis_types_table` | Legacy table visualization |
| `x-pack/platform/packages/shared/logs-overview/src/components/log_categories/log_categories_grid.tsx` | `logs-overview` | Log categories |
| `src/platform/packages/shared/kbn-unified-data-table/src/components/compare_documents/compare_documents.tsx` | `@kbn/unified-data-table` | Document comparison (secondary grid) |

## Summary

| Category | Count |
|----------|-------|
| Wrapper components | 7 |
| Direct `EuiDataGrid` usages | ~20 |
| Consumers via `UnifiedDataTable` | 11 |
| Consumers via `AlertsDataGrid` | 17 |
| Consumers via `DataTableComponent` | 2 |
| Consumers via ML `DataGrid` | 5 |
| Consumers via `EventLogDataGrid` | 2 |
| **Total consumer locations** | **~57** |

## Adoption Considerations

Not every grid needs to move to `@kbn/data-grid`. The value of migrating depends on the complexity and feature demands of each consumer. `EuiDataGrid` remains a solid choice for simpler, self-contained grids where its turnkey toolbar, styling, and accessibility are sufficient.

1. **`UnifiedDataTable` is the primary candidate.** It is the most feature-heavy wrapper and the one most constrained by current `EuiDataGrid` limitations (virtualization bugs, missing sticky columns, performance at scale). Migrating it propagates benefits to Discover, Security Timeline, ES|QL, and other high-value consumers.
2. **`AlertsDataGrid` is a strong secondary candidate.** It serves many consumers with relatively consistent usage patterns and would benefit from improved performance and column pinning.
3. **Direct usages are independent.** Each can be evaluated on its own merits. Some (like Lens datatable or Profiling grids) may be perfectly served by `EuiDataGrid` and not worth the migration cost.
4. **Legacy wrappers (`DataTableComponent`) could be consolidated** onto whichever approach their consumers adopt, but this is not a prerequisite.
5. **Simpler grids** (e.g., event logs, inspector tables, small preview grids) likely gain little from migration and can remain on `EuiDataGrid` indefinitely.
