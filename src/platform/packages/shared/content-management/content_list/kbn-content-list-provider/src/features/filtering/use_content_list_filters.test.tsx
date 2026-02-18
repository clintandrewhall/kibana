/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ContentListProvider } from '../../context';
import type { FindItemsResult, FindItemsParams } from '../../datasource';
import { useContentListFilters } from './use_content_list_filters';

describe('useContentListFilters', () => {
  const mockFindItems = jest.fn(
    async (_params: FindItemsParams): Promise<FindItemsResult> => ({
      items: [],
      total: 0,
    })
  );

  const createWrapper =
    () =>
    ({ children }: { children: React.ReactNode }) =>
      (
        <ContentListProvider
          id="test-list"
          labels={{ entity: 'item', entityPlural: 'items' }}
          dataSource={{ findItems: mockFindItems }}
        >
          {children}
        </ContentListProvider>
      );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns default filters', () => {
      const { result } = renderHook(() => useContentListFilters(), {
        wrapper: createWrapper(),
      });

      expect(result.current.filters).toEqual({
        search: undefined,
        tags: undefined,
      });
    });
  });

  describe('setFilters', () => {
    it('sets search filter', () => {
      const { result } = renderHook(() => useContentListFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setFilters({ search: 'dashboard' });
      });

      expect(result.current.filters.search).toBe('dashboard');
    });

    it('sets tag filters', () => {
      const { result } = renderHook(() => useContentListFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setFilters({
          search: 'query',
          tags: { include: ['tag-1'], exclude: ['tag-2'] },
        });
      });

      expect(result.current.filters).toEqual({
        search: 'query',
        tags: { include: ['tag-1'], exclude: ['tag-2'] },
      });
    });

    it('replaces all filters on each call', () => {
      const { result } = renderHook(() => useContentListFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setFilters({
          search: 'first',
          tags: { include: ['tag-1'] },
        });
      });

      act(() => {
        result.current.setFilters({ search: 'second' });
      });

      expect(result.current.filters).toEqual({ search: 'second' });
    });
  });

  describe('clearFilters', () => {
    it('resets filters to defaults', () => {
      const { result } = renderHook(() => useContentListFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setFilters({
          search: 'query',
          tags: { include: ['tag-1'] },
        });
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({
        search: undefined,
        tags: undefined,
      });
    });
  });

  describe('error handling', () => {
    it('throws when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useContentListFilters());
      }).toThrow(
        'ContentListStateContext is missing. Ensure your component is wrapped with ContentListProvider.'
      );

      consoleSpy.mockRestore();
    });
  });
});
