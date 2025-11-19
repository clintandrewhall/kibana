/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { SavedObjectsReference } from '@kbn/content-management-content-editor';

/**
 * Standardized item structure for rendering components (tables, grids, etc.).
 * This is the common interface that all rendering components work with,
 * regardless of the underlying datasource type.
 *
 * @template T Additional properties to include on the item type.
 */
export type ContentListItem<T = Record<string, unknown>> = T & {
  /** Unique identifier for the item. */
  id: string;
  /** Display title for the item. */
  title: string;
  /** Optional description text. */
  description?: string;
  /** Item type identifier (e.g., "dashboard", "visualization"). */
  type?: string;
  /** Last update timestamp. */
  updatedAt?: Date;
  /** Creation timestamp. */
  createdAt?: Date;
  /** User ID who last updated the item. */
  updatedBy?: string;
  /** User ID who created the item. */
  createdBy?: string;
  /** Array of tag IDs associated with this item. */
  tags?: string[];
  /** Saved object references (for advanced use cases). */
  references?: SavedObjectsReference[];
  /**
   * Whether this item can be favorited. Uses an **opt-out** model:
   * - `undefined` (default): Show favorites button if provider supports it.
   * - `true`: Explicitly enable favorites for this item.
   * - `false`: Explicitly disable favorites for this item (e.g., managed items).
   *
   * The favorites button only renders when `supports.favorites` is `true` on the provider
   * AND `canFavorite` is not `false`.
   */
  canFavorite?: boolean;
  /** Whether this item is managed (e.g., by an external system). */
  isManaged?: boolean;
};

/**
 * Transform function type that converts datasource items to `ContentListItem`.
 *
 * Used to convert raw items from your data source into the standardized
 * `ContentListItem` format that rendering components expect.
 *
 * @template T The raw item type from the datasource.
 *
 * @example
 * ```ts
 * // Custom transform for a non-standard data source
 * const myTransform: TransformFunction<MyItem> = (item) => ({
 *   id: item.uuid,
 *   title: item.name,
 *   description: item.summary,
 *   updatedAt: new Date(item.modified),
 *   createdBy: item.author,
 * });
 *
 * <ContentListProvider
 *   dataSource={{
 *     findItems: fetchMyItems,
 *     transform: myTransform,
 *   }}
 * />
 * ```
 */
export type TransformFunction<T> = (item: T) => ContentListItem;
