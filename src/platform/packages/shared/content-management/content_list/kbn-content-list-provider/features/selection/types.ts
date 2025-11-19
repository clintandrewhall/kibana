/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { ContentListItem } from '../../common';

/**
 * Selection actions configuration - enables bulk operations on selected items.
 *
 * Enforces that at least one handler must be defined to prevent enabling
 * selection UI without any actions.
 *
 * Works with `ContentListItem[]` (standardized format).
 *
 * @example
 * ```tsx
 * <ContentListProvider
 *   selection={{
 *     onSelectionDelete: (items) => handleBulkDelete(items),
 *     onSelectionExport: (items) => handleBulkExport(items),
 *   }}
 * />
 * ```
 */
export type SelectionActions = {
  /** Handler for bulk delete action on selected items. */
  onSelectionDelete?: (items: ContentListItem[]) => void;
  /** Handler for bulk export action on selected items. */
  onSelectionExport?: (items: ContentListItem[]) => void;
  /** Custom bulk action handlers (key is the action name). */
  [key: string]: ((items: ContentListItem[]) => void) | undefined;
} & (
  | { onSelectionDelete: (items: ContentListItem[]) => void } // Must have onSelectionDelete, OR
  | { onSelectionExport: (items: ContentListItem[]) => void } // Must have onSelectionExport, OR
  | { [key: string]: (items: ContentListItem[]) => void }
); // Must have at least one custom action
