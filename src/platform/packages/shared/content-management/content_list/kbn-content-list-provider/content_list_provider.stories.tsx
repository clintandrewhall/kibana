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
import {
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiButton,
  EuiButtonGroup,
  EuiHorizontalRule,
  EuiSwitch,
  EuiFormRow,
  EuiFieldNumber,
  EuiText,
  EuiAccordion,
  useGeneratedHtmlId,
} from '@elastic/eui';
import {
  ContentListProvider,
  useContentListItems,
  useContentListSearch,
  useContentListFilters,
  useContentListSort,
  useContentListPagination,
  useContentListSelection,
  useContentListConfig,
  type ContentListServices,
  type ContentListState,
  type FindItemsFn,
} from '.';
import { createMockItems, createMockFindItems, identityTransform } from './test_utils';

const emptyServices: ContentListServices = {};

// =============================================================================
// State Display Components
// =============================================================================

/**
 * Displays the raw ContentListState from the state provider.
 */
const RuntimeStateDisplay = () => {
  const { items, totalItems, isLoading, error } = useContentListItems();
  const { queryText, error: searchError } = useContentListSearch();
  const { filters } = useContentListFilters();
  const { field: sortField, direction: sortDirection } = useContentListSort();
  const { index: pageIndex, size: pageSize } = useContentListPagination();
  const { getSelectedItems } = useContentListSelection();

  const state: ContentListState = {
    items,
    totalItems,
    isLoading,
    error,
    search: { queryText, error: searchError },
    filters,
    sort: { field: sortField, direction: sortDirection },
    page: { index: pageIndex, size: pageSize },
    selectedItems: new Set(getSelectedItems().map((item) => item.id)),
    isReadOnly: false,
  };

  // Create a serializable version for display.
  const displayState = {
    ...state,
    items: state.items.map((item) => ({ id: item.id, title: item.title })),
    selectedItems: Array.from(state.selectedItems),
    error: state.error?.message,
    search: {
      ...state.search,
      error: state.search.error?.message,
    },
  };

  return (
    <EuiCodeBlock language="json" fontSize="s" paddingSize="m" isCopyable overflowHeight={400}>
      {JSON.stringify(displayState, null, 2)}
    </EuiCodeBlock>
  );
};

/**
 * Displays the configuration from the config provider (static props).
 */
const ConfigDisplay = () => {
  const config = useContentListConfig();

  // Create a display-friendly version of the config.
  const displayConfig = {
    entityName: config.entityName,
    entityNamePlural: config.entityNamePlural,
    isReadOnly: config.isReadOnly,
    features: config.features,
    supports: config.supports,
    item: config.item,
    dataSource: {
      findItems: '[Function]',
      transform: config.dataSource.transform ? '[Function]' : undefined,
    },
  };

  return (
    <EuiCodeBlock language="json" fontSize="s" paddingSize="m" isCopyable overflowHeight={400}>
      {JSON.stringify(displayConfig, null, 2)}
    </EuiCodeBlock>
  );
};

// =============================================================================
// State Manipulation Controls
// =============================================================================

/**
 * Controls for manipulating the provider's runtime state.
 */
