/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { ContentListServices } from '@kbn/content-list-provider';
import type { Tag } from '@kbn/content-management-tags';
import type { FavoritesClientPublic } from '@kbn/content-management-favorites-public';
import { mockUserProfileServices } from './user_profiles';
import { MOCK_TAGS } from './tags';

export interface MockServicesOptions {
  /** Enable user profile services. Default: true */
  userProfiles?: boolean;
  /** Enable tags services. Default: true */
  tags?: boolean;
  /** Custom tag list to use instead of MOCK_TAGS */
  tagList?: Tag[];
  /** Enable favorites services. Default: true */
  favorites?: boolean;
}

/** Default favorite IDs - pre-populate with some dashboards */
const DEFAULT_FAVORITE_IDS = ['dashboard-001', 'dashboard-003', 'dashboard-007'];

/** In-memory store for mock favorites */
let mockFavoriteIds: string[] = [...DEFAULT_FAVORITE_IDS];

/**
 * Reset mock favorites to default state.
 * Useful for storybook stories that need a clean slate.
 */
export function resetMockFavorites() {
  mockFavoriteIds = [...DEFAULT_FAVORITE_IDS];
}

/**
 * Creates a mock FavoritesClientPublic for Storybook stories.
 * Uses in-memory storage for favorite IDs.
 * Pre-populated with DEFAULT_FAVORITE_IDS: dashboard-001, dashboard-003, dashboard-007
 */
export const mockFavoritesClient: FavoritesClientPublic = {
  // The generic type constraint makes favoriteMetadata: never when Metadata is void,
  // so we cast to satisfy the type while omitting favoriteMetadata from the response
  getFavorites: (async () => ({
    favoriteIds: mockFavoriteIds,
  })) as FavoritesClientPublic['getFavorites'],
  addFavorite: async ({ id }) => {
    if (!mockFavoriteIds.includes(id)) {
      mockFavoriteIds = [...mockFavoriteIds, id];
    }
    return { favoriteIds: mockFavoriteIds };
  },
  removeFavorite: async ({ id }) => {
    mockFavoriteIds = mockFavoriteIds.filter((fid) => fid !== id);
    return { favoriteIds: mockFavoriteIds };
  },
  isAvailable: async () => true,
  getFavoriteType: () => 'mock-content',
  reportAddFavoriteClick: () => {},
  reportRemoveFavoriteClick: () => {},
};

/**
 * Creates a mock ContentListServices object for Storybook stories.
 * By default, enables user profiles, tags, and favorites services.
 *
 * Note: EuiSearchBar supports integrated filter dropdowns via its `filters` prop
 * (e.g., taggingApi.ui.getSearchBarFilter()). We've opted to use the standalone
 * filter components (Tags, CreatedBy, etc.) instead, which provide richer functionality
 * like include/exclude support, counts, and search within the filter popover.
 */
export function createMockServices(options: MockServicesOptions = {}): ContentListServices {
  const { userProfiles = true, tags = true, tagList = MOCK_TAGS, favorites = true } = options;

  return {
    userProfile: userProfiles ? mockUserProfileServices : undefined,
    tags: tags ? { getTagList: () => tagList } : undefined,
    favorites: favorites ? { favoritesClient: mockFavoritesClient } : undefined,
  };
}
