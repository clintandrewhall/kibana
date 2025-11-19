/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { UserContentCommonSchema } from '@kbn/content-management-table-list-view-common';
import type { ContentManagementTagsServices } from '@kbn/content-management-tags';
import type { ContentManagementTagsKibanaDependencies } from '@kbn/content-management-tags';
import type { FavoritesServices } from '@kbn/content-management-favorites-public';
import type { UserProfilesServices } from '@kbn/content-management-user-profiles';
import type { ContentInsightsClientPublic } from '@kbn/content-management-content-insights-public';
import type { CoreStart } from '@kbn/core/public';
import type { DataSourceConfig } from './datasource';
import type { ItemConfig } from './item';
import type { TransformFunction } from './common';
import type { ContentListFeatures, ServiceDisables } from './features';

/**
 * Core configuration - entity metadata and base settings.
 * No generic needed - these settings are datasource-agnostic.
 */
export interface ContentListCoreConfig {
  /** Singular name for the entity type (e.g., "dashboard", "visualization"). */
  entityName: string;
  /** Plural name for the entity type (e.g., "dashboards", "visualizations"). */
  entityNamePlural: string;
  /** Per-item configuration for links and actions. */
  item?: ItemConfig;
  /** When `true`, disables selection and editing actions. */
  isReadOnly?: boolean;
  /**
   * Unique scope identifier for React Query cache keys.
   *
   * Use this when you have multiple content lists with the same `entityName` but different
   * `dataSource` implementations to prevent cache collisions. If not provided, only `entityName`
   * is used for cache key scoping.
   *
   * @example
   * ```tsx
   * // Two dashboard lists with different data sources
   * <ContentListProvider entityName="dashboard" queryKeyScope="my-dashboards" dataSource={...} />
   * <ContentListProvider entityName="dashboard" queryKeyScope="shared-dashboards" dataSource={...} />
   * ```
   */
  queryKeyScope?: string;
}

/**
 * Complete configuration for content list.
 * @template T The raw item type from the datasource (defaults to `UserContentCommonSchema`).
 *
 * Generic is only needed for `dataSource` - all other config works with transformed `ContentListItem`.
 */
export type ContentListConfig<T = UserContentCommonSchema> = ContentListCoreConfig & {
  dataSource: DataSourceConfig<T>;
};

/**
 * Complete services including tag management and optional user profiles.
 *
 * Note: EuiSearchBar supports integrated filter dropdowns via `filters` prop
 * (e.g., taggingApi.ui.getSearchBarFilter()). We've opted to use the standalone
 * filter components (Tags, CreatedBy, etc.) instead, which provide richer functionality
 * like include/exclude support, counts, and search within the filter popover.
 */
export interface ContentListServices {
  /** User profile service for user filtering and display. */
  userProfile?: UserProfilesServices;
  /** Favorites service for favorite items functionality. */
  favorites?: FavoritesServices;
  /** Tags service for tag filtering and management. */
  tags?: ContentManagementTagsServices;
}

/**
 * Base props shared by all Kibana providers.
 * @template T The item type from the datasource.
 */
export interface ContentListKibanaProviderBaseProps<T = UserContentCommonSchema>
  extends ContentListCoreConfig,
    ContentManagementTagsKibanaDependencies {
  /** Core Kibana services. */
  core: CoreStart;
  /** The saved object type to fetch. */
  savedObjectType: string;
  /**
   * Optional transform function to convert raw items to the expected format.
   * Default transform is applied for `UserContentCommonSchema`-compatible types.
   */
  transform?: TransformFunction<T>;
  /** Optional favorites service for favorite items functionality. */
  favorites?: FavoritesServices;
  /**
   * Optional content insights client for activity tracking and display.
   * When provided, enables activity views in the content editor.
   */
  contentInsightsClient?: ContentInsightsClientPublic;
  /** Feature configuration for enabling/customizing capabilities. */
  features?: ContentListFeatures;
  /**
   * Explicitly disable service-dependent capabilities even when services are provided.
   *
   * @example
   * ```tsx
   * // Tags service is provided but tags feature is disabled.
   * <ContentListServerKibanaProvider
   *   savedObjectsTagging={tagging}
   *   disable={{ tags: true }}
   * >
   * ```
   */
  disable?: ServiceDisables;
}
