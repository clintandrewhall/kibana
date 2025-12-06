/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { EuiTitle, EuiFlexGroup, EuiFlexItem, EuiBadge, EuiText, EuiPanel } from '@elastic/eui';
import type { UserContentCommonSchema } from '@kbn/content-management-table-list-view-common';
import { ContentListToolbar } from '@kbn/content-list-toolbar';
import { ContentListTable } from '@kbn/content-list-table';
import {
  ContentListProvider,
  DEFAULT_SORT_FIELDS,
  useQueryFilter,
  type ContentListItem,
} from '@kbn/content-list-provider';
import {
  STATUS_CONFIG,
  type ContentStatus,
  createSimpleMockFindItems,
  createMockServices,
} from '@kbn/content-list-mock-data';
import { TagList, type Tag } from '@kbn/content-management-tags';
import { FavoriteButton } from '@kbn/content-management-favorites-public';

const mockServices = createMockServices();

/**
 * Clickable status badge that toggles the status filter when clicked.
 * Demonstrates using useQueryFilter for custom filter fields.
 */
const StatusBadge = ({ status }: { status: ContentStatus }) => {
  const { toggle } = useQueryFilter('status');
  const config = STATUS_CONFIG[status];

  const handleClick = useCallback(() => {
    toggle(status);
  }, [toggle, status]);

  return (
    <EuiBadge
      color={config.color}
      onClick={handleClick}
      onClickAriaLabel={`Filter by ${config.label} status`}
    >
      {config.label}
    </EuiBadge>
  );
};

/**
 * Clickable tags cell that toggles the tag filter when a tag is clicked.
 * Demonstrates using useQueryFilter for the built-in tag filter.
 */
const TagsCell = ({ tagIds }: { tagIds?: string[] }) => {
  const { toggle } = useQueryFilter('tag');

  const handleTagClick = useCallback(
    (tag: Tag) => {
      if (tag.name) {
        toggle(tag.name);
      }
    },
    [toggle]
  );

  if (!tagIds || tagIds.length === 0) {
    return null;
  }

  return <TagList tagIds={tagIds} onClick={handleTagClick} />;
};

