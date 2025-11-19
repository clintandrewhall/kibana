/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { createParseSearchQuery, type TagItem } from './create_parse_search_query';

describe('createParseSearchQuery', () => {
  const mockTags: TagItem[] = [
    { id: 'tag-1', name: 'Production' },
    { id: 'tag-2', name: 'Development' },
    { id: 'tag-3', name: 'Testing' },
    { id: undefined, name: 'NoIdTag' },
  ];

  const getTagList = jest.fn(() => mockTags);

  beforeEach(() => {
    getTagList.mockClear();
  });

  it('should return the original query when no tags are present', () => {
    const parseSearchQuery = createParseSearchQuery(getTagList);
    const result = parseSearchQuery('dashboard');

    expect(result).toEqual({
      searchQuery: 'dashboard',
      tagIds: undefined,
      tagIdsToExclude: undefined,
    });
  });

  it('should extract tag IDs for must clauses', () => {
    const parseSearchQuery = createParseSearchQuery(getTagList);
    const result = parseSearchQuery('tag:Production dashboard');

    // Note: removeOrFieldClauses only removes OR clauses, so simple field clauses remain.
    expect(result).toEqual({
      searchQuery: 'tag:Production dashboard',
      tagIds: ['tag-1'],
      tagIdsToExclude: undefined,
    });
  });

  it('should extract tag IDs for must_not clauses', () => {
    const parseSearchQuery = createParseSearchQuery(getTagList);
    const result = parseSearchQuery('-tag:Development dashboard');

    expect(result).toEqual({
      searchQuery: '-tag:Development dashboard',
      tagIds: undefined,
      tagIdsToExclude: ['tag-2'],
    });
  });

  it('should handle multiple tags in the same query', () => {
    const parseSearchQuery = createParseSearchQuery(getTagList);
    const result = parseSearchQuery('tag:Production tag:Development dashboard');

    expect(result).toEqual({
      searchQuery: 'tag:Production tag:Development dashboard',
      tagIds: ['tag-1', 'tag-2'],
      tagIdsToExclude: undefined,
    });
  });

  it('should handle both include and exclude tags', () => {
    const parseSearchQuery = createParseSearchQuery(getTagList);
    const result = parseSearchQuery('tag:Production -tag:Development dashboard');

    expect(result).toEqual({
      searchQuery: 'tag:Production -tag:Development dashboard',
      tagIds: ['tag-1'],
      tagIdsToExclude: ['tag-2'],
    });
  });

  it('should ignore unknown tag names', () => {
    const parseSearchQuery = createParseSearchQuery(getTagList);
    const result = parseSearchQuery('tag:Unknown dashboard');

    expect(result).toEqual({
      searchQuery: 'tag:Unknown dashboard',
      tagIds: undefined,
      tagIdsToExclude: undefined,
    });
  });

  it('should ignore tags without id', () => {
    const parseSearchQuery = createParseSearchQuery(getTagList);
    const result = parseSearchQuery('tag:NoIdTag dashboard');

    expect(result).toEqual({
      searchQuery: 'tag:NoIdTag dashboard',
      tagIds: undefined,
      tagIdsToExclude: undefined,
    });
  });

  it('should ignore invalid tag name formats (empty strings)', () => {
    const parseSearchQuery = createParseSearchQuery(getTagList);
    // EUI Query.parse handles malformed input gracefully.
    const result = parseSearchQuery('tag: dashboard');

    expect(result).toEqual({
      searchQuery: 'tag: dashboard',
      tagIds: undefined,
      tagIdsToExclude: undefined,
    });
  });

  it('should preserve other field clauses in the query', () => {
    const parseSearchQuery = createParseSearchQuery(getTagList);
    const result = parseSearchQuery('tag:Production createdBy:user1 dashboard');

    // Tag clauses remain in searchQuery (removeOrFieldClauses only removes OR clauses).
    expect(result).toEqual({
      searchQuery: 'tag:Production createdBy:user1 dashboard',
      tagIds: ['tag-1'],
      tagIdsToExclude: undefined,
    });
  });

  it('should handle query with only tag clauses', () => {
    const parseSearchQuery = createParseSearchQuery(getTagList);
    const result = parseSearchQuery('tag:Production');

    expect(result).toEqual({
      searchQuery: 'tag:Production',
      tagIds: ['tag-1'],
      tagIdsToExclude: undefined,
    });
  });

  it('should handle empty query string', () => {
    const parseSearchQuery = createParseSearchQuery(getTagList);
    const result = parseSearchQuery('');

    expect(result).toEqual({
      searchQuery: '',
      tagIds: undefined,
      tagIdsToExclude: undefined,
    });
  });

  it('should call getTagList on each parse', () => {
    const parseSearchQuery = createParseSearchQuery(getTagList);

    parseSearchQuery('tag:Production');
    parseSearchQuery('tag:Development');

    expect(getTagList).toHaveBeenCalledTimes(2);
  });

  describe('error handling', () => {
    it('should return original query on parsing error', () => {
      const throwingGetTagList = jest.fn(() => {
        throw new Error('Tag service unavailable');
      });

      const parseSearchQuery = createParseSearchQuery(throwingGetTagList);
      const result = parseSearchQuery('tag:Production dashboard');

      expect(result).toEqual({
        searchQuery: 'tag:Production dashboard',
        tagIds: undefined,
        tagIdsToExclude: undefined,
      });
    });

    it('should log error in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const throwingGetTagList = jest.fn(() => {
        throw new Error('Tag service unavailable');
      });

      const parseSearchQuery = createParseSearchQuery(throwingGetTagList);
      parseSearchQuery('tag:Production dashboard');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[ContentListProvider] Tag query parsing error:',
        expect.any(Error),
        { searchQuery: 'tag:Production dashboard' }
      );

      consoleWarnSpy.mockRestore();
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not log error in production mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const throwingGetTagList = jest.fn(() => {
        throw new Error('Tag service unavailable');
      });

      const parseSearchQuery = createParseSearchQuery(throwingGetTagList);
      parseSearchQuery('tag:Production dashboard');

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
      process.env.NODE_ENV = originalNodeEnv;
    });
  });
});
