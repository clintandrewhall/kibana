/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { useMemo } from 'react';
import { useQuery } from '@kbn/react-query';
import type { ParsedQuery } from '@kbn/content-management-tags';
import type { DataSourceConfig, FindItemsParams, ResolvedFilters } from './datasource';
import type { ContentListItem, TransformFunction } from './common';
import type { IdentityResolver } from './features/search';
import type { ActiveFilters, FilteringConfig } from './features/filtering';
import { defaultTransform } from './datasource';
import type { FindItemsResult } from './datasource';
import { getAllCustomFilterKeys, buildQuerySchema, parseQueryFilters, sortItems } from './utils';

/**
 * Query keys for content list items.
 * Includes entity name and optional scope in keys to prevent cache collisions.
 *
 * Use these keys for manual cache invalidation or prefetching with React Query.
 *
 * @example
 * ```ts
 * // Invalidate all content list queries for dashboards
 * queryClient.invalidateQueries(contentListKeys.all('dashboard'));
 *
 * // Invalidate queries for a specific scope
 * queryClient.invalidateQueries(contentListKeys.all('dashboard', 'my-scope'));
 *
 * // Invalidate a specific query
 * queryClient.invalidateQueries(contentListKeys.items('dashboard', undefined, params));
 * ```
 */
export const contentListKeys = {
  /**
   * Base query key for all content list queries.
   * @param entityName - Optional entity name for scoping (e.g., "dashboard").
   * @param queryKeyScope - Optional scope for cache isolation between lists with same entityName.
   */
  all: (entityName?: string, queryKeyScope?: string) => {
    const base = ['content-list'] as const;
    if (entityName && queryKeyScope) {
      return [...base, entityName, queryKeyScope] as const;
    }
    if (entityName) {
      return [...base, entityName] as const;
    }
    return base;
  },
  /**
   * Query key for items queries with specific parameters.
   * @param entityName - Optional entity name for scoping.
   * @param queryKeyScope - Optional scope for cache isolation.
   * @param params - Query parameters (search, filters, sort, page).
   */
  items: (
    entityName: string | undefined,
    queryKeyScope: string | undefined,
    params: Omit<FindItemsParams, 'signal'>
  ) => [...contentListKeys.all(entityName, queryKeyScope), 'items', params] as const,
  /**
   * Query key for client-side processing mode.
   * Uses only searchQuery for stable caching; filters/sort/page applied client-side.
   * @param entityName - Optional entity name for scoping.
   * @param queryKeyScope - Optional scope for cache isolation.
   * @param searchQuery - The search query text.
   */
  clientSideItems: (
    entityName: string | undefined,
    queryKeyScope: string | undefined,
    searchQuery: string
  ) => [...contentListKeys.all(entityName, queryKeyScope), 'items', { searchQuery }] as const,
};

export interface UseContentListItemsQueryParams<T> {
  /** Data source configuration with `findItems` function. */
  dataSource: DataSourceConfig<T>;
  /** Entity name for query key namespacing (e.g., "dashboard", "visualization"). */
  entityName?: string;
  /**
   * Unique scope identifier for React Query cache keys.
   * Use when multiple lists share the same `entityName` but have different data sources.
   */
  queryKeyScope?: string;
  /** Search query text (serializable string). */
  searchQueryText: string;
  /** Active filters (for non-query filters like users). */
  filters: FindItemsParams['filters'];
  /** Sort configuration. */
  sort: FindItemsParams['sort'];
  /** Pagination configuration. */
  page: FindItemsParams['page'];
  /** Whether the query is enabled. */
  enabled?: boolean;
  /** Function to parse search query and extract tag filters (from tagging service). */
  parseSearchQuery?: (queryText: string) => ParsedQuery;
  /** Filtering configuration (used to determine custom filter fields to parse). */
  filteringConfig?: FilteringConfig;
  /**
   * Identity resolver for converting display values (usernames) to canonical values (UIDs).
   * Used for client-side user filtering when search query contains usernames.
   */
  identityResolver?: IdentityResolver;
  /** Whether to use client-side processing strategy. */
  isClientStrategy?: boolean;
}

export interface UseContentListItemsQueryResult {
  /** The fetched and transformed items. */
  items: ContentListItem[];
  /** Total number of items matching the query. */
  total: number;
  /** Maps raw filter inputs to their resolved canonical values. */
  resolvedFilters?: ResolvedFilters;
}

/**
 * Safely invokes the onFetchSuccess callback, catching and logging any errors.
 */
