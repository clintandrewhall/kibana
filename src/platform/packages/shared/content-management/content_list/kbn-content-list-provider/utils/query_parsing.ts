/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { Query } from '@elastic/eui';
import type { FilteringConfig } from '../features/filtering';

/** Schema type for `EuiSearchBar` query parsing. */
export interface QuerySchema {
  strict: boolean;
  fields: Record<string, { type: 'boolean' | 'string' | 'number' | 'date' }>;
}

/**
 * Validates and sanitizes a filter value to prevent injection attacks.
 * Only allows alphanumeric characters, hyphens, underscores, dots, and @ signs.
 * Returns `undefined` for invalid values.
 */
export const sanitizeFilterValue = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  // Allow alphanumeric, hyphens, underscores, dots, @ signs, and spaces.
  // This covers common identifiers, emails, and user-friendly names.
  const sanitized = value.trim();
  if (!/^[\w\-.\s@]+$/u.test(sanitized)) {
    return undefined;
  }
  return sanitized;
};

/**
 * Sanitizes an array of filter values, removing any invalid entries.
 */
export const sanitizeFilterValues = (values: unknown[]): string[] => {
  return values.map(sanitizeFilterValue).filter((v): v is string => v !== undefined);
};

/**
 * Gets all custom filter field keys from the filtering config.
 * All custom filters (both single-select and multi-select) are parsed from query text.
 */
export const getAllCustomFilterKeys = (filteringConfig: FilteringConfig | undefined): string[] => {
  if (!filteringConfig?.custom) {
    return [];
  }
  return Object.keys(filteringConfig.custom);
};

/**
 * Builds a dynamic schema for query parsing based on filtering config.
 * Includes base fields (`favorite`, `createdBy`) plus all custom filter fields.
 */
export const buildQuerySchema = (
  customFilterKeys: string[],
  options: { strict?: boolean } = {}
): QuerySchema => {
  const fields: Record<string, { type: 'boolean' | 'string' | 'number' | 'date' }> = {
    starred: { type: 'boolean' },
    createdBy: { type: 'string' },
  };

  // Add all custom filter fields to the schema.
  customFilterKeys.forEach((key) => {
    fields[key] = { type: 'string' };
  });

  return { strict: options.strict ?? true, fields };
};

/**
 * Result of parsing a query text for filters and search terms.
 */
export interface ParsedQueryFilters {
  favoritesOnly: boolean;
  users: string[] | undefined;
  customFilters: Record<string, string[]>;
  cleanSearchQuery: string | undefined;
}

/**
 * Parses query text to extract filters (favorites, users, custom filters) and clean search text.
 * This is a shared utility used by both `queries.ts` and `use_content_list_filters.ts`.
 *
 * @param queryText - The search query text to parse.
 * @param querySchema - The schema to use for parsing.
 * @param customFilterKeys - Custom filter field keys to extract.
 * @param options - Options for parsing behavior.
 * @returns Parsed filters and clean search query.
 */
export const parseQueryFilters = (
  queryText: string | undefined,
  querySchema: QuerySchema,
  customFilterKeys: string[],
  options: { logErrors?: boolean } = {}
): ParsedQueryFilters => {
  if (!queryText) {
    return {
      favoritesOnly: false,
      users: undefined,
      customFilters: {},
      cleanSearchQuery: undefined,
    };
  }

  try {
    const query = Query.parse(queryText, { schema: querySchema });

    const hasFavorite = query.hasIsClause('starred');

    // Parse `createdBy` field clauses with sanitization.
    let users: string[] | undefined;
    const createdByClauses = query.ast.getFieldClauses('createdBy');
    if (createdByClauses && createdByClauses.length > 0) {
      const rawValues: unknown[] = [];
      createdByClauses.forEach((clause) => {
        if (clause.match === 'must') {
          // Include clauses only (exclude clauses would have `match === 'must_not'`).
          const values = Array.isArray(clause.value) ? clause.value : [clause.value];
          rawValues.push(...values);
        }
      });
      const sanitized = sanitizeFilterValues(rawValues);
      users = sanitized.length > 0 ? sanitized : undefined;
    }

    // Parse custom filter fields (store all values as arrays) with sanitization.
    const parsedCustomFilters: Record<string, string[]> = {};
    customFilterKeys.forEach((key) => {
      const clauses = query.ast.getFieldClauses(key);
      if (clauses && clauses.length > 0) {
        const rawValues: unknown[] = [];
        clauses.forEach((clause) => {
          if (clause.match === 'must') {
            // Include clauses only.
            const values = Array.isArray(clause.value) ? clause.value : [clause.value];
            rawValues.push(...values);
          }
        });
        const sanitized = sanitizeFilterValues(rawValues);
        if (sanitized.length > 0) {
          parsedCustomFilters[key] = sanitized;
        }
      }
    });

    // Extract clean search query by getting only term clauses (exclude field clauses and is clauses).
    // This is more reliable than trying to remove clauses, as `removeOrFieldClauses` doesn't work for simple field clauses.
    const termClauses = query.ast.getTermClauses();
    const cleanSearchQuery =
      termClauses.length > 0
        ? termClauses
            .map((clause) => String(clause.value))
            .join(' ')
            .trim() || undefined
        : undefined;

    return {
      favoritesOnly: hasFavorite,
      users,
      customFilters: parsedCustomFilters,
      cleanSearchQuery,
    };
  } catch (error) {
    // Log parsing errors in development mode to help debug issues.
    if (options.logErrors && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[ContentListProvider] Query parsing error:', error, {
        queryText,
        customFilterKeys,
      });
    }
    return {
      favoritesOnly: false,
      users: undefined,
      customFilters: {},
      cleanSearchQuery: queryText,
    };
  }
};
