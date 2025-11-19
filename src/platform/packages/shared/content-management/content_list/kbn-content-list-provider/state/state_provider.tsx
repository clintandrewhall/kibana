/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { createContext, useCallback, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { useMemo, useReducer } from 'react';
import useDebounce from 'react-use/lib/useDebounce';
import { useTagServices } from '@kbn/content-management-tags';
import { useUserProfiles } from '@kbn/content-management-user-profiles';
import type { ContentListState, ContentListStateContextValue } from './types';
import { DEFAULT_FILTERS } from './types';
import { useContentListConfig } from '../provider';
import { reducer } from './state_reducer';
import { useContentListItemsQuery } from '../queries';
import { useIdentityResolver } from '../features/search';

/**
 * Default debounce delay in milliseconds for search queries.
 * This prevents excessive server requests while the user is typing.
 */
const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Props for `ContentListStateProvider`.
 */
export interface ContentListStateProviderProps {
  /** Child components that will have access to the state context. */
  children: ReactNode;
}

/**
 * Context for the content list runtime state.
 * Use `useContentListState` to access this context.
 */
export const ContentListStateContext = createContext<ContentListStateContextValue | null>(null);

// TODO: clintandrewhall - this needs to come from Kibana UI Settings.
const DEFAULT_PAGE_SIZE = 20;

/**
 * Internal provider component that manages the runtime state of the content list.
 *
 * This provider:
 * - Initializes state from the configuration context.
 * - Uses React Query for data fetching with caching and deduplication.
 * - Provides dispatch function for state updates.
 *
 * This is automatically included when using `ContentListProvider` and
 * should not be used directly.
 *
 * @internal
 */
export const ContentListStateProvider = ({ children }: ContentListStateProviderProps) => {
  const { features, isReadOnly, dataSource, entityName, queryKeyScope, strategy } =
    useContentListConfig();
  const { pagination, sorting, search, filtering } = features;

  // Initial state with sensible defaults.
  const initialState: ContentListState = useMemo(() => {
    // Determine initial page size from pagination config (default: 20).
    // TODO: clintandrewhall - this needs to come from Kibana UI Settings.
    const size =
      typeof pagination === 'object' && pagination.initialPageSize
        ? pagination.initialPageSize
        : DEFAULT_PAGE_SIZE;

    // Determine initial sort from sorting config (default: title ascending).
    // Note: Items are transformed to `ContentListItem` format, so field is `'title'` not `'attributes.title'`.
    const sort =
      typeof sorting === 'object' && sorting.initialSort
        ? sorting.initialSort
        : { field: 'title', direction: 'asc' as const };

    // Determine initial query text from search config (default: empty).
    const initialQueryText =
      typeof search === 'object' && search.initialQuery ? search.initialQuery : '';

    return {
      items: [],
      totalItems: 0,
      isLoading: true, // Start as loading since query will fetch on mount.
      search: {
        queryText: initialQueryText, // Search query text (serializable).
      },
      filters: { ...DEFAULT_FILTERS },
      sort,
      page: {
        index: 0,
        size,
      },
      selectedItems: new Set(),
      isReadOnly: isReadOnly ?? false,
    };
  }, [pagination, sorting, search, isReadOnly]);

  const [localState, dispatch] = useReducer(reducer, initialState);

  // Extract debounce delay from search config.
  // Skip debounce for client-side processing since filtering is done in memory (no server calls).
  const isClientStrategy = strategy === 'client';
  const configuredDebounceMs =
    typeof search === 'object' && typeof search.debounceMs === 'number'
      ? search.debounceMs
      : DEFAULT_DEBOUNCE_MS;
  const debounceMs = isClientStrategy ? 0 : configuredDebounceMs;

  // Get filtering config for query parsing.
  const filteringConfig = typeof filtering === 'object' ? filtering : undefined;

  // Track the debounced search query text.
  // This value is updated after the debounce delay to prevent excessive server requests.
  // For client-side processing, debounce is 0 so updates are immediate.
  const [debouncedQueryText, setDebouncedQueryText] = useState(initialState.search.queryText);

  // Track the time of the last query text change to detect typing vs clicking.
  // Rapid successive changes (within debounceMs) indicate typing → debounce.
  // Isolated changes (after a pause) indicate a filter click → apply immediately.
  const lastChangeTimeRef = useRef(Date.now());
  const isInitialMount = useRef(true);

  // Debounce all query text changes.
  // This ensures typing (whether free-text or filter syntax) is debounced.
  useDebounce(
    () => {
      if (debounceMs > 0 && localState.search.queryText !== debouncedQueryText) {
        setDebouncedQueryText(localState.search.queryText);
      }
    },
    debounceMs,
    [localState.search.queryText, debouncedQueryText, debounceMs]
  );

  // Handle immediate updates for:
  // 1. When debouncing is disabled (debounceMs === 0).
  // 2. When a change comes after a pause (likely a filter click, not typing).
  useEffect(() => {
    // Skip on initial mount to avoid double-firing with initial state.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const queryTextChanged = localState.search.queryText !== debouncedQueryText;
    if (!queryTextChanged) {
      return;
    }

    const now = Date.now();
    const timeSinceLastChange = now - lastChangeTimeRef.current;
    lastChangeTimeRef.current = now;

    // Update immediately if:
    // 1. Debouncing is disabled (client strategy or debounceMs: 0), OR
    // 2. Enough time has passed since the last change (likely a click, not typing).
    //    This handles filter button clicks that come after a period of no typing.
    if (debounceMs === 0 || timeSinceLastChange > debounceMs) {
      setDebouncedQueryText(localState.search.queryText);
    }
  }, [localState.search.queryText, debouncedQueryText, debounceMs]);

  // Get `parseSearchQuery` from the tagging service (handles tag name → ID conversion).
  // Uses optional hook since tags may not be enabled.
  const tagServices = useTagServices();
  const parseSearchQuery = tagServices?.parseSearchQuery;

  // Create identity resolver for createdBy filter deduplication.
  const createdByResolver = useIdentityResolver();

  // Use React Query for data fetching.
  // Uses the debounced query text to prevent excessive requests while typing.
  const {
    data,
    isLoading: queryIsLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useContentListItemsQuery({
    dataSource,
    entityName,
    queryKeyScope,
    searchQueryText: debouncedQueryText,
    filters: localState.filters,
    sort: localState.sort,
    page: localState.page,
    parseSearchQuery,
    filteringConfig,
    // Pass resolver for client-side user filtering (converts usernames to UIDs).
    identityResolver: createdByResolver,
    isClientStrategy,
  });

  // Check if items already have createdByUser/updatedByUser populated (server provider does this).
  // Only fetch user profiles if items don't have this info (client provider case).
  const { userIdsToFetch, hasUserInfo } = useMemo(() => {
    if (!data?.items || data.items.length === 0) {
      return { userIdsToFetch: [], hasUserInfo: false };
    }

    // Check if any item has createdByUser or updatedByUser - if so, profiles are already available.
    const itemWithUserInfo = data.items.find(
      (item) => item.createdByUser !== undefined || item.updatedByUser !== undefined
    );

    if (itemWithUserInfo) {
      return { userIdsToFetch: [], hasUserInfo: true };
    }

    // No user info available - collect unique UIDs from both createdBy and updatedBy.
    const ids = new Set<string>();
    for (const item of data.items) {
      if (item.createdBy) {
        ids.add(item.createdBy as string);
      }
      if (item.updatedBy) {
        ids.add(item.updatedBy as string);
      }
    }
    return { userIdsToFetch: Array.from(ids), hasUserInfo: false };
  }, [data?.items]);

  // Fetch user profiles only when items don't have user info (client provider case).
  const userProfilesQuery = useUserProfiles(userIdsToFetch, {
    enabled: userIdsToFetch.length > 0,
  });

  // Populate identity resolver when data arrives (from items with createdByUser/updatedByUser).
  useEffect(() => {
    if (!data || !hasUserInfo) {
      return;
    }

    // Register mappings from resolvedFilters (input -> UID).
    if (data.resolvedFilters?.createdBy) {
      createdByResolver.registerAll(data.resolvedFilters.createdBy);
    }

    // Register mappings from items (username/email -> UID).
    // Both createdByUser and updatedByUser share user info, so register both.
    for (const item of data.items) {
      const createdBy = item.createdBy as string | undefined;
      const createdByUser = item.createdByUser as { username: string; email?: string } | undefined;
      const updatedBy = item.updatedBy as string | undefined;
      const updatedByUser = item.updatedByUser as { username: string; email?: string } | undefined;

      // Register createdBy user info.
      if (createdBy && createdByUser) {
        createdByResolver.register(createdByUser.username, createdBy);
        if (createdByUser.email) {
          createdByResolver.register(createdByUser.email, createdBy);
        }
      }

      // Register updatedBy user info.
      if (updatedBy && updatedByUser) {
        createdByResolver.register(updatedByUser.username, updatedBy);
        if (updatedByUser.email) {
          createdByResolver.register(updatedByUser.email, updatedBy);
        }
      }
    }
  }, [data, hasUserInfo, createdByResolver]);

  // Populate resolver from fetched user profiles (client provider case).
  useEffect(() => {
    if (!userProfilesQuery.data || hasUserInfo) {
      return;
    }

    // Register all fetched profiles - they apply to both createdBy and updatedBy.
    for (const profile of userProfilesQuery.data) {
      const uid = profile.uid;
      const username = profile.user?.username;
      const email = profile.user?.email;

      if (uid && username) {
        createdByResolver.register(username, uid);
      }
      if (uid && email) {
        createdByResolver.register(email, uid);
      }
    }
  }, [userProfilesQuery.data, hasUserInfo, createdByResolver]);

  // Combine local state with query results.
  const state: ContentListState = useMemo(
    () => ({
      ...localState,
      // Data from query.
      items: data?.items ?? [],
      totalItems: data?.total ?? 0,
      // Loading state: true during initial load or when fetching.
      isLoading: queryIsLoading || isFetching,
      // Error from query.
      error: queryError instanceof Error ? queryError : undefined,
    }),
    [localState, data, queryIsLoading, isFetching, queryError]
  );

  // Wrap refetch to match the expected signature.
  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <ContentListStateContext.Provider
      value={{ state, dispatch, refetch: handleRefetch, createdByResolver }}
    >
      {children}
    </ContentListStateContext.Provider>
  );
};