const invokeSuccessCallback = <T>(
  callback: ((result: FindItemsResult<T>) => void) | undefined,
  result: FindItemsResult<T>
): void => {
  if (!callback) return;
  try {
    callback(result);
  } catch (callbackError) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[ContentListProvider] onFetchSuccess callback threw an error:', callbackError);
    }
  }
};

/**
 * Gets the value of a field from a ContentListItem for sorting.
 * ContentListItem has properties directly (title, description, etc.),
 * not nested under `attributes` like UserContentCommonSchema.
 */
const getContentListItemFieldValue = (
  item: ContentListItem,
  field: string
): string | number | Date | null => {
  if (field === 'title') return item.title ?? '';
  if (field === 'description') return item.description ?? '';
  if (field === 'updatedAt') return item.updatedAt ?? null;
  if (field === 'createdAt') return item.createdAt ?? null;
  return (item as unknown as Record<string, unknown>)[field] as string | number | null;
};

/**
 * React Query hook for fetching content list items.
 *
 * This hook replaces the previous `useFetchItems` hook with a React Query-based
 * implementation that provides better caching, deduplication, and test support.
 *
 * @template T The raw item type from datasource.
 */
export const useContentListItemsQuery = <T>({
  dataSource,
  entityName,
  queryKeyScope,
  searchQueryText,
  filters,
  sort,
  page,
  enabled = true,
  parseSearchQuery,
  filteringConfig,
  identityResolver,
  isClientStrategy = false,
}: UseContentListItemsQueryParams<T>) => {
  const transform: TransformFunction<T> = dataSource.transform ?? defaultTransform;

  // Get all custom filter keys from config.
  const customFilterKeys = useMemo(
    () => getAllCustomFilterKeys(filteringConfig),
    [filteringConfig]
  );

  // Build dynamic schema once based on custom filter keys.
  // Use non-strict parsing to allow extra clauses (e.g., `tag:` added by search bar).
  const querySchema = useMemo(
    () => buildQuerySchema(customFilterKeys, { strict: false }),
    [customFilterKeys]
  );

  // Use the tagging service's `parseSearchQuery` to extract tags and clean search text.
  const parsedQuery = useMemo(() => {
    if (parseSearchQuery && searchQueryText) {
      return parseSearchQuery(searchQueryText);
    }
    return { searchQuery: searchQueryText, tagIds: undefined, tagIdsToExclude: undefined };
  }, [searchQueryText, parseSearchQuery]);

  // Extract `is:favorite`, `createdBy`, and custom fields from the query text by parsing it.
  const {
    favoritesOnly,
    users: parsedUsers,
    customFilters,
    cleanSearchQuery,
  } = useMemo(() => {
    return parseQueryFilters(parsedQuery.searchQuery, querySchema, customFilterKeys, {
      logErrors: true,
    });
  }, [parsedQuery.searchQuery, querySchema, customFilterKeys]);

  // Merge parsed filters with explicit filters (like users).
  const mergedFilters: Partial<ActiveFilters> = useMemo(() => {
    const hasTags =
      (parsedQuery.tagIds && parsedQuery.tagIds.length > 0) ||
      (parsedQuery.tagIdsToExclude && parsedQuery.tagIdsToExclude.length > 0);

    const merged: Partial<ActiveFilters> = {
      ...filters,
      tags: hasTags
        ? {
            include: parsedQuery.tagIds ?? [],
            exclude: parsedQuery.tagIdsToExclude ?? [],
          }
        : filters.tags,
      // Parsed users from query text override state filters.
      users: parsedUsers ?? filters.users,
      // Only override favorites when query explicitly includes `is:favorite`.
      favoritesOnly: favoritesOnly ? true : filters.favoritesOnly,
    };

    // Merge custom filter values (query text values override state filters).
    Object.entries(customFilters).forEach(([key, value]) => {
      merged[key] = value;
    });

    return merged;
  }, [
    filters,
    parsedQuery.tagIds,
    parsedQuery.tagIdsToExclude,
    parsedUsers,
    favoritesOnly,
    customFilters,
  ]);

  const queryParams: Omit<FindItemsParams, 'signal'> = {
    // Use the clean search query (without `createdBy:` and `is:favorite` syntax).
    searchQuery: cleanSearchQuery ?? '',
    filters: mergedFilters,
    sort,
    page,
  };

  // For client-side processing, use a completely stable query key.
  // This fetches ALL items once and applies search/filter/sort/pagination locally.
  // Matches TableListView behavior: no network requests for search/filter/sort/page changes.
  const queryKey = isClientStrategy
    ? contentListKeys.clientSideItems(entityName, queryKeyScope, '')
    : contentListKeys.items(entityName, queryKeyScope, queryParams);

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }): Promise<UseContentListItemsQueryResult> => {
      // For client-side processing, fetch ALL items without any search/filter/sort/page.
      // Everything is applied locally in processedData useMemo.
      const fetchParams: FindItemsParams = isClientStrategy
        ? {
            searchQuery: '', // No search query - filtering done client-side.
            filters: {}, // No filters - all filtering done client-side.
            sort: { field: 'updatedAt', direction: 'desc' }, // Default sort, ignored by strategy.
            page: { index: 0, size: 10000 }, // Fetch all items.
            signal,
          }
        : { ...queryParams, signal };

      const result = await dataSource.findItems(fetchParams);

      // Transform items and invoke success callback.
      const transformedItems = result.items.map(transform);
      invokeSuccessCallback(dataSource.onFetchSuccess, result);

      return {
        items: transformedItems,
        total: result.total,
        resolvedFilters: result.resolvedFilters,
      };
    },
    enabled,
    // Keep previous data during refetch to prevent UI flash.
    keepPreviousData: true,
    // Refetch when window regains focus is usually not desired for listing pages.
    refetchOnWindowFocus: false,
  });

  // For client-side processing, apply filtering/sorting/pagination in useMemo.
  // This runs on every render when filters/sort/page change.
  const processedData = useMemo((): UseContentListItemsQueryResult => {
    if (!isClientStrategy || !query.data) {
      return query.data ?? { items: [], total: 0 };
    }

    let items = [...query.data.items];

    // Apply search text filter (matches title and description).
    if (cleanSearchQuery && cleanSearchQuery.trim()) {
      const searchLower = cleanSearchQuery.toLowerCase().trim();
      items = items.filter((item) => {
        const titleMatch = item.title?.toLowerCase().includes(searchLower);
        const descMatch = item.description?.toLowerCase().includes(searchLower);
        return titleMatch || descMatch;
      });
    }

    // Apply tag include filter.
    if (mergedFilters.tags?.include && mergedFilters.tags.include.length > 0) {
      items = items.filter((item) => {
        const itemTagIds =
          item.references?.filter((ref) => ref.type === 'tag').map((ref) => ref.id) ?? [];
        // Item must have ALL included tags.
        return mergedFilters.tags!.include!.every((tagId) => itemTagIds.includes(tagId));
      });
    }

    // Apply tag exclude filter.
    if (mergedFilters.tags?.exclude && mergedFilters.tags.exclude.length > 0) {
      items = items.filter((item) => {
        const itemTagIds =
          item.references?.filter((ref) => ref.type === 'tag').map((ref) => ref.id) ?? [];
        // Item must have NONE of the excluded tags.
        return !mergedFilters.tags!.exclude!.some((tagId) => itemTagIds.includes(tagId));
      });
    }

    // Apply user filter.
    // mergedFilters.users may contain usernames (from search box) or UIDs.
    // Use the identity resolver to convert usernames to UIDs for comparison.
    if (mergedFilters.users && mergedFilters.users.length > 0) {
      // Convert filter values to canonical UIDs using the resolver.
      const canonicalUsers = identityResolver
        ? mergedFilters.users.map((u) => identityResolver.getCanonical(u))
        : mergedFilters.users;

      items = items.filter((item) => {
        if (!item.createdBy) return false;
        // Check if item's createdBy (UID) matches any of the canonical filter values.
        return canonicalUsers.includes(item.createdBy);
      });
    }

    // Apply favorites filter (requires favorites data from context - simplified for now).
    // Note: Full favorites filtering would require favorites data passed in.

    // Apply sorting.
    if (sort.field) {
      items = sortItems(items, sort.field, sort.direction, getContentListItemFieldValue);
    }

    // Update total to reflect filtered count.
    const total = items.length;

    // Apply pagination.
    const startIdx = page.index * page.size;
    const endIdx = startIdx + page.size;
    items = items.slice(startIdx, endIdx);

    return { items, total, resolvedFilters: query.data.resolvedFilters };
  }, [isClientStrategy, query.data, cleanSearchQuery, mergedFilters, sort, page, identityResolver]);

  // Return the query with processed data for client-side mode.
  return {
    ...query,
    data: processedData,
  };
};
