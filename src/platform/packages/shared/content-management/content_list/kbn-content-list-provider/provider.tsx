/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useEffect, useId, useMemo } from 'react';
import { type PropsWithChildren, createContext, useContext } from 'react';
import { ContentManagementTagsProvider } from '@kbn/content-management-tags';
import {
  UserProfilesProvider,
  type UserProfilesServices,
} from '@kbn/content-management-user-profiles';
import { FavoritesContextProvider } from '@kbn/content-management-favorites-public';
import type { UserContentCommonSchema } from '@kbn/content-management-table-list-view-common';
import type { ContentListServices, ContentListConfig, ContentListCoreConfig } from './types';
import type { ContentListFeatures, ServiceDisables, Supports } from './features';
import type { DataSourceConfig, ContentListStrategy } from './datasource';
import { ContentListStateProvider } from './state';
import { QueryClientProvider, contentListQueryClient } from './query_client';
import { createParseSearchQuery, createContextValue } from './utils';

/**
 * Track active provider instances to detect potential cache key collisions.
 * Maps `entityName` → Set of explicitly provided `queryKeyScope` values.
 * @internal
 */
const activeProviders = new Map<string, Set<string>>();

/**
 * Warns in development when multiple providers share the same explicit `queryKeyScope`.
 *
 * Note: Since providers now auto-generate a unique `queryKeyScope` via `useId()` when not
 * explicitly provided, this warning only fires when a user explicitly passes the same
 * `queryKeyScope` value to multiple provider instances.
 *
 * When `queryKeyScope` is `undefined`, no tracking or warning occurs because the provider
 * will use an auto-generated unique scope internally.
 */