const meta: Meta = {
  title: 'Content Management/Content List/Examples/Customized',
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', maxWidth: '1400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

/**
 * ## Customized
 *
 * Demonstrates advanced customization of both toolbar and table:
 * - **Custom Filter**: A "Status" filter configured via `filtering.custom`
 * - **User Filter**: The "Created by" filter for filtering by item creator
 * - **Custom Toolbar Layout**: Declarative filter order using `<Filters>` compound component
 * - **Custom Sortable Column**: A "Status" column that's automatically sortable via `fields` config
 * - **Custom Actions**: A "Share" action added to the row actions menu
 * - **Primary Actions**: View Details and Edit are always visible; others go to overflow menu
 *
 * Custom filters are configured declaratively via `filtering.custom`:
 * 1. Define the filter in `filtering.custom: { fieldName: { name, options } }`
 * 2. Handle the custom filter key in your `findItems` function
 * 3. Use `<Filters.Filter field="fieldName" />` to include in the toolbar
 *
 * The toolbar uses EuiSearchBar with integrated filters appearing to the right
 * of the search box. Selection actions appear on the left.
 *
 * Status types: Active (green), In Review (yellow), Draft (gray), Archived (hollow)
 */
export const Customized: StoryObj = {
  render: () => {
    const { Column, Action } = ContentListTable;
    const { Filters, SelectionActions, Button } = ContentListToolbar;

    const onCreate = () => action('create')('New dashboard');
    const onViewDetails = (item: ContentListItem) => action('view-details')(item.title);
    const onEdit = (item: ContentListItem) => action('edit')(item.title);
    const onShare = (item: ContentListItem) => action('share')(item.title);
    const onDelete = (item: ContentListItem) => action('delete')(item.title);
    const onSelectionDelete = (items: ContentListItem[]) =>
      action('bulk-delete')(items.map((i) => i.title));

    const findItems = createSimpleMockFindItems();
    const transform = (item: UserContentCommonSchema & { status?: ContentStatus }) => ({
      id: item.id,
      title: item.attributes.title,
      description: item.attributes.description,
      type: item.type,
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
      updatedBy: item.updatedBy,
      createdBy: item.createdBy,
      tags: item.references?.filter((r) => r.type === 'tag').map((r) => r.id) ?? [],
      references: item.references,
      status: item.status, // Preserve status for the Status column
    });

    return (
      <ContentListProvider
        entityName="dashboard"
        entityNamePlural="dashboards"
        dataSource={{
          findItems,
          transform,
        }}
        services={mockServices}
        item={{
          actions: {
            onViewDetails,
            onEdit,
            onDelete,
          },
        }}
        features={{
          search: { placeholder: 'Filter dashboards...' },
          sorting: {
            // Using DEFAULT_SORT_FIELDS + custom "status" field with custom labels
            // The Status column will automatically be sortable!
            fields: [
              ...DEFAULT_SORT_FIELDS,
              {
                field: 'status',
                name: 'Status',
                ascLabel: 'Status: Draft → Active',
                descLabel: 'Status: Active → Draft',
              },
            ],
            initialSort: { field: 'status', direction: 'asc' },
          },
          filtering: {
            tags: true,
            users: true,
            custom: {
              status: {
                name: 'Status',
                multiSelect: true,
                options: Object.entries(STATUS_CONFIG).map(([value, config]) => ({
                  value,
                  label: config.label,
                })),
              },
            },
          },
          selection: { onSelectionDelete },
          pagination: { initialPageSize: 10 },
        }}
      >
        <EuiPanel>
          <EuiFlexGroup direction="column" gutterSize="m">
            <EuiFlexItem>
              <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiTitle size="s">
                    <h3>My Dashboards</h3>
                  </EuiTitle>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <Button iconType="plus" onClick={onCreate}>
                    Create dashboard
                  </Button>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem>
              {/* Custom toolbar layout with EuiSearchBar integration */}
              {/* Filters appear to the right of the search box, SelectionActions appear on the left */}
              <ContentListToolbar>
                <SelectionActions>
                  <SelectionActions.Action.Delete />
                </SelectionActions>
                <Filters>
                  <Filters.Tags />
                  <Filters.CreatedBy />
                  <Filters.Filter field="status" />
                  <Filters.Sort />
                  <Filters.Starred />
                </Filters>
              </ContentListToolbar>
            </EuiFlexItem>
            <EuiFlexItem>
              <ContentListTable
                title="Customized dashboards table"
                renderDetails={(item) => {
                  const hasDescription = !!item.description;
                  const hasTags = item.tags && item.tags.length > 0;

                  if (!hasDescription && !hasTags) {
                    return null;
                  }

                  return (
                    <EuiFlexGroup direction="column" gutterSize="s">
                      {hasDescription && (
                        <EuiFlexItem grow={false}>
                          <EuiText size="s" color="subdued">
                            {item.description}
                          </EuiText>
                        </EuiFlexItem>
                      )}
                      {hasTags && (
                        <EuiFlexItem grow={false}>
                          <TagsCell tagIds={item.tags} />
                        </EuiFlexItem>
                      )}
                    </EuiFlexGroup>
                  );
                }}
              >
                <Column.Expander />
                <Column<{ status?: ContentStatus }>
                  id="status"
                  name="Status"
                  width="100px"
                  render={(item) => {
                    // item.status is typed as ContentStatus | undefined
                    // StatusBadge is clickable - clicking toggles the status filter
                    const status = item.status ?? 'draft';
                    return <StatusBadge status={status} />;
                  }}
                />
                <Column<{ favorite?: boolean }>
                  id="favorite"
                  name=""
                  width="25px"
                  render={(item) => {
                    return <FavoriteButton id={item.id} />;
                  }}
                />
                <Column.Name showTags={false} showDescription={false} width="30%" />
                <Column.CreatedBy />
                <Column.UpdatedAt />
                <Column.Actions>
                  <Action.Edit />
                  <Action.ViewDetails />
                  <Action
                    id="share"
                    label="Share"
                    iconType="share"
                    handler={onShare}
                    tooltip="Share this dashboard"
                  />
                  <Action.Delete />
                </Column.Actions>
              </ContentListTable>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </ContentListProvider>
    );
  },
};
