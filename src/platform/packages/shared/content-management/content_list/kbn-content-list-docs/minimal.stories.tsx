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
import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiTitle } from '@elastic/eui';
import { ContentListToolbar } from '@kbn/content-list-toolbar';
import { ContentListTable } from '@kbn/content-list-table';
import { ContentListProvider, type ContentListItem } from '@kbn/content-list-provider';
import { createSimpleMockFindItems, createMockServices } from '@kbn/content-list-mock-data';

const mockServices = createMockServices();

const meta: Meta = {
  title: 'Content Management/Content List/Examples/Minimal',
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
 * ## Minimal Configuration
 *
 * Shows the content list with minimal features - search, tag filtering, and basic table.
 * Useful for simple listing pages that don't need advanced features.
 *
 * This configuration omits:
 * - Favorites
 * - Row selection
 * - Sorting filter
 *
 * Row actions: View Details and Edit are primary (always visible), Delete goes to overflow menu.
 */
export const Minimal: StoryObj = {
  render: () => {
    const onClick = (item: ContentListItem) => action('view')(item.title);
    const onViewDetails = (item: ContentListItem) => action('view-details')(item.title);
    const onEdit = (item: ContentListItem) => action('edit')(item.title);
    const onDelete = (item: ContentListItem) => action('delete')(item.title);
    const findItems = createSimpleMockFindItems();

    return (
      <ContentListProvider
        entityName="saved object"
        entityNamePlural="saved objects"
        dataSource={{ findItems }}
        services={mockServices}
        item={{ actions: { onClick, onViewDetails, onEdit, onDelete } }}
      >
        <EuiPanel>
          <EuiFlexGroup direction="column" gutterSize="m">
            <EuiFlexItem>
              <EuiTitle size="s">
                <h3>Saved Objects</h3>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem>
              <ContentListToolbar />
            </EuiFlexItem>
            <EuiFlexItem>
              <ContentListTable title="Minimal saved objects table" />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </ContentListProvider>
    );
  },
};
