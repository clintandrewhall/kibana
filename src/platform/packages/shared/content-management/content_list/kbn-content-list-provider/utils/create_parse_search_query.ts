/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { Query } from '@elastic/eui';
import type { ParsedQuery } from '@kbn/content-management-tags';

/** Tag structure returned by `getTagList`. */
export interface TagItem {
  id?: string;
  name: string;
}

/** Function type for retrieving the list of available tags. */
export type GetTagList = () => TagItem[];

/**
 * Creates a `parseSearchQuery` function for extracting tag IDs from search queries.
 *
 * This mirrors the logic from `ContentManagementTagsKibanaProvider` but allows
 * direct use with a `getTagList` function rather than the full Kibana tagging API.
 *
 * @param getTagList - Function that returns the current list of available tags.
 * @returns A function that parses search queries and extracts tag information.
 *
 * @example
 * ```ts
 * const parseSearchQuery = createParseSearchQuery(tagsService.getTagList);
 * const { searchQuery, tagIds, tagIdsToExclude } = parseSearchQuery('tag:mytag dashboard');
 * ```
 */
/**
 * Resolves tag names to tag IDs using the provided tag list.
 *
 * @param tagNames - Array of tag names to resolve.
 * @param tagList - The list of available tags to match against.
 * @returns Array of resolved tag IDs.
 */
const resolveTagNamesToIds = (tagNames: string[], tagList: TagItem[]): string[] => {
  const tagIds: string[] = [];
  tagNames.forEach((tagName) => {
    // Validate tag name format before lookup to prevent potential injection.
    // Tag names should be non-empty strings.
    if (typeof tagName !== 'string' || tagName.trim().length === 0) {
      return;
    }
    const tag = tagList.find((t) => t.name === tagName);
    if (tag?.id) {
      tagIds.push(tag.id);
    }
  });
  return tagIds;
};

export const createParseSearchQuery = (getTagList: GetTagList) => {
  return (searchQuery: string): ParsedQuery => {
    try {
      const tagList = getTagList();
      // Use `strict: false` to allow other field clauses (`createdBy`, `is:favorite`, etc.)
      // while still extracting tag clauses.
      const query = Query.parse(searchQuery, {
        schema: { strict: false, fields: { tag: { type: 'string' } } },
      });

      const tagIds: string[] = [];
      const tagIdsToExclude: string[] = [];

      // Handle regular field clauses (e.g., `tag:value`).
      const tagClauses = query.ast.getFieldClauses('tag');
      if (tagClauses) {
        tagClauses.forEach((clause) => {
          const tagNames = Array.isArray(clause.value) ? clause.value : [clause.value];
          const resolvedIds = resolveTagNamesToIds(tagNames, tagList);

          if (clause.match === 'must') {
            tagIds.push(...resolvedIds);
          } else if (clause.match === 'must_not') {
            tagIdsToExclude.push(...resolvedIds);
          }
        });
      }

      // Handle OR-field clauses (e.g., `tag:(value)` or `tag:(value1 or value2)`).
      // EUI Query treats parenthesis syntax differently from simple field syntax.
      const includeOrClause = query.ast.getOrFieldClause('tag', undefined, true, 'eq');
      if (includeOrClause) {
        const tagNames = Array.isArray(includeOrClause.value)
          ? includeOrClause.value
          : [includeOrClause.value];
        const resolvedIds = resolveTagNamesToIds(tagNames as string[], tagList);
        tagIds.push(...resolvedIds);
      }

      const excludeOrClause = query.ast.getOrFieldClause('tag', undefined, false, 'eq');
      if (excludeOrClause) {
        const tagNames = Array.isArray(excludeOrClause.value)
          ? excludeOrClause.value
          : [excludeOrClause.value];
        const resolvedIds = resolveTagNamesToIds(tagNames as string[], tagList);
        tagIdsToExclude.push(...resolvedIds);
      }

      // Deduplicate tag IDs since the same tag may be matched by both
      // getFieldClauses and getOrFieldClause for certain query formats.
      const uniqueTagIds = [...new Set(tagIds)];
      const uniqueTagIdsToExclude = [...new Set(tagIdsToExclude)];

      const cleanQuery = query.removeOrFieldClauses('tag');
      const hasResolvedTags = uniqueTagIds.length > 0 || uniqueTagIdsToExclude.length > 0;

      if (!hasResolvedTags) {
        return { searchQuery, tagIds: undefined, tagIdsToExclude: undefined };
      }

      return {
        searchQuery: cleanQuery.text,
        tagIds: uniqueTagIds.length > 0 ? uniqueTagIds : undefined,
        tagIdsToExclude: uniqueTagIdsToExclude.length > 0 ? uniqueTagIdsToExclude : undefined,
      };
    } catch (error) {
      // Log parsing errors in development mode to help debug issues.
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('[ContentListProvider] Tag query parsing error:', error, {
          searchQuery,
        });
      }
      return { searchQuery, tagIds: undefined, tagIdsToExclude: undefined };
    }
  };
};
