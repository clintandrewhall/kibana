/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { HttpFetchQuery, HttpStart } from '@kbn/core/public';
import type { UserContentCommonSchema } from '@kbn/content-management-table-list-view-common';
import type { FindItemsFn, FindItemsParams, FindItemsResult } from '../types';
import { sortItems } from '../../utils';

/**
 * Options for creating a find items strategy.
 */
export interface CreateFindItemsStrategyOptions {
  /** The Saved Object type to search for (e.g., 'map', 'dashboard'). */
  savedObjectType: string;
  /** HTTP client for making API requests. */
  http: HttpStart;
  /** Optional search fields to use. Defaults to ['title^3', 'description']. */
  searchFields?: string[];
  /** Optional maximum limit setting key. If provided, will respect this limit. */
  maxLimitSettingKey?: string;
  /** Optional function to get the max limit value. */
  getMaxLimit?: () => number;
}

/**
 * Result of creating a find items strategy.
 */
export interface CreateFindItemsStrategyResult {
  /** The find items function. */
  findItems: FindItemsFn<UserContentCommonSchema>;
}

/**
 * Saved Object response structure from the API.
 */
interface SavedObjectResponse {
  id: string;
  type: string;
  updated_at?: string;
  updated_by?: string;
  created_at?: string;
  created_by?: string;
  managed?: boolean;
  references?: Array<{ type: string; id: string; name: string }>;
  attributes: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
}

interface SavedObjectsFindResponse {
  saved_objects: SavedObjectResponse[];
  total: number;
  page: number;
  per_page: number;
}

/**
 * Gets the value of a field from a UserContentCommonSchema item for sorting.
 * Handles the nested `attributes` structure.
 */
const getUserContentFieldValue = (
  item: UserContentCommonSchema,
  field: string
): string | number | null => {
  if (field === 'title') return item.attributes?.title ?? '';
  if (field === 'description') return item.attributes?.description ?? '';
  if (field === 'updatedAt') return item.updatedAt ?? '';
  if (field === 'createdAt') return item.createdAt ?? '';
  return (item as unknown as Record<string, unknown>)[field] as string | number | null;
};

/**
 * Transforms a Saved Object from the API into a `UserContentCommonSchema` compatible object.
 */
const toUserContentSchema = (savedObject: SavedObjectResponse): UserContentCommonSchema => ({
  id: savedObject.id,
  type: savedObject.type,
  updatedAt: savedObject.updated_at ?? new Date().toISOString(),
  updatedBy: savedObject.updated_by,
  createdAt: savedObject.created_at,
  createdBy: savedObject.created_by,
  managed: savedObject.managed,
  references: savedObject.references ?? [],
  attributes: {
    title: savedObject.attributes.title ?? '',
    description: savedObject.attributes.description,
  },
});

/**
 * Creates a find items strategy using the Saved Objects `_find` API.
 *
 * This strategy uses the `/api/saved_objects/_find` HTTP endpoint with client-side
 * sorting, filtering, and pagination. It matches the original TableListView behavior:
 * overfetch all items up to a configured limit and process them in the browser.
 *
 * Features:
 * - Text search (server-side).
 * - Tag filtering (server-side via `has_reference`).
 * - User filtering (client-side).
 * - Sorting (client-side).
 * - Pagination (client-side).
 *
 * Best suited for smaller datasets (< 10,000 items).
 *
 * @param options - Configuration options for the strategy.
 * @returns An object containing the `findItems` function.
 *
 * @example
 * ```tsx
 * import { createFindItemsStrategy } from '@kbn/content-list-provider';
 *
 * const { findItems } = createFindItemsStrategy({
 *   savedObjectType: 'dashboard',
 *   http: coreStart.http,
 * });
 * ```
 */
export const createFindItemsStrategy = ({
  savedObjectType,
  http,
  searchFields = ['title^3', 'description'],
  maxLimitSettingKey,
  getMaxLimit,
}: CreateFindItemsStrategyOptions): CreateFindItemsStrategyResult => {
  const findItems: FindItemsFn<UserContentCommonSchema> = async ({
    searchQuery,
    filters,
    sort,
    page,
    signal,
  }: FindItemsParams): Promise<FindItemsResult<UserContentCommonSchema>> => {
    try {
      // Determine max limit from settings.
      let maxLimit = 10000; // Default high limit for client-side operations.
      if (maxLimitSettingKey && getMaxLimit) {
        maxLimit = getMaxLimit();
      }

      // This strategy always uses client-side sorting and pagination.
      // It matches the original TableListView behavior: overfetch all items and process in browser.

      // Map tag filters to hasReference/hasNoReference.
      const hasReference = filters.tags?.include?.map((tagId) => ({
        type: 'tag',
        id: tagId,
      }));
      const hasNoReference = filters.tags?.exclude?.map((tagId) => ({
        type: 'tag',
        id: tagId,
      }));

      // Fetch all items from page 1 up to maxLimit.
      const queryParams: HttpFetchQuery = {
        type: savedObjectType,
        search: searchQuery ? `${searchQuery}*` : undefined,
        search_fields: searchFields,
        default_search_operator: 'AND',
        page: 1,
        per_page: maxLimit,
      };

      // Add tag reference filters.
      if (hasReference && hasReference.length > 0) {
        queryParams.has_reference = JSON.stringify(hasReference);
      }
      if (hasNoReference && hasNoReference.length > 0) {
        queryParams.has_no_reference = JSON.stringify(hasNoReference);
      }

      // Note: No sort params sent to server - all sorting done client-side.

      const response = await http.get<SavedObjectsFindResponse>('/api/saved_objects/_find', {
        query: queryParams,
        signal,
      });

      let items = response.saved_objects.map(toUserContentSchema);

      // Apply client-side user filter if specified.
      // Note: The Saved Objects API doesn't support filtering by created_by directly.
      if (filters.users && filters.users.length > 0) {
        const userIds = filters.users;
        items = items.filter((item: UserContentCommonSchema) => {
          if (!item.createdBy) {
            return false;
          }
          return userIds.includes(item.createdBy);
        });
      }

      // Sort client-side.
      if (sort.field) {
        const sortDirection = sort.direction ?? 'asc';
        items = sortItems(items, sort.field, sortDirection, getUserContentFieldValue);
      }

      // Apply pagination after client-side sorting.
      const startIdx = page.index * page.size;
      const endIdx = startIdx + page.size;
      const paginatedItems = items.slice(startIdx, endIdx);

      return {
        items: paginatedItems,
        total: response.total,
      };
    } catch (e) {
      // Don't log abort errors - they're expected during navigation.
      if (e instanceof Error && e.name === 'AbortError') {
        return { items: [], total: 0 };
      }
      // eslint-disable-next-line no-console
      console.error('Error fetching saved objects:', e);
      return {
        items: [],
        total: 0,
      };
    }
  };

  return { findItems };
};
