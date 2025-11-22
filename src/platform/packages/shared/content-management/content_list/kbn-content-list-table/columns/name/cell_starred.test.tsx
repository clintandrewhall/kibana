/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { EuiProvider } from '@elastic/eui';
import type { ContentListItem } from '@kbn/content-list-provider';
import { NameCellStarred } from './cell_starred';

// Mock the external dependencies.
jest.mock('@kbn/content-management-favorites-public', () => ({
  FavoriteButton: ({ id, className }: { id: string; className?: string }) => (
    <button data-test-subj="starred-button" data-id={id} className={className}>
      Starred
    </button>
  ),
}));

jest.mock('@kbn/content-list-provider', () => ({
  useContentListConfig: jest.fn(),
}));

const { useContentListConfig } = jest.requireMock('@kbn/content-list-provider');

const renderCell = (item: ContentListItem) => {
  return render(
    <EuiProvider colorMode="light">
      <NameCellStarred item={item} />
    </EuiProvider>
  );
};

describe('NameCellStarred', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useContentListConfig.mockReturnValue({
      supports: { favorites: true },
    });
  });

  describe('rendering', () => {
    it('renders FavoriteButton when starred is supported and canFavorite is true', () => {
      const item: ContentListItem = {
        id: 'item-1',
        title: 'Test Item',
        canFavorite: true,
      };

      renderCell(item);

      expect(screen.getByTestId('starred-button')).toBeInTheDocument();
      expect(screen.getByTestId('starred-button')).toHaveAttribute('data-id', 'item-1');
    });

    it('renders FavoriteButton when starred is supported and canFavorite is undefined (opt-out model)', () => {
      const item: ContentListItem = {
        id: 'item-1',
        title: 'Test Item',
        // canFavorite is undefined - should use provider default
      };

      renderCell(item);

      expect(screen.getByTestId('starred-button')).toBeInTheDocument();
    });

    it('returns null when starred is not supported', () => {
      useContentListConfig.mockReturnValue({
        supports: { favorites: false },
      });

      const item: ContentListItem = {
        id: 'item-1',
        title: 'Test Item',
        canFavorite: true,
      };

      const { container } = renderCell(item);

      expect(container).toBeEmptyDOMElement();
    });

    it('returns null when item explicitly opts out with canFavorite: false', () => {
      const item: ContentListItem = {
        id: 'item-1',
        title: 'Test Item',
        canFavorite: false,
      };

      const { container } = renderCell(item);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('supports config', () => {
    it('checks supports.favorites from provider config', () => {
      const item: ContentListItem = {
        id: 'item-1',
        title: 'Test Item',
        canFavorite: true,
      };

      renderCell(item);

      expect(useContentListConfig).toHaveBeenCalled();
    });

    it('handles undefined supports', () => {
      useContentListConfig.mockReturnValue({
        supports: undefined,
      });

      const item: ContentListItem = {
        id: 'item-1',
        title: 'Test Item',
        canFavorite: true,
      };

      const { container } = renderCell(item);

      expect(container).toBeEmptyDOMElement();
    });
  });
});

