/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { memo } from 'react';
import {
  UserAvatarTip,
  ManagedAvatarTip,
  NoCreatorTip,
} from '@kbn/content-management-user-profiles';
import type { ContentListItem } from '@kbn/content-list-provider';

/**
 * Props for the {@link CreatedByCell} component.
 */
export interface CreatedByCellProps {
  /** The content list item to render the creator for. */
  item: ContentListItem;
  /**
   * Entity name for display in the managed/no-creator tooltips.
   * Passed through to `ManagedAvatarTip` and `NoCreatorTip`.
   */
  entityName?: string;
  /**
   * Plural entity name for display in the no-creator tooltip.
   * Passed through to `NoCreatorTip`.
   */
  entityNamePlural?: string;
}

/**
 * Renders the appropriate avatar or tip for a content list item's creator.
 *
 * - **Managed items**: Shows the Elastic logo (`ManagedAvatarTip`).
 * - **Items with a `createdBy` uid**: Shows the user's avatar (`UserAvatarTip`).
 * - **Items without a creator**: Shows an info tip (`NoCreatorTip`).
 *
 * Requires `UserProfilesProvider` to be an ancestor in the component tree.
 * This is automatically provided by `ContentListProvider` when `services.userProfile`
 * is configured.
 */
export const CreatedByCell = memo(({ item, entityName, entityNamePlural }: CreatedByCellProps) => {
  const { createdBy, managed } = item;

  if (managed) {
    return <ManagedAvatarTip {...{ entityName }} />;
  }

  if (createdBy) {
    return <UserAvatarTip uid={createdBy} />;
  }

  return <NoCreatorTip {...{ entityNamePlural }} />;
});

CreatedByCell.displayName = 'CreatedByCell';