export const warnOnQueryKeyScopeCollision = (
  entityName: string,
  queryKeyScope: string | undefined
): (() => void) => {
  // Skip tracking for undefined scopes - providers auto-generate unique scopes internally.
  if (process.env.NODE_ENV !== 'development' || queryKeyScope === undefined) {
    return () => {};
  }

  const scopes = activeProviders.get(entityName) ?? new Set();

  if (scopes.has(queryKeyScope)) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ContentListProvider] Multiple providers detected with entityName="${entityName}"` +
        ` and queryKeyScope="${queryKeyScope}". ` +
        'This will cause React Query cache collisions. ' +
        'If this is intentional (shared cache), you can ignore this warning. ' +
        'Otherwise, provide a unique `queryKeyScope` prop to each provider instance.'
    );
  }

  scopes.add(queryKeyScope);
  activeProviders.set(entityName, scopes);

  // Return cleanup function to remove this instance on unmount.
  return () => {
    const currentScopes = activeProviders.get(entityName);
    if (currentScopes) {
      currentScopes.delete(queryKeyScope);
      if (currentScopes.size === 0) {
        activeProviders.delete(entityName);
      }
    }
  };
};

/**
 * Internal context value type.
 *
 * Uses `UserContentCommonSchema` as the base type for `dataSource` since the generic `T`
 * is only needed for type-checking at the props level. Once items are fetched, they get
 * transformed to `ContentListItem`, so the internal state doesn't need to know about `T`.
 */
export interface ContentListProviderContextValue extends ContentListCoreConfig {
  dataSource: DataSourceConfig<UserContentCommonSchema>;
  features: ContentListFeatures;
  /** Resolved service availability flags. */
  supports: Supports;
  /** Processing strategy for the content list. */
  strategy: ContentListStrategy;
  queryKeyScope?: string;
  /** User profile services when available. */
  userProfileServices?: UserProfilesServices;
}

export const ContentListContext = createContext<ContentListProviderContextValue | null>(null);

/**
 * Props for the `ContentListProvider` component.
 *
 * @template T The raw item type from the datasource (defaults to `UserContentCommonSchema`).
 */
export interface ContentListProviderProps<T = UserContentCommonSchema>
  extends ContentListConfig<T> {
  /** Services required by the provider (tags, favorites, user profiles). */
  services: ContentListServices;
  /** Feature configuration for enabling/customizing capabilities. */
  features?: ContentListFeatures;
  /**
   * Explicitly disable service-dependent capabilities even when services are provided.
   *
   * Service-dependent capabilities (tags, favorites, userProfiles) are automatically
   * enabled when the corresponding service is provided. Use this to explicitly disable
   * a capability even when the service is available.
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
  disable?: ServiceDisables;
}

/**
 * Main provider component for content list functionality.
 *
 * This provider sets up the context for managing content lists, including:
 * - Data fetching and caching via React Query
 * - Search and filtering
 * - Sorting and pagination
 * - Item selection
 * - Optional integrations (tags, favorites, user profiles)
 *
 * Service-dependent features (tags, favorites, userProfiles) are automatically enabled
 * when the corresponding service is provided. Set the feature to `false` to disable.
 *
 * @example
 * ```tsx
 * // Custom findItems function that fetches from your API.
 * const findItems: FindItemsFn = async ({ searchQuery, filters, sort, page, signal }) => {
 *   const response = await myApi.search({
 *     query: searchQuery,
 *     tags: filters.tags,
 *     favoritesOnly: filters.favoritesOnly,
 *     sortField: sort.field,
 *     sortOrder: sort.direction,
 *     page: page.index,
 *     pageSize: page.size,
 *     signal,
 *   });
 *
 *   return {
 *     items: response.items,
 *     total: response.total,
 *   };
 * };
 *
 * <ContentListProvider
 *   entityName="dashboard"
 *   entityNamePlural="dashboards"
 *   dataSource={{ findItems }}
 *   services={{ tags: tagsService, favorites: favoritesService }}
 * >
 *   <MyContentList />
 * </ContentListProvider>
 * ```
 *
 * For Kibana saved objects, use `ContentListKibanaProvider` instead, which
 * provides built-in strategies for fetching saved objects.
 */
export const ContentListProvider = <T extends UserContentCommonSchema = UserContentCommonSchema>({
  children,
  dataSource,
  entityName,
  entityNamePlural,
  item,
  isReadOnly,
  queryKeyScope: queryKeyScopeProp,
  services,
  features = {},
  disable = {},
}: PropsWithChildren<ContentListProviderProps<T>>): JSX.Element => {
  // Generate a stable unique ID for this provider instance.
  // Used as the default queryKeyScope to prevent cache collisions.
  const generatedId = useId();
  const queryKeyScope = queryKeyScopeProp ?? generatedId;

  const {
    favorites: favoritesService,
    tags: tagsService,
    userProfile: userProfileService,
  } = services;

  // Service presence implies capability is enabled, unless explicitly disabled.
  // This allows: services={{ favorites }} without needing to set anything else.
  const supportsTags = !disable.tags && !!tagsService;
  const supportsFavorites = !disable.favorites && !!favoritesService;
  const supportsUserProfiles = !disable.userProfiles && !!userProfileService;

  // Warn in development if multiple providers share the same explicit queryKeyScope.
  // Only warn when the prop was explicitly provided (not auto-generated).
  useEffect(
    () => warnOnQueryKeyScopeCollision(entityName, queryKeyScopeProp),
    [entityName, queryKeyScopeProp]
  );

  const parseSearchQuery = useMemo(
    () => (supportsTags ? createParseSearchQuery(tagsService.getTagList) : undefined),
    [supportsTags, tagsService]
  );

  // Create context value using shared helper.
  // Cast dataSource to base type for internal context storage.
  // The generic T is only used for type-checking props; internally we work with the base schema.
  // Base provider defaults to 'client' strategy; Kibana providers override as needed.
  const value: ContentListProviderContextValue = createContextValue(
    { entityName, entityNamePlural, item, isReadOnly },
    dataSource as DataSourceConfig<UserContentCommonSchema>,
    features,
    { tags: supportsTags, favorites: supportsFavorites, userProfiles: supportsUserProfiles },
    'client',
    queryKeyScope,
    supportsUserProfiles ? userProfileService : undefined
  );

  // Build provider wrappers conditionally to avoid non-null assertions.
  let content: React.ReactNode = (
    <ContentListContext.Provider value={value}>
      <ContentListStateProvider>{children}</ContentListStateProvider>
    </ContentListContext.Provider>
  );

  // Wrap with optional providers based on service availability.
  if (supportsUserProfiles && userProfileService) {
    content = <UserProfilesProvider {...userProfileService}>{content}</UserProfilesProvider>;
  }

  if (supportsTags && tagsService) {
    content = (
      <ContentManagementTagsProvider
        getTagList={tagsService.getTagList}
        parseSearchQuery={parseSearchQuery}
      >
        {content}
      </ContentManagementTagsProvider>
    );
  }

  if (supportsFavorites && favoritesService) {
    content = <FavoritesContextProvider {...favoritesService}>{content}</FavoritesContextProvider>;
  }

  return <QueryClientProvider client={contentListQueryClient}>{content}</QueryClientProvider>;
};

/**
 * Hook to access the content list services and configuration context.
 *
 * This is a low-level hook that provides access to all configuration and
 * support flags. For most use cases, prefer the feature-specific hooks
 * like `useContentListItems`, `useContentListSearch`, etc.
 *
 * @throws Error if used outside `ContentListProvider`.
 * @returns The content list context including configuration and support flags.
 */
export const useContentListConfig = () => {
  const context = useContext(ContentListContext);
  if (!context) {
    throw new Error(
      'ContentListContext is missing. Ensure your component or React root is wrapped with ContentListProvider.'
    );
  }
  return context;
};

/**
 * Hook to get the current content list processing strategy.
 *
 * @returns The processing strategy: `'client'` for client-side or `'server'` for server-side.
 * @throws Error if used outside `ContentListProvider`.
 *
 * @example
 * ```tsx
 * const strategy = useContentListStrategy();
 * if (strategy === 'client') {
 *   // Client-side processing: all items fetched, filtered/sorted in browser.
 * } else {
 *   // Server-side processing: filtering/sorting/pagination handled by server.
 * }
 * ```
 */
export const useContentListStrategy = (): ContentListStrategy => {
  const { strategy } = useContentListConfig();
  return strategy;
};
