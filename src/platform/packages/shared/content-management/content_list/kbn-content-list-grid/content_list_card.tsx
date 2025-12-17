/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useCallback, type FC } from 'react';
import { EuiCard, EuiIcon, EuiTextColor, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import { FavoriteButton } from '@kbn/content-management-favorites-public';
import { useContentListConfig, type ContentListItem } from '@kbn/content-list-provider';

import type { ContentListCardProps } from './types';

/**
 * Maximum length for description before truncation.
 */
const DESCRIPTION_MAX_LENGTH = 120;

/**
 * Truncates a description to a maximum length with ellipsis.
 *
 * @param description - The description to truncate.
 * @returns The truncated description.
 */
const truncateDescription = (description: string): string => {
  if (description.length <= DESCRIPTION_MAX_LENGTH) {
    return description;
  }
  return `${description.substring(0, DESCRIPTION_MAX_LENGTH)}...`;
};

/**
 * Renders the card icon.
 *
 * @param iconType - The EUI icon type to render.
 * @returns The icon element.
 */
const CardIcon: FC<{ iconType: string }> = ({ iconType }) => {
  return <EuiIcon type={iconType} size="xl" />;
};

/**
 * Renders the card description with truncation.
 *
 * @param item - The content item.
 * @returns The description element.
 */
const CardDescription: FC<{ item: ContentListItem }> = ({ item }) => {
  const description = item.description || '';
  const truncated = truncateDescription(description);

  return (
    <EuiTextColor color="subdued" title={description} className="eui-textBreakWord">
      {truncated}
    </EuiTextColor>
  );
};

/**
 * Renders the card footer with favorites button.
 *
 * @param item - The content item.
 * @param showFavorites - Whether to show the favorites button.
 * @returns The footer element or null.
 */
const CardFooter: FC<{ item: ContentListItem; showFavorites: boolean }> = ({
  item,
  showFavorites,
}) => {
  // Uses opt-out model: `canFavorite: false` hides the button, `undefined` or `true` shows it.
  if (!showFavorites || item.canFavorite === false) {
    return null;
  }

  return <FavoriteButton id={item.id} />;
};

/**
 * A card component for displaying a content item in a grid layout.
 *
 * Uses `EuiCard` with consistent sizing and truncated descriptions.
 * Supports favorites when the provider is configured with favorites support.
 *
 * @example
 * ```tsx
 * <ContentListCard
 *   item={dashboard}
 *   iconType="dashboardApp"
 *   showFavorites={true}
 * />
 * ```
 */
export const ContentListCard: FC<ContentListCardProps> = ({
  item,
  iconType = 'document',
  showFavorites = false,
  'data-test-subj': dataTestSubj,
}) => {
  const { euiTheme } = useEuiTheme();
  const { item: itemConfig } = useContentListConfig();

  // Resolve click handler from provider config.
  const handleClick = useCallback(() => {
    const { actions } = itemConfig ?? {};
    if (!actions?.onClick) return;

    // Handle both shorthand (function) and full config (object with handler).
    const handler = typeof actions.onClick === 'function' ? actions.onClick : actions.onClick.handler;
    handler(item);
  }, [item, itemConfig]);

  // Resolve href from provider config.
  const href = itemConfig?.getHref?.(item);

  // Card styling for consistent sizing.
  const cardStyles = css`
    width: calc(${euiTheme.size.l} * 10);
    min-height: calc(${euiTheme.size.base} * 12.5);

    .euiCard__content {
      overflow: hidden;
    }
  `;

  return (
    <EuiCard
      css={cardStyles}
      data-test-subj={dataTestSubj ?? `contentListCard-${item.id}`}
      icon={<CardIcon iconType={iconType} />}
      title={item.title}
      description={<CardDescription item={item} />}
      footer={<CardFooter item={item} showFavorites={showFavorites} />}
      href={href}
      onClick={href ? undefined : handleClick}
    />
  );
};

