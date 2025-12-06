/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import {
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiBadge,
  EuiCodeBlock,
} from '@elastic/eui';
import {
  useContentListItems,
  useContentListSearch,
  useContentListSort,
  useContentListSelection,
  useContentListFilters,
  useContentListPagination,
  useContentListConfig,
} from '@kbn/content-list-provider';

/**
 * Compact state indicator component for displaying live ContentList state.
 * Useful for debugging and understanding state changes in stories.
 */
export function StateIndicator() {
  const { items, totalItems, isLoading } = useContentListItems();
  const { queryText } = useContentListSearch();
  const { field: sortField, direction: sortDirection } = useContentListSort();
  const { selectedCount } = useContentListSelection();
  const { filters } = useContentListFilters();
  const { index: pageIndex, size: pageSize, totalPages } = useContentListPagination();
  const config = useContentListConfig();

  return (
    <EuiPanel color="subdued" hasBorder paddingSize="s" style={{ width: 260 }}>
      <EuiTitle size="xxs">
        <h4>Live State</h4>
      </EuiTitle>
      <EuiSpacer size="xs" />

      <EuiFlexGroup gutterSize="xs" direction="column">
        <EuiFlexItem grow={false}>
          <EuiText size="xs">
            <strong>Items:</strong> {items.length} / {totalItems}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="xs">
            <strong>Page:</strong> {pageIndex + 1} / {totalPages || 1} ({pageSize}/page)
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="xs">
            <strong>Selected:</strong>{' '}
            {selectedCount > 0 ? <EuiBadge color="primary">{selectedCount}</EuiBadge> : '0'}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="xs">
            <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="xs">
            <strong>Read-Only:</strong> {config.isReadOnly ? 'Yes' : 'No'}
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="s" />

      <EuiCodeBlock language="json" fontSize="s" paddingSize="s" isCopyable>
        {JSON.stringify(
          {
            search: queryText || null,
            sort: { field: sortField, direction: sortDirection },
            filters,
          },
          null,
          2
        )}
      </EuiCodeBlock>
    </EuiPanel>
  );
}
