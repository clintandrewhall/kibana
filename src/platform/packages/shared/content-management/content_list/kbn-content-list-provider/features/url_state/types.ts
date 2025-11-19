/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

/**
 * URL state synchronization configuration.
 *
 * When enabled, the content list state (search, filters, sort, pagination)
 * is synchronized with the browser URL, enabling deep linking and back/forward navigation.
 *
 * @example
 * ```tsx
 * <ContentListProvider
 *   urlState={{ enabled: true }}
 * />
 * ```
 */
export interface URLStateConfig {
  /** Whether URL state synchronization is enabled. */
  enabled: boolean;
}
