/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

/**
 * Recently accessed items tracking configuration.
 *
 * Integrates with Kibana's recently accessed feature to track and display
 * recently viewed items.
 *
 * @example
 * ```tsx
 * <ContentListProvider
 *   recentlyAccessed={{
 *     service: {
 *       add: (id, label, link) => chrome.recentlyAccessed.add(link, label, id),
 *       get: () => chrome.recentlyAccessed.get(),
 *     },
 *   }}
 * />
 * ```
 */
export interface RecentlyAccessedConfig {
  /** Service for managing recently accessed items. */
  service: {
    /**
     * Add an item to the recently accessed list.
     * @param id - Unique identifier for the item.
     * @param label - Display label for the item.
     * @param link - URL to navigate to the item.
     */
    add: (id: string, label: string, link: string) => void;
    /**
     * Get the list of recently accessed items.
     * @returns Array of recently accessed items with timestamps.
     */
    get: () => Array<{ id: string; label: string; link: string; timestamp: number }>;
  };
}
