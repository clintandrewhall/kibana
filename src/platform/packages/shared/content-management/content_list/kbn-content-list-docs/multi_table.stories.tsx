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
import {
  EuiSpacer,
  EuiTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiIcon,
} from '@elastic/eui';
import { ContentListToolbar } from '@kbn/content-list-toolbar';
import { ContentListTable } from '@kbn/content-list-table';
import {
  ContentListProvider,
  type ContentListItem,
  type TransformFunction,
} from '@kbn/content-list-provider';
import type { UserContentCommonSchema } from '@kbn/content-management-table-list-view-common';
import {
  MOCK_DASHBOARDS,
  MOCK_MAPS,
  MOCK_VISUALIZATIONS,
  addStatusToItems,
  statusSortFn,
  createMockServices,
  mockFavoritesClient,
} from '@kbn/content-list-mock-data';

const mockServices = createMockServices();

/**
 * Combined mock items from all content types
 */
const ALL_CONTENT_ITEMS = [
  ...addStatusToItems(MOCK_DASHBOARDS),
  ...addStatusToItems(MOCK_MAPS),
  ...addStatusToItems(MOCK_VISUALIZATIONS),
];

/**
 * Create a combined findItems function that returns all content types.
 * Supports search, tag filtering, and sorting across all content.
 */