const StateControls = () => {
  const { queryText, setSearch, clearSearch } = useContentListSearch();
  const { filters, setFilters, clearFilters } = useContentListFilters();
  const { field: sortField, direction: sortDirection, setSort } = useContentListSort();
  const { index: pageIndex, size: pageSize, setPage, totalPages } = useContentListPagination();
  const { selectedCount, toggleSelection, selectAll, clearSelection, isSelected } =
    useContentListSelection();
  const { items, refetch, isLoading } = useContentListItems();
  const config = useContentListConfig();

  const sortFieldAccordionId = useGeneratedHtmlId({ prefix: 'sortFieldAccordion' });
  const paginationAccordionId = useGeneratedHtmlId({ prefix: 'paginationAccordion' });
  const filtersAccordionId = useGeneratedHtmlId({ prefix: 'filtersAccordion' });
  const selectionAccordionId = useGeneratedHtmlId({ prefix: 'selectionAccordion' });

  return (
    <EuiPanel paddingSize="m">
      <EuiTitle size="xs">
        <h3>State Controls</h3>
      </EuiTitle>
      <EuiText size="xs" color="subdued">
        <p>Use these controls to manipulate the provider&apos;s runtime state.</p>
      </EuiText>
      <EuiSpacer size="m" />

      {/* Search Controls */}
      <EuiFormRow label="Search Query" fullWidth>
        <EuiFlexGroup gutterSize="s">
          <EuiFlexItem>
            <EuiFieldText
              value={queryText}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter search text..."
              fullWidth
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton size="s" onClick={clearSearch}>
              Clear
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFormRow>

      <EuiSpacer size="m" />

      {/* Sort Controls */}
      <EuiAccordion id={sortFieldAccordionId} buttonContent="Sort Controls" paddingSize="s">
        <EuiSpacer size="s" />
        <EuiFormRow label="Sort Field">
          <EuiButtonGroup
            legend="Sort field"
            options={[
              { id: 'title', label: 'Title' },
              { id: 'updatedAt', label: 'Updated' },
            ]}
            idSelected={sortField}
            onChange={(id) => setSort(id, sortDirection)}
            buttonSize="compressed"
          />
        </EuiFormRow>
        <EuiSpacer size="s" />
        <EuiFormRow label="Sort Direction">
          <EuiButtonGroup
            legend="Sort direction"
            options={[
              { id: 'asc', label: 'Ascending' },
              { id: 'desc', label: 'Descending' },
            ]}
            idSelected={sortDirection}
            onChange={(id) => setSort(sortField, id as 'asc' | 'desc')}
            buttonSize="compressed"
          />
        </EuiFormRow>
      </EuiAccordion>

      <EuiSpacer size="m" />

      {/* Pagination Controls */}
      <EuiAccordion id={paginationAccordionId} buttonContent="Pagination Controls" paddingSize="s">
        <EuiSpacer size="s" />
        <EuiFlexGroup gutterSize="m">
          <EuiFlexItem>
            <EuiFormRow label="Page Index">
              <EuiFieldNumber
                value={pageIndex}
                onChange={(e) => setPage(parseInt(e.target.value, 10), pageSize)}
                min={0}
                max={totalPages - 1}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow label="Page Size">
              <EuiFieldNumber
                value={pageSize}
                onChange={(e) => setPage(pageIndex, parseInt(e.target.value, 10))}
                min={1}
                max={100}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
        <EuiText size="xs" color="subdued">
          Total pages: {totalPages}
        </EuiText>
      </EuiAccordion>

      <EuiSpacer size="m" />

      {/* Filter Controls */}
      <EuiAccordion id={filtersAccordionId} buttonContent="Filter Controls" paddingSize="s">
        <EuiSpacer size="s" />
        <EuiFormRow label="Tag Filters (include)">
          <EuiFlexGroup gutterSize="xs" wrap>
            {['tag-1', 'tag-2'].map((tag) => {
              const isIncluded = filters.tags?.include.includes(tag);
              return (
                <EuiFlexItem grow={false} key={tag}>
                  <EuiButton
                    size="s"
                    color={isIncluded ? 'success' : 'text'}
                    fill={isIncluded}
                    onClick={() => {
                      const currentInclude = filters.tags?.include ?? [];
                      const currentExclude = filters.tags?.exclude ?? [];
                      const newInclude = isIncluded
                        ? currentInclude.filter((t) => t !== tag)
                        : [...currentInclude, tag];
                      setFilters({
                        ...filters,
                        tags: { include: newInclude, exclude: currentExclude },
                      });
                    }}
                  >
                    {tag}
                  </EuiButton>
                </EuiFlexItem>
              );
            })}
          </EuiFlexGroup>
        </EuiFormRow>
        <EuiSpacer size="s" />
        <EuiFormRow label="Starred Only">
          <EuiSwitch
            label=""
            checked={filters.favoritesOnly ?? false}
            onChange={(e) => setFilters({ ...filters, favoritesOnly: e.target.checked })}
          />
        </EuiFormRow>
        <EuiSpacer size="s" />
        <EuiButton size="s" onClick={clearFilters}>
          Clear All Filters
        </EuiButton>
      </EuiAccordion>

      <EuiSpacer size="m" />

      {/* Selection Controls */}
      {!config.isReadOnly && (
        <EuiAccordion id={selectionAccordionId} buttonContent="Selection Controls" paddingSize="s">
          <EuiSpacer size="s" />
          <EuiText size="s">
            <strong>Selected: {selectedCount}</strong>
          </EuiText>
          <EuiSpacer size="s" />
          <EuiFlexGroup gutterSize="s" wrap>
            <EuiFlexItem grow={false}>
              <EuiButton size="s" onClick={selectAll}>
                Select All
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton size="s" onClick={clearSelection} disabled={selectedCount === 0}>
                Clear Selection
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
          <EuiFormRow label="Toggle Individual Items">
            <EuiFlexGroup gutterSize="xs" wrap>
              {items.slice(0, 5).map((item) => (
                <EuiFlexItem grow={false} key={item.id}>
                  <EuiButton
                    size="s"
                    color={isSelected(item.id) ? 'primary' : 'text'}
                    fill={isSelected(item.id)}
                    onClick={() => toggleSelection(item.id)}
                  >
                    {item.id}
                  </EuiButton>
                </EuiFlexItem>
              ))}
            </EuiFlexGroup>
          </EuiFormRow>
        </EuiAccordion>
      )}

      <EuiHorizontalRule margin="m" />

      {/* Refetch Button */}
      <EuiButton onClick={refetch} isLoading={isLoading} iconType="refresh">
        Refetch Data
      </EuiButton>
    </EuiPanel>
  );
};

