/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

/**
 * Content List Provider
 *
 * A modular, feature-based architecture for building content listing UIs.
 */

// Provider.
export { ContentListProvider, useContentListConfig } from './src/context';
export type {
  ContentListProviderProps,
  ContentListIdentity,
  ContentListLabels,
  ContentListCoreConfig,
  ContentListConfig,
  ContentListServices,
} from './src/context';

// Hooks.
export { useContentListItems } from './src/state';
export { useContentListSort, useContentListUserFilter } from './src/features';

// Types — features.
export type {
  ContentListFeatures,
  ContentListSupports,
  SortField,
  SortOption,
  SortingConfig,
  UseContentListSortReturn,
  UseContentListUserFilterReturn,
} from './src/features';

// Types — datasource.
export type {
  FindItemsFn,
  FindItemsParams,
  FindItemsResult,
  DataSourceConfig,
  ActiveFilters,
} from './src/datasource';

// Types — item.
export type { ContentListItem, ContentListItemConfig } from './src/item';

// Types — services.
export type { UserProfileService } from './src/services';

// Types — state.
export type { ContentListQueryData } from './src/state';

// Utilities.
export { contentListKeys } from './src/query';
