/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { ReactNode } from 'react';
import type { ContentListItem } from '../../common';

/**
 * Preview configuration for item preview functionality.
 *
 * Works with `ContentListItem` (standardized format).
 *
 * @example
 * ```tsx
 * <ContentListProvider
 *   preview={{
 *     renderPreview: (item) => <DashboardPreview id={item.id} />,
 *     trigger: 'hover',
 *     size: 'medium',
 *   }}
 * />
 * ```
 */
export interface PreviewConfig {
  /** Function to render the preview content for an item. */
  renderPreview: (item: ContentListItem) => ReactNode;
  /**
   * What triggers the preview to appear.
   * @default 'hover'
   */
  trigger?: 'hover' | 'click';
  /**
   * Size of the preview panel.
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
}