const createCombinedFindItems = () => {
  return async ({
    searchQuery,
    filters,
    sort,
    page,
  }: {
    searchQuery?: string;
    filters: {
      tags?: { include?: string[]; exclude?: string[] };
      favoritesOnly?: boolean;
    };
    sort: { field: string; direction: 'asc' | 'desc' };
    page: { index: number; size: number };
  }) => {
    let items = [...ALL_CONTENT_ITEMS];

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.attributes.title?.toLowerCase().includes(query) ||
          (item.attributes as { description?: string }).description?.toLowerCase().includes(query)
      );
    }

    // Apply tag include filters
    const includeTags = filters.tags?.include;
    if (includeTags && includeTags.length > 0) {
      items = items.filter((item) =>
        includeTags.some((tag) => item.references?.some((ref) => ref.id === tag))
      );
    }

    // Apply tag exclude filters
    const excludeTags = filters.tags?.exclude;
    if (excludeTags && excludeTags.length > 0) {
      items = items.filter(
        (item) => !excludeTags.some((tag) => item.references?.some((ref) => ref.id === tag))
      );
    }

    // Apply favorites filter
    if (filters.favoritesOnly) {
      const favorites = await mockFavoritesClient.getFavorites();
      items = items.filter((item) => favorites.favoriteIds.includes(item.id));
    }

    // Apply sorting
    items.sort((a, b) => {
      // Special handling for status field
      if (sort.field === 'status') {
        return statusSortFn(a, b, sort.direction);
      }

      const getFieldValue = (item: (typeof items)[0], field: string): unknown => {
        if (field in item) {
          return (item as unknown as Record<string, unknown>)[field];
        }
        if (field in item.attributes) {
          return (item.attributes as unknown as Record<string, unknown>)[field];
        }
        return undefined;
      };

      const aValue = getFieldValue(a, sort.field);
      const bValue = getFieldValue(b, sort.field);

      if (aValue == null || bValue == null) {
        return 0;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sort.direction === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const total = items.length;
    const start = page.index * page.size;
    const end = start + page.size;
    const paginatedItems = items.slice(start, end);

    return {
      items: paginatedItems,
      total,
    };
  };
};

const meta: Meta = {
  title: 'Content Management/Content List/Examples/Multi Table',
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', maxWidth: '1800px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

const visualizationColumn = (
  <ContentListTable.Column<{ icon?: string; typeTitle?: string }>
    id="typeTitle"
    name="Type"
    render={(item) => (
      <EuiFlexGroup gutterSize="s" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiIcon type={item.icon || 'empty'} size="m" />
        </EuiFlexItem>
        <EuiFlexItem>{item.typeTitle}</EuiFlexItem>
      </EuiFlexGroup>
    )}
  />
);

/**
 * ## Multi-Table Layout
 *
 * Demonstrates a single ContentListProvider controlling multiple tables.
 * Each table uses the `filter` prop to display only items of a specific type.
 *
 * This pattern enables:
 * - **Shared toolbar**: One search/filter toolbar that affects all tables
 * - **Type-specific views**: Each column shows only its content type
 * - **Unified data management**: Single provider manages all content
 *
 * Row actions: View Details and Edit are primary (always visible), Delete goes to overflow menu.
 *
 * Try these interactions:
 * 1. Search for "Revenue" - only matching items across all types will show
 * 2. Filter by tags - all tables update simultaneously
 * 3. Notice how each table only shows its content type (dashboard/map/visualization)
 */
export const MultiTable: StoryObj = {
  render: () => {
    const { Column } = ContentListTable;

    const handleClick = (item: ContentListItem) => action('view')(item.title);
    const handleViewDetails = (item: ContentListItem) => action('view-details')(item.title);
    const handleEdit = (item: ContentListItem) => action('edit')(item.title);
    const handleDelete = (item: ContentListItem) => action('delete')(item.title);

    const findItems = createCombinedFindItems();

    // Custom transform that preserves visualization-specific fields (icon, typeTitle)
    // The default transform only extracts title/description from attributes,
    // losing other fields like icon and typeTitle
    const transform: TransformFunction<UserContentCommonSchema> = (item) => {
      const { attributes, references, updatedAt, createdAt, ...rest } = item;
      return {
        ...rest,
        title: attributes.title,
        description: attributes.description,
        updatedAt: updatedAt ? new Date(updatedAt) : undefined,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        // Preserve visualization-specific fields at top level for easy access
        icon: (attributes as { icon?: string }).icon,
        typeTitle: (attributes as { typeTitle?: string }).typeTitle,
        tags: references?.filter((ref) => ref.type === 'tag').map((ref) => ref.id) ?? [],
        references,
      };
    };

    return (
      <ContentListProvider
        entityName="content item"
        entityNamePlural="content items"
        dataSource={{ findItems, transform }}
        services={mockServices}
        item={{
          actions: {
            onClick: handleClick,
            onViewDetails: handleViewDetails,
            onEdit: handleEdit,
            onDelete: handleDelete,
          },
        }}
        features={{
          favorites: true,
          tags: true,
          search: { placeholder: 'Search all content...' },
          sorting: {
            initialSort: { field: 'updatedAt', direction: 'desc' },
          },
          filtering: true,
          pagination: { initialPageSize: 50 },
        }}
      >
        <EuiTitle size="m">
          <h2>Content Browser</h2>
        </EuiTitle>
        <EuiText size="s" color="subdued">
          <p>
            Single provider with shared toolbar controlling three filtered tables: Dashboards, Maps,
            and Visualizations.
          </p>
        </EuiText>

        <EuiSpacer size="l" />

        <ContentListToolbar />

        <EuiSpacer size="l" />

        <EuiFlexGroup gutterSize="l">
          {/* Dashboards Column */}
          <EuiFlexItem>
            <EuiPanel paddingSize="m">
              <EuiTitle size="xs">
                <h3>Dashboards</h3>
              </EuiTitle>
              <EuiSpacer size="s" />
              <ContentListTable
                title="Dashboards table"
                filter={(item) => item.type === 'dashboard'}
              >
                <Column.Name />
              </ContentListTable>
            </EuiPanel>
          </EuiFlexItem>

          {/* Maps Column */}
          <EuiFlexItem>
            <EuiPanel paddingSize="m">
              <EuiTitle size="xs">
                <h3>Maps</h3>
              </EuiTitle>
              <EuiSpacer size="s" />
              <ContentListTable title="Maps table" filter={(item) => item.type === 'map'}>
                <Column.Name />
              </ContentListTable>
            </EuiPanel>
          </EuiFlexItem>

          {/* Visualizations Column */}
          <EuiFlexItem>
            <EuiPanel paddingSize="m">
              <EuiTitle size="xs">
                <h3>Visualizations</h3>
              </EuiTitle>
              <EuiSpacer size="s" />
              <ContentListTable
                title="Visualizations table"
                filter={(item) => item.type === 'visualization'}
              >
                <Column.Name showDescription={false} />
                {visualizationColumn}
              </ContentListTable>
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </ContentListProvider>
    );
  },
};
