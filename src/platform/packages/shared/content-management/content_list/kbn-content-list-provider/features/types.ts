/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { SearchConfig } from './search';
import type { FilteringConfig } from './filtering';
import type { SortingConfig } from './sorting';
import type { PaginationConfig } from './pagination';
import type { SelectionActions } from './selection';
import type { GlobalActionsConfig } from './global_actions';
import type { AnalyticsConfig } from './analytics';
import type { PreviewConfig } from './preview';
import type { RecentlyAccessedConfig } from './recently_accessed';
import type { URLStateConfig } from './url_state';
import type { ContentEditorConfig } from './content_editor';

/**
 * Feature configuration for content list behavior.
 *
 * Features are self-contained capabilities that can be enabled/disabled or configured.
 * Service-dependent capabilities (tags, favorites, userProfiles) are controlled
 * separately via the `disable` prop and are auto-enabled when their services are provided.
 */
export interface ContentListFeatures {
  /** Search functionality. Pass `true` for defaults or `SearchConfig` for customization. */
  search?: boolean | SearchConfig;
  /** Filtering functionality. Pass `true` for defaults or `FilteringConfig` for customization. */
  filtering?: boolean | FilteringConfig;
  /** Sorting functionality. Pass `true` for defaults or `SortingConfig` for customization. */
  sorting?: boolean | SortingConfig;
  /** Pagination functionality. Pass `true` for defaults or `PaginationConfig` for customization. */
  pagination?: boolean | PaginationConfig;
  /** Selection actions for bulk operations. */
  selection?: SelectionActions;
  /** Global actions configuration (e.g., create button). */
  globalActions?: GlobalActionsConfig;
  /** URL state synchronization. Pass `true` for defaults or `URLStateConfig` for customization. */
  urlState?: boolean | URLStateConfig;
  /** Analytics tracking configuration. */
  analytics?: AnalyticsConfig;
  /** Item preview configuration. */
  preview?: PreviewConfig;
  /** Recently accessed items tracking. */
  recentlyAccessed?: RecentlyAccessedConfig;
  /**
   * Content editor configuration for metadata editing flyout.
   * When provided, auto-wires the "View details" action on items.
   *
   * - Pass `true` for automatic defaults (uses saved objects client for save).
   * - Pass `ContentEditorConfig` object to customize behavior.
   *
   * @example
   * ```tsx
   * // Minimal - automatic defaults
   * features={{ contentEditor: true }}
   *
   * // Custom configuration
   * features={{ contentEditor: { onSave: customHandler, ... } }}
   * ```
   */
  contentEditor?: boolean | ContentEditorConfig;
}

/**
 * Explicit opt-outs for service-dependent capabilities.
 *
 * When a service is provided (e.g., `tags`, `favorites`, `userProfile`), the corresponding
 * capability is automatically enabled. Use this to explicitly disable a capability even
 * when the service is available.
 *
 * @example
 * ```tsx
 * // Tags service is provided but tags feature is disabled.
 * <ContentListProvider
 *   services={{ tags: tagsService }}
 *   disable={{ tags: true }}
 * >
 * ```
 */
export interface ServiceDisables {
  /** Disable tags even when `tags` service is provided. */
  tags?: true;
  /** Disable favorites even when `favorites` service is provided. */
  favorites?: true;
  /** Disable user profiles even when `userProfile` service is provided. */
  userProfiles?: true;
  /** Disable content editor even when `core` services are provided. */
  contentEditor?: true;
  /** Disable content insights even when `contentInsightsClient` is provided. */
  contentInsights?: true;
}

/**
 * Service availability flags.
 *
 * These represent the resolved state of which service-dependent capabilities
 * are actually available and functional, based on service presence and any
 * explicit disables.
 */
export interface Supports {
  /** Whether tags functionality is available. */
  tags: boolean;
  /** Whether favorites functionality is available. */
  favorites: boolean;
  /** Whether user profiles functionality is available. */
  userProfiles: boolean;
  /** Whether content editor functionality is available. */
  contentEditor: boolean;
  /** Whether content insights functionality is available. */
  contentInsights: boolean;
}
