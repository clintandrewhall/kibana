/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useCallback, useMemo } from 'react';
import type { MouseEvent } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiHealth,
  useEuiTheme,
  type Query,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { useContentListItems, useFilterDisplay } from '@kbn/content-list-provider';
import { useTagServices, type Tag } from '@kbn/content-management-tags';
import {
  SelectableFilterPopover,
  StandardFilterOption,
  type SelectableFilterOption,
} from '../selectable_filter_popover';

/**
 * Props for the {@link TagFilterRenderer} component.
 *
 * When used with `EuiSearchBar` `custom_component` filters, the search bar passes
 * `query` and `onChange` props. The tag filter uses these to sync include/exclude
 * state directly with the search bar query text.
 */
export interface TagFilterRendererProps {
  /** Query object from `EuiSearchBar`. */
  query?: Query;
  /** `onChange` callback from `EuiSearchBar`. */
  onChange?: (query: Query) => void;
  /** Optional `data-test-subj` attribute for testing. */
  'data-test-subj'?: string;
}

const shortTagLength = 20;
const mediumTagLength = 35;

const i18nText = {
  title: i18n.translate('contentManagement.contentList.tagsRenderer.tagsLabel', {
    defaultMessage: 'Tags',
  }),
  emptyMessage: i18n.translate('contentManagement.contentList.tagsRenderer.emptyMessage', {
    defaultMessage: "There aren't any tags",
  }),
  noMatchesMessage: i18n.translate('contentManagement.contentList.tagsRenderer.noMatchesMessage', {
    defaultMessage: 'No tag matches the search',
  }),
};

/**
 * `TagFilterRenderer` component for `EuiSearchBar` `custom_component` filter.
 *
 * This is a thin wrapper around {@link SelectableFilterPopover} that provides
 * tag-specific data: options with colors, per-tag item counts, and dynamic
 * panel sizing.
 *
 * Features:
 * - Multi-select with include/exclude support (Cmd+click to exclude).
 * - Tag counts per option.
 * - Search within the popover.
 * - Colored tag badges.
 *
 * Requires `ContentManagementTagsProvider` in the component tree (automatically
 * provided when `services.tags` is configured on the `ContentListProvider`).
 */
export const TagFilterRenderer = ({
  query,
  onChange,
  'data-test-subj': dataTestSubj = 'contentListTagsRenderer',
}: TagFilterRendererProps) => {
  const { euiTheme } = useEuiTheme();
  const { hasTags } = useFilterDisplay();
  const tagServices = useTagServices();
  const { items } = useContentListItems();

  const availableTags = useMemo(() => {
    if (!tagServices?.getTagList) {
      return [];
    }
    try {
      return tagServices.getTagList();
    } catch {
      return [];
    }
  }, [tagServices]);

  const tagLookupMap = useMemo(() => {
    const map = new Map<string, Tag>();
    availableTags.forEach((tag) => {
      if (tag.id) {
        map.set(tag.id, tag);
      }
      map.set(tag.name, tag);
    });
    return map;
  }, [availableTags]);

  // Count items per tag.
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      item.tags?.forEach((tagId) => {
        const tagName = tagLookupMap.get(tagId)?.name ?? tagId;
        counts[tagName] = (counts[tagName] || 0) + 1;
      });
    });
    return counts;
  }, [items, tagLookupMap]);

  // Build options for `SelectableFilterPopover`.
  const options = useMemo((): Array<SelectableFilterOption<Tag>> => {
    return availableTags.map((tag) => ({
      key: tag.id ?? tag.name,
      label: tag.name,
      value: tag.name, // Tags use name as the query value.
      count: tagCounts[tag.name] ?? 0,
      data: tag,
    }));
  }, [availableTags, tagCounts]);

  // Calculate panel width based on longest tag name.
  const panelWidth = useMemo(() => {
    const maxLen = Math.max(0, ...availableTags.map((t) => t.name.length));
    const multiplier = maxLen <= shortTagLength ? 18 : maxLen <= mediumTagLength ? 25 : 32;
    return multiplier * euiTheme.base;
  }, [availableTags, euiTheme.base]);

  const renderOption = useCallback(
    (
      option: SelectableFilterOption<Tag>,
      state: { isActive: boolean; onClick: (e: MouseEvent) => void }
    ) => (
      <StandardFilterOption
        count={option.count ?? 0}
        isActive={state.isActive}
        onClick={state.onClick}
      >
        <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiHealth
              color={option.data?.color}
              data-test-subj={`tag-searchbar-option-${option.key}`}
            >
              <EuiText size="s">{option.label}</EuiText>
            </EuiHealth>
          </EuiFlexItem>
        </EuiFlexGroup>
      </StandardFilterOption>
    ),
    []
  );

  if (!hasTags || availableTags.length === 0) {
    return null;
  }

  return (
    <SelectableFilterPopover<Tag>
      fieldName="tag"
      title={i18nText.title}
      query={query}
      onChange={onChange}
      options={options}
      renderOption={renderOption}
      emptyMessage={i18nText.emptyMessage}
      noMatchesMessage={i18nText.noMatchesMessage}
      panelWidth={panelWidth}
      data-test-subj={dataTestSubj}
    />
  );
};
