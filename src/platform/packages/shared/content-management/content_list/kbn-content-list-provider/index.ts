/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

/**
 * Content List Provider - Feature-based modular architecture
 *
 * ## Architecture
 *
 * This package uses a layered architecture with feature-based organization:
 *
 * **Layer 1: ContentListProvider** - Static configuration context
 * - Holds configuration props (entity names, actions, data source, feature configs)
 * - Accessed via `useContentListConfig()`
 * - Values don't change during component lifecycle
 *
 * **Layer 2: ContentListStateProvider** - Runtime state management
 * - Manages dynamic state (items, loading, search, filters, pagination)
 * - Accessed via feature-based hooks (useContentListItems, useContentListSearch, etc.)
 * - Current implementation uses useReducer
 *
 * ## Features
 *
 * Each feature is encapsulated in its own directory with colocated types and hooks:
 * - search: Search functionality
 * - filtering: Filter management
 * - sorting: Sort controls
 * - pagination: Page navigation
 * - selection: Item selection and bulk actions
 * - global_actions: List-level actions (onCreate, etc.)
 * - analytics: Analytics integration
 * - preview: Item preview
 * - favorites: Favorites integration
 * - recently_accessed: Recently accessed items
 * - url_state: URL state synchronization
 */

// Main providers
export {
  ContentListProvider,
  useContentListConfig,
  useContentListStrategy,
  type ContentListProviderProps,
} from './provider';

// Re-export internal type with a public-facing name.
export type { ContentListProviderContextValue as ContentListConfigValue } from './provider';

export {
  ContentListClientKibanaProvider,
  type ContentListClientKibanaProviderProps,
} from './kibana_client_provider';

export {
  ContentListServerKibanaProvider,
  type ContentListServerKibanaProviderProps,
} from './kibana_server_provider';

// Configuration hook
export { useContentListState } from './state';

// State hooks
export { useContentListItems } from './state';

// Feature hooks
export {
  useContentListSearch,
  useQueryFilter,
  useContentListFilters,
  useFilterDisplay,
  useContentListSort,
  useSortableFields,
  useContentListPagination,
  useContentListSelection,
  useContentEditorAction,
  createActivityAppendRows,
} from './features';

// Filter display types
export type { FilterDisplayState } from './features';

// Query filter types
export type {
  UseQueryFilterOptions,
  QueryFilterType,
  QueryFilterState,
  QueryFilterActions,
  IdentityResolver,
} from './features';

// Common types
export type { ContentListItem, TransformFunction } from './common';

// Datasource types
export type {
  ContentListStrategy,
  DataSourceConfig,
  FindItemsFn,
  FindItemsParams,
  FindItemsResult,
} from './datasource';
export { defaultTransform } from './datasource';

// Item types
export type {
  ItemConfig,
  CustomActionConfig,
  ActionHandler,
  ActionConfig,
  ActionConfigObject,
} from './item';

// Feature types
export type {
  SearchConfig,
  FilteringConfig,
  ActiveFilters,
  TagFilters,
  CustomFilterDefinition,
  SortingConfig,
  SortOption,
  SortField,
  PaginationConfig,
  SelectionActions,
  GlobalActionsConfig,
  AnalyticsConfig,
  PreviewConfig,
  RecentlyAccessedConfig,
  URLStateConfig,
  ContentEditorConfig,
  ContentEditorSaveArgs,
  ContentEditorValidator,
  ContentEditorValidators,
} from './features';

// Sorting constants
export { DEFAULT_SORT_FIELDS } from './features';

// State types
export type { ContentListState } from './state';

// Query hooks
export { useContentListItemsQuery, contentListKeys } from './queries';

// Configuration types
export type { ContentListCoreConfig, ContentListConfig, ContentListServices } from './types';

// Feature configuration
export type { ContentListFeatures, ServiceDisables, Supports } from './features';
