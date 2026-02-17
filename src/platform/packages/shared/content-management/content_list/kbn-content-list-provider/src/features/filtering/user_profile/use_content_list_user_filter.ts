/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { useCallback, useMemo } from 'react';
import { useContentListConfig } from '../../../context';
import { useContentListState } from '../../../state';
import { CONTENT_LIST_ACTIONS } from '../../../state/types';
import type { UseContentListUserFilterReturn } from './types';

/**
 * Hook for managing user filter state in the content list.
 *
 * Dispatches `SET_FILTERS` with updated `users` while preserving
 * the rest of the existing filter state (search, tags, etc.).
 *
 * @returns {@link UseContentListUserFilterReturn} with selected users
 *   and helpers for updating them.
 */
export const useContentListUserFilter = (): UseContentListUserFilterReturn => {
  const { supports } = useContentListConfig();
  const { state, dispatch } = useContentListState();

  const selectedUsers = useMemo(
    () => state.filters?.users ?? [],
    [state.filters?.users]
  );

  const hasActiveFilter = selectedUsers.length > 0;

  const setSelectedUsers = useCallback(
    (users: string[]) => {
      dispatch({
        type: CONTENT_LIST_ACTIONS.SET_FILTERS,
        payload: {
          ...state.filters,
          users: users.length > 0 ? users : undefined,
        },
      });
    },
    [dispatch, state.filters]
  );

  return {
    selectedUsers,
    isSupported: supports.createdBy,
    setSelectedUsers,
    hasActiveFilter,
  };
};
