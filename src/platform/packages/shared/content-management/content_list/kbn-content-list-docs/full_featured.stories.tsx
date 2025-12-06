/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { EuiTitle, EuiText, EuiFlexGroup, EuiFlexItem, EuiPanel } from '@elastic/eui';
import { ContentListToolbar } from '@kbn/content-list-toolbar';
import { ContentListTable } from '@kbn/content-list-table';
import { ContentListProvider, type ContentListItem } from '@kbn/content-list-provider';
import { createSimpleMockFindItems, createMockServices } from '@kbn/content-list-mock-data';
import { StateIndicator } from './state_indicator';

const mockServices = createMockServices();

const meta: Meta = {
  title: 'Content Management/Content List/Examples/Full Featured',
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
 * ## Full Featured Demo
 *
 * This story demonstrates the complete ContentList integration with all features enabled:
 * - **Toolbar**: Search, sorting, tag filtering, user filtering, starred filter, and bulk actions
 * - **Table**: Selectable rows, clickable names, row actions (view details, edit, duplicate, delete)
 * - **State Panel**: Live view of the current state for debugging/understanding
 *
 * Row actions follow the EUI pattern where primary actions (View Details, Edit) remain visible,
 * and secondary actions (Duplicate, Delete) go into the overflow menu.
 *
 * Try these interactions:
 * 1. Search for "Revenue" or "Logs"
 * 2. Filter by tags, users, or toggle starred
 * 3. Change sort order
 * 4. Select rows and use bulk actions
 * 5. Click row actions - View Details and Edit are primary (always visible)
 */
export const FullFeatured: StoryObj = {
  render: () => {
    const { Column, Action } = ContentListTable;

    // Row-level action handlers
    const handleViewDetails = (item: ContentListItem) => action('view-details')(item.title);
    const handleEdit = (item: ContentListItem) => action('edit')(item.title);
    const handleDuplicate = (item: ContentListItem) => action('duplicate')(item.title);
    const handleDelete = (item: ContentListItem) => action('delete')(item.title);
    const handleClick = (item: ContentListItem) => action('navigate')(item.title);
    const getHref = (item: ContentListItem) => `#/dashboard/${item.id}`;

    // Bulk action handlers
    const onSelectionDelete = (items: ContentListItem[]) =>
      action('bulk-delete')(items.map((i) => i.title));
    const onSelectionExport = (items: ContentListItem[]) =>
      action('bulk-export')(items.map((i) => i.title));

    return (
      <ContentListProvider
        entityName="dashboard"
        entityNamePlural="dashboards"
        dataSource={{ findItems: createSimpleMockFindItems() }}
        services={mockServices}
        item={{
          getHref,
          actions: {
            onClick: handleClick,
            onViewDetails: handleViewDetails,
            onEdit: handleEdit,
            onDuplicate: handleDuplicate,
            onDelete: handleDelete,
          },
        }}
        features={{
          favorites: true,
          tags: true,
          userProfiles: true,
          search: { placeholder: 'Search dashboards...' },
          sorting: {
            initialSort: { field: 'updatedAt', direction: 'desc' },
          },
          filtering: true,
          selection: {
            onSelectionDelete,
            onSelectionExport,
          },
          pagination: { initialPageSize: 10 },
        }}
      >
        <EuiFlexGroup gutterSize="l" alignItems="flexStart">
          <EuiFlexItem>
            <EuiPanel>
              <EuiFlexGroup direction="column" gutterSize="m">
                <EuiFlexItem>
                  <EuiTitle size="s">
                    <h3>Dashboard Manager</h3>
                  </EuiTitle>
                  <EuiText size="s" color="subdued">
                    <p>
                      Full-featured content list with toolbar, table, and all interactions enabled.
                    </p>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <ContentListToolbar />
                </EuiFlexItem>
                <EuiFlexItem>
                  <ContentListTable title="Full featured dashboards table">
                    <Column.Name />
                    <Column.CreatedBy />
                    <Column.UpdatedAt />
                    <Column.Actions>
                      <Action.Edit />
                      <Action.ViewDetails />
                      <Action.Duplicate />
                      <Action.Delete />
                    </Column.Actions>
                  </ContentListTable>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPanel>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <StateIndicator />
          </EuiFlexItem>
        </EuiFlexGroup>
      </ContentListProvider>
    );
  },
};