// =============================================================================
// Story Args Interface
// =============================================================================

interface ProviderStoryArgs {
  // Core Config
  entityName: string;
  entityNamePlural: string;
  isReadOnly: boolean;
  // Data
  itemCount: number;
  simulateLoading: boolean;
  simulateError: boolean;
  // Features
  searchEnabled: boolean;
  searchInitialQuery: string;
  filteringEnabled: boolean;
  paginationEnabled: boolean;
  paginationInitialPageSize: number;
  sortingEnabled: boolean;
  sortingInitialField: string;
  sortingInitialDirection: 'asc' | 'desc';
}

// =============================================================================
// Story Meta
// =============================================================================

const meta: Meta<ProviderStoryArgs> = {
  title: 'Content Management/Content List/ContentListProvider',
  parameters: {
    docs: {
      description: {
        component: `
The \`ContentListProvider\` manages state for content list UIs. It provides:

- **Configuration Context** (static): Entity names, feature flags, data source config.
- **State Context** (dynamic): Items, loading, search, filters, sort, pagination, selection.

This storybook focuses on visualizing provider state and configuration, with controls to manipulate the runtime state.
        `,
      },
    },
  },
  argTypes: {
    // Core Config
    entityName: {
      control: 'text',
      description: 'Singular name for the entity type.',
      table: { category: 'Core Config' },
    },
    entityNamePlural: {
      control: 'text',
      description: 'Plural name for the entity type.',
      table: { category: 'Core Config' },
    },
    isReadOnly: {
      control: 'boolean',
      description: 'Disables selection and editing actions.',
      table: { category: 'Core Config' },
    },
    // Data
    itemCount: {
      control: { type: 'number', min: 0, max: 500, step: 10 },
      description: 'Number of mock items in the data source.',
      table: { category: 'Data Source' },
    },
    simulateLoading: {
      control: 'boolean',
      description: 'Simulate slow loading (3s delay).',
      table: { category: 'Data Source' },
    },
    simulateError: {
      control: 'boolean',
      description: 'Simulate fetch error.',
      table: { category: 'Data Source' },
    },
    // Search Feature
    searchEnabled: {
      control: 'boolean',
      description: 'Enable search feature.',
      table: { category: 'Features: Search' },
    },
    searchInitialQuery: {
      control: 'text',
      description: 'Initial search query.',
      table: { category: 'Features: Search' },
    },
    // Filtering Feature
    filteringEnabled: {
      control: 'boolean',
      description: 'Enable filtering feature.',
      table: { category: 'Features: Filtering' },
    },
    // Pagination Feature
    paginationEnabled: {
      control: 'boolean',
      description: 'Enable pagination feature.',
      table: { category: 'Features: Pagination' },
    },
    paginationInitialPageSize: {
      control: { type: 'select' },
      options: [5, 10, 20, 25, 50, 100],
      description: 'Initial page size.',
      table: { category: 'Features: Pagination' },
    },
    // Sorting Feature
    sortingEnabled: {
      control: 'boolean',
      description: 'Enable sorting feature.',
      table: { category: 'Features: Sorting' },
    },
    sortingInitialField: {
      control: { type: 'select' },
      options: ['title', 'updatedAt'],
      description: 'Initial sort field.',
      table: { category: 'Features: Sorting' },
    },
    sortingInitialDirection: {
      control: { type: 'radio' },
      options: ['asc', 'desc'],
      description: 'Initial sort direction.',
      table: { category: 'Features: Sorting' },
    },
  },
};

export default meta;

