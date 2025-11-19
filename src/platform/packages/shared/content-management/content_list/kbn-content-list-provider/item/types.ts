/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { ContentListItem } from '../common';

/**
 * Handler function for an action.
 */
export type ActionHandler = (item: ContentListItem) => void;

/**
 * Full action configuration object with handler and optional `isEnabled`.
 */
export interface ActionConfigObject {
  /** Handler function when action is triggered. */
  handler: ActionHandler;
  /**
   * Optional function to determine if the action is enabled for a specific item.
   * When returns `false`, the action is rendered as disabled (grayed out, not clickable).
   * When omitted or returns `true`, the action is enabled.
   */
  isEnabled?: (item: ContentListItem) => boolean;
}

/**
 * Action configuration - either a handler function (shorthand) or a full config object.
 *
 * @example
 * ```tsx
 * // Shorthand - just the handler
 * onEdit: (item) => navigateToEdit(item.id)
 *
 * // Full config - handler with isEnabled
 * onEdit: {
 *   handler: (item) => navigateToEdit(item.id),
 *   isEnabled: (item) => !item.isManaged,
 * }
 * ```
 */
export type ActionConfig = ActionHandler | ActionConfigObject;

/**
 * Configuration for a custom action.
 */
export interface CustomActionConfig {
  /** Unique identifier for the action. */
  id: string;
  /** Icon type from EUI icon set. */
  iconType: string;
  /** Human-readable label for the action. */
  label: string;
  /** Optional tooltip text. */
  tooltip?: string;
  /** Handler function when action is triggered. */
  handler: (item: ContentListItem) => void;
  /**
   * Optional function to determine if the action is enabled for a specific item.
   * When returns `false`, the action is rendered as disabled (grayed out, not clickable).
   * When omitted or returns `true`, the action is enabled.
   */
  isEnabled?: (item: ContentListItem) => boolean;
  /** Optional color for the action button. */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'text' | 'accent';
  /** Optional `data-test-subj` for testing. */
  'data-test-subj'?: string;
}

/**
 * Per-item configuration for link behavior and actions.
 * Works with `ContentListItem` (standardized format).
 *
 * @example
 * ```tsx
 * <ContentListProvider
 *   item={{
 *     getHref: (item) => `/app/dashboard/${item.id}`,
 *     actions: {
 *       // Shorthand - just the handler
 *       onClick: (item) => navigateTo(item.id),
 *       onDelete: (item) => confirmDelete(item),
 *       // Full config - handler with isEnabled
 *       onEdit: {
 *         handler: (item) => openEditor(item.id),
 *         isEnabled: (item) => !item.isManaged,
 *       },
 *     },
 *   }}
 * />
 * ```
 */
export interface ItemConfig {
  /**
   * Function to generate the href for an item link.
   * When provided, item titles become clickable links.
   */
  getHref?: (item: ContentListItem) => string;

  /** Item actions - interactive behaviors for individual items. */
  actions?: {
    /** Primary click/tap behavior when the row or title is clicked. */
    onClick?: ActionConfig;
    /** Edit action handler (renders pencil icon). */
    onEdit?: ActionConfig;
    /** View details action handler (renders controls icon). */
    onViewDetails?: ActionConfig;
    /** Duplicate action handler. */
    onDuplicate?: ActionConfig;
    /** Export action handler. */
    onExport?: ActionConfig;
    /** Delete action handler (renders with danger color). */
    onDelete?: ActionConfig;
    /** Custom actions with full metadata. */
    custom?: CustomActionConfig[];
  };
}
