/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

/**
 * Generic field value extractor function type.
 * Implementations should handle field name resolution for their specific item types.
 */
export type GetFieldValue<T> = (item: T, field: string) => string | number | Date | null;

/**
 * Sorts items by the specified field and direction.
 *
 * @param items - Array of items to sort.
 * @param field - Field name to sort by.
 * @param direction - Sort direction ('asc' or 'desc').
 * @param getFieldValue - Function to extract field values from items.
 * @returns New sorted array (does not mutate original).
 */
export const sortItems = <T>(
  items: T[],
  field: string,
  direction: 'asc' | 'desc',
  getFieldValue: GetFieldValue<T>
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = getFieldValue(a, field);
    const bValue = getFieldValue(b, field);

    if (aValue === bValue) return 0;
    if (aValue == null) return direction === 'desc' ? -1 : 1;
    if (bValue == null) return direction === 'desc' ? 1 : -1;

    // Use locale-aware string comparison for strings.
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue, undefined, {
        sensitivity: 'base',
        numeric: true,
      });
      return direction === 'desc' ? -comparison : comparison;
    }

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return direction === 'desc' ? -comparison : comparison;
  });
};