type Story = StoryObj<ProviderStoryArgs>;

// =============================================================================
// Provider Source Code Display
// =============================================================================

const getProviderSourceCode = (args: ProviderStoryArgs): string => {
  const features: string[] = [];

  if (args.searchEnabled) {
    if (args.searchInitialQuery) {
      features.push(`  search: { initialQuery: '${args.searchInitialQuery}' }`);
    } else {
      features.push(`  search: true`);
    }
  }

  if (args.filteringEnabled) {
    features.push(`  filtering: true`);
  }

  if (args.paginationEnabled) {
    features.push(`  pagination: { initialPageSize: ${args.paginationInitialPageSize} }`);
  }

  if (args.sortingEnabled) {
    features.push(
      `  sorting: { initialSort: { field: '${args.sortingInitialField}', direction: '${args.sortingInitialDirection}' } }`
    );
  }

  const featuresStr = features.length > 0 ? `{\n${features.join(',\n')}\n}` : '{}';

  return `<ContentListProvider
  entityName="${args.entityName}"
  entityNamePlural="${args.entityNamePlural}"
  isReadOnly={${args.isReadOnly}}
  dataSource={{
    findItems: myFindItemsFunction,
    transform: myTransformFunction,
  }}
  services={myServices}
  features={${featuresStr}}
>
  {children}
</ContentListProvider>`;
};

// =============================================================================
// Story Inner Components (to use hooks properly)
// =============================================================================

interface ExplorerContentProps {
  args: ProviderStoryArgs;
}

