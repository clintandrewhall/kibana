/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { useCallback } from 'react';
import type { ActiveFilters } from '../../datasource';
import { useContentListState } from '../../state/use_content_list_state';
import { CONTENT_LIST_ACTIONS } from '../../state/types';
import type { UseContentListFiltersReturn } from './types';

/**
 * Hook to access and control filtering functionality.
 *
 * Reads the current `filters` from provider state and provides actions to
 * update or clear them. The toolbar is responsible for parsing the `EuiSearchBar`
 * query text (via `parseSearchQuery` when available) and dispatching the
 * parsed {@link ActiveFilters} through `setFilters`.
 *
 * @returns A {@link UseContentListFiltersReturn} object.
 *
 * @example
 * ```tsx
 * const { filters, setFilters, clearFilters } = useContentListFilters();
 *
 * // Read current filters.
 * const { tags, search } = filters;
 *
 * // Update filters (typically called from toolbar onChange).
 * setFilters({ search: 'query', tags: { include: ['tag-1'] } });
 *
 * // Clear all filters and search text.
 * clearFilters();
 * ```
 */
export const useContentListFilters = (): UseContentListFiltersReturn => {
  const { state, dispatch } = useContentListState();

  const setFilters = useCallback(
    (newFilters: ActiveFilters) => {
      dispatch({ type: CONTENT_LIST_ACTIONS.SET_FILTERS, payload: newFilters });
    },
    [dispatch]
  );

  const clearFilters = useCallback(() => {
    dispatch({ type: CONTENT_LIST_ACTIONS.CLEAR_FILTERS });
  }, [dispatch]);

  return {
    filters: state.filters,
    setFilters,
    clearFilters,
  };
};
