/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { useCallback, useRef } from 'react';
import { Query } from '@elastic/eui';
import type { TagFilters, ActiveFilters } from '../../datasource';
import { useContentListState } from '../../state/use_content_list_state';
import { CONTENT_LIST_ACTIONS } from '../../state/types';
import type { ContentListClientState } from '../../state/types';

const TAG_FIELD = 'tag';

/** Returns `undefined` when both arrays are empty, matching `DEFAULT_FILTERS`. */
const normalizeTagFilters = (include: string[], exclude: string[]): TagFilters | undefined =>
  include.length === 0 && exclude.length === 0 ? undefined : { include, exclude };

/**
 * Hook that returns a callback for toggling a tag in the content list filters.
 *
 * - Regular call: toggles the tag as an **include** filter.
 * - `withModifierKey: true`: toggles the tag as an **exclude** filter.
 *
 * When a tag is added to include, it is removed from exclude (and vice versa).
 *
 * This hook dispatches `SET_SEARCH` to atomically update both the query text
 * (for toolbar display) and the parsed filters (for data fetching). The query
 * text is rebuilt using EUI's `Query` API so the toolbar's `EuiSearchBar`
 * reflects the tag change.
 *
 * The returned callback is identity-stable (it reads the latest state via a
 * ref, so it never goes stale even under rapid successive calls).
 *
 * @example
 * ```tsx
 * const toggleTag = useTagFilterToggle();
 * <TagBadge tag={tag} onClick={(t, mod) => toggleTag(t.id!, t.name, mod)} />
 * ```
 */
export const useTagFilterToggle = () => {
  const { state, dispatch } = useContentListState();

  const stateRef = useRef<ContentListClientState>(state);
  stateRef.current = state;

  return useCallback(
    (tagId: string, tagName: string, withModifierKey: boolean) => {
      const { filters } = stateRef.current;
      const currentInclude = filters.tags?.include ?? [];
      const currentExclude = filters.tags?.exclude ?? [];

      let nextInclude: string[];
      let nextExclude: string[];

      if (withModifierKey) {
        const isExcluded = currentExclude.includes(tagId);
        nextInclude = currentInclude.filter((id) => id !== tagId);
        nextExclude = isExcluded
          ? currentExclude.filter((id) => id !== tagId)
          : [...currentExclude, tagId];
      } else {
        const isIncluded = currentInclude.includes(tagId);
        nextInclude = isIncluded
          ? currentInclude.filter((id) => id !== tagId)
          : [...currentInclude, tagId];
        nextExclude = currentExclude.filter((id) => id !== tagId);
      }

      const nextFilters: ActiveFilters = {
        ...filters,
        tags: normalizeTagFilters(nextInclude, nextExclude),
      };

      let nextQueryText = stateRef.current.search.queryText;
      try {
        let q = nextQueryText ? Query.parse(nextQueryText) : Query.parse('');

        q = q.removeOrFieldValue(TAG_FIELD, tagName);

        if (withModifierKey) {
          if (!currentExclude.includes(tagId)) {
            q = q.addOrFieldValue(TAG_FIELD, tagName, false, 'eq');
          }
        } else {
          if (!currentInclude.includes(tagId)) {
            q = q.addOrFieldValue(TAG_FIELD, tagName, true, 'eq');
          }
        }

        nextQueryText = q.text;
      } catch {
        // Preserve query text on parse failure; filters will still be correct.
      }

      dispatch({
        type: CONTENT_LIST_ACTIONS.SET_SEARCH,
        payload: { queryText: nextQueryText, filters: nextFilters },
      });
    },
    [dispatch]
  );
};