const ExplorerContent: React.FC<ExplorerContentProps> = ({ args }) => {
  return (
    <EuiFlexGroup gutterSize="l" alignItems="flexStart">
      {/* Left: Configuration */}
      <EuiFlexItem grow={1}>
        <EuiTitle size="xs">
          <h3>Provider Configuration</h3>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiCodeBlock language="tsx" fontSize="s" paddingSize="m" isCopyable>
          {getProviderSourceCode(args)}
        </EuiCodeBlock>
      </EuiFlexItem>

      {/* Right: Controls & Runtime State */}
      <EuiFlexItem grow={1}>
        <EuiFlexGroup direction="column" gutterSize="m">
          <EuiFlexItem>
            <StateControls />
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiPanel paddingSize="m">
              <EuiTitle size="xs">
                <h3>Runtime State (ContentListState)</h3>
              </EuiTitle>
              <EuiText size="xs" color="subdued">
                <p>Dynamic state from the state provider, updated by user actions.</p>
              </EuiText>
              <EuiSpacer size="s" />
              <RuntimeStateDisplay />
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const ReadOnlyContent: React.FC = () => {
  return (
    <EuiFlexGroup gutterSize="l" direction="column">
      <EuiFlexItem>
        <EuiPanel paddingSize="m" color="warning">
          <EuiTitle size="xs">
            <h3>Read-Only Mode</h3>
          </EuiTitle>
          <EuiText size="s">
            <p>
              When <code>isReadOnly=true</code>, selection controls are disabled. Notice the
              selection accordion is hidden in the state controls.
            </p>
          </EuiText>
        </EuiPanel>
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiFlexGroup gutterSize="l" alignItems="flexStart">
          {/* Left: Configuration */}
          <EuiFlexItem grow={1}>
            <EuiPanel paddingSize="m">
              <EuiTitle size="xs">
                <h3>Configuration</h3>
              </EuiTitle>
              <EuiSpacer size="s" />
              <ConfigDisplay />
            </EuiPanel>
          </EuiFlexItem>

          {/* Right: Controls & Runtime State */}
          <EuiFlexItem grow={1}>
            <EuiFlexGroup direction="column" gutterSize="m">
              <EuiFlexItem>
                <StateControls />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiPanel paddingSize="m">
                  <EuiTitle size="xs">
                    <h3>Runtime State</h3>
                  </EuiTitle>
                  <EuiSpacer size="s" />
                  <RuntimeStateDisplay />
                </EuiPanel>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const ErrorContent: React.FC = () => {
  return (
    <EuiFlexGroup gutterSize="l" direction="column">
      <EuiFlexItem>
        <EuiPanel paddingSize="m" color="danger">
          <EuiTitle size="xs">
            <h3>Error State</h3>
          </EuiTitle>
          <EuiText size="s">
            <p>
              This story simulates a fetch error. Check the <code>error</code> field in the runtime
              state.
            </p>
          </EuiText>
        </EuiPanel>
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiFlexGroup gutterSize="l" alignItems="flexStart">
          {/* Left: Configuration */}
          <EuiFlexItem grow={1}>
            <EuiPanel paddingSize="m">
              <EuiTitle size="xs">
                <h3>Configuration</h3>
              </EuiTitle>
              <EuiSpacer size="s" />
              <ConfigDisplay />
            </EuiPanel>
          </EuiFlexItem>

          {/* Right: Runtime State */}
          <EuiFlexItem grow={1}>
            <EuiPanel paddingSize="m">
              <EuiTitle size="xs">
                <h3>Runtime State</h3>
              </EuiTitle>
              <EuiSpacer size="s" />
              <RuntimeStateDisplay />
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

interface MinimalContentProps {
  args: Pick<ProviderStoryArgs, 'entityName' | 'entityNamePlural' | 'itemCount'>;
}

const MinimalContent: React.FC<MinimalContentProps> = ({ args }) => {
  const sourceCode = `<ContentListProvider
  entityName="${args.entityName}"
  entityNamePlural="${args.entityNamePlural}"
  dataSource={{ findItems, transform }}
  services={{}}
>
  {children}
</ContentListProvider>`;

  return (
    <EuiFlexGroup gutterSize="l" alignItems="flexStart">
      {/* Left: Configuration */}
      <EuiFlexItem grow={1}>
        <EuiTitle size="xs">
          <h3>Provider Configuration (Minimal)</h3>
        </EuiTitle>
        <EuiText size="xs" color="subdued">
          <p>
            Only required props: <code>entityName</code>, <code>entityNamePlural</code>,{' '}
            <code>dataSource</code>, and <code>services</code>. All features use defaults.
          </p>
        </EuiText>
        <EuiSpacer size="s" />
        <EuiCodeBlock language="tsx" fontSize="s" paddingSize="m" isCopyable>
          {sourceCode}
        </EuiCodeBlock>
      </EuiFlexItem>

      {/* Right: Runtime State */}
      <EuiFlexItem grow={1}>
        <EuiPanel paddingSize="m">
          <EuiTitle size="xs">
            <h3>Runtime State</h3>
          </EuiTitle>
          <EuiSpacer size="s" />
          <RuntimeStateDisplay />
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

// =============================================================================
// Helper to create findItems with loading/error simulation
// =============================================================================

const createFindItemsWithSimulation = (
  itemCount: number,
  simulateLoading: boolean,
  simulateError: boolean
): FindItemsFn => {
  const mockItems = createMockItems(itemCount);

  if (simulateError) {
    return async () => {
      throw new Error('Simulated fetch error');
    };
  }

  // Cast is safe: createMockFindItems always returns a function, the union type
  // with undefined comes from the DataSourceConfig union which allows searchService instead.
  const baseFindItems = createMockFindItems(mockItems) as FindItemsFn;

  if (simulateLoading) {
    return async (params) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return baseFindItems(params);
    };
  }

  return baseFindItems;
};

// =============================================================================
// Main Story
// =============================================================================

/**
 * Interactive explorer for the ContentListProvider.
 * Use the Controls panel to configure the provider and see the resulting state.
 */
export const Explorer: Story = {
  args: {
    entityName: 'dashboard',
    entityNamePlural: 'dashboards',
    isReadOnly: false,
    itemCount: 50,
    simulateLoading: false,
    simulateError: false,
    searchEnabled: true,
    searchInitialQuery: '',
    filteringEnabled: true,
    paginationEnabled: true,
    paginationInitialPageSize: 10,
    sortingEnabled: true,
    sortingInitialField: 'updatedAt',
    sortingInitialDirection: 'desc',
  },
  render: (args) => {
    const findItems = createFindItemsWithSimulation(
      args.itemCount,
      args.simulateLoading,
      args.simulateError
    );

    const features = {
      search: args.searchEnabled
        ? args.searchInitialQuery
          ? { initialQuery: args.searchInitialQuery }
          : true
        : false,
      filtering: args.filteringEnabled,
      pagination: args.paginationEnabled
        ? { initialPageSize: args.paginationInitialPageSize }
        : false,
      sorting: args.sortingEnabled
        ? {
            initialSort: {
              field: args.sortingInitialField,
              direction: args.sortingInitialDirection,
            },
          }
        : false,
    };

    return (
      <ContentListProvider
        entityName={args.entityName}
        entityNamePlural={args.entityNamePlural}
        isReadOnly={args.isReadOnly}
        dataSource={{ findItems, transform: identityTransform }}
        services={emptyServices}
        features={features}
      >
        <ExplorerContent args={args} />
      </ContentListProvider>
    );
  },
};

// =============================================================================
// Read-Only Mode Story
// =============================================================================

/**
 * Demonstrates the provider in read-only mode where selection is disabled.
 */
export const ReadOnlyMode: Story = {
  args: {
    entityName: 'report',
    entityNamePlural: 'reports',
    isReadOnly: true,
    itemCount: 25,
    simulateLoading: false,
    simulateError: false,
    searchEnabled: true,
    searchInitialQuery: '',
    filteringEnabled: true,
    paginationEnabled: true,
    paginationInitialPageSize: 10,
    sortingEnabled: true,
    sortingInitialField: 'title',
    sortingInitialDirection: 'asc',
  },
  render: (args) => {
    const findItems = createFindItemsWithSimulation(
      args.itemCount,
      args.simulateLoading,
      args.simulateError
    );

    return (
      <ContentListProvider
        entityName={args.entityName}
        entityNamePlural={args.entityNamePlural}
        isReadOnly={args.isReadOnly}
        dataSource={{ findItems, transform: identityTransform }}
        services={emptyServices}
        features={{
          search: args.searchEnabled,
          filtering: args.filteringEnabled,
          pagination: { initialPageSize: args.paginationInitialPageSize },
          sorting: {
            initialSort: {
              field: args.sortingInitialField,
              direction: args.sortingInitialDirection,
            },
          },
        }}
      >
        <ReadOnlyContent />
      </ContentListProvider>
    );
  },
};

// =============================================================================
// Error State Story
// =============================================================================

/**
 * Shows how the provider handles fetch errors.
 */
export const ErrorState: Story = {
  args: {
    entityName: 'canvas',
    entityNamePlural: 'canvases',
    isReadOnly: false,
    itemCount: 50,
    simulateLoading: false,
    simulateError: true,
    searchEnabled: true,
    searchInitialQuery: '',
    filteringEnabled: true,
    paginationEnabled: true,
    paginationInitialPageSize: 10,
    sortingEnabled: true,
    sortingInitialField: 'updatedAt',
    sortingInitialDirection: 'desc',
  },
  render: (args) => {
    const findItems = async () => {
      throw new Error('Failed to load items: Network timeout');
    };

    return (
      <ContentListProvider
        entityName={args.entityName}
        entityNamePlural={args.entityNamePlural}
        isReadOnly={args.isReadOnly}
        dataSource={{ findItems, transform: identityTransform }}
        services={emptyServices}
        features={{
          search: args.searchEnabled,
          filtering: args.filteringEnabled,
          pagination: { initialPageSize: args.paginationInitialPageSize },
        }}
      >
        <ErrorContent />
      </ContentListProvider>
    );
  },
};

// =============================================================================
// Minimal Configuration Story
// =============================================================================

/**
 * Shows the provider with minimal configuration (only required props).
 */
export const MinimalConfig: Story = {
  args: {
    entityName: 'item',
    entityNamePlural: 'items',
    isReadOnly: false,
    itemCount: 20,
    simulateLoading: false,
    simulateError: false,
    searchEnabled: false,
    searchInitialQuery: '',
    filteringEnabled: false,
    paginationEnabled: false,
    paginationInitialPageSize: 20,
    sortingEnabled: false,
    sortingInitialField: 'title',
    sortingInitialDirection: 'asc',
  },
  argTypes: {
    // Hide feature-related controls - minimal config uses defaults
    isReadOnly: { table: { disable: true } },
    simulateLoading: { table: { disable: true } },
    simulateError: { table: { disable: true } },
    searchEnabled: { table: { disable: true } },
    searchInitialQuery: { table: { disable: true } },
    filteringEnabled: { table: { disable: true } },
    paginationEnabled: { table: { disable: true } },
    paginationInitialPageSize: { table: { disable: true } },
    sortingEnabled: { table: { disable: true } },
    sortingInitialField: { table: { disable: true } },
    sortingInitialDirection: { table: { disable: true } },
  },
  render: (args) => {
    const findItems = createFindItemsWithSimulation(args.itemCount, false, false);

    return (
      <ContentListProvider
        entityName={args.entityName}
        entityNamePlural={args.entityNamePlural}
        dataSource={{ findItems, transform: identityTransform }}
        services={emptyServices}
      >
        <MinimalContent args={args} />
      </ContentListProvider>
    );
  },
};
