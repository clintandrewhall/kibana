/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useCallback, useEffect, useId, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import {
  ContentManagementTagsKibanaProvider,
  type ContentManagementTagsKibanaDependencies,
} from '@kbn/content-management-tags';
import {
  UserProfilesKibanaProvider,
  type UserProfilesServices,
  createBatcher,
} from '@kbn/content-management-user-profiles';
import type { FavoritesServices } from '@kbn/content-management-favorites-public';
import { FavoritesContextProvider } from '@kbn/content-management-favorites-public';
import { ContentEditorKibanaProvider } from '@kbn/content-management-content-editor';
import {
  ContentInsightsProvider,
  type ContentInsightsClientPublic,
} from '@kbn/content-management-content-insights-public';
import type { CoreStart } from '@kbn/core/public';
import type { ContentListFeatures, ServiceDisables, Supports } from './features';
import type { DataSourceConfig, ContentListStrategy } from './datasource';
import { ContentListStateProvider } from './state';
import { QueryClientProvider, contentListQueryClient } from './query_client';
import { ContentListContext, warnOnQueryKeyScopeCollision } from './provider';
import type { ContentListKibanaProviderBaseProps } from './types';
import { createContextValue } from './utils';
import { ContentEditorActionProvider } from './features/content_editor/content_editor_action_context';

/** The savedObjectsTagging prop type from {@link ContentManagementTagsKibanaDependencies}. */
type SavedObjectsTaggingProp = ContentManagementTagsKibanaDependencies['savedObjectsTagging'];

/**
 * Derives support flags from service presence and explicit disables.
 *
 * Services are auto-enabled when provided unless explicitly disabled via `disable` prop.
 */
export const deriveSupports = (
  disable: ServiceDisables,
  savedObjectsTagging: SavedObjectsTaggingProp | undefined,
  favorites: FavoritesServices | undefined,
  core: CoreStart,
  contentInsightsClient: ContentInsightsClientPublic | undefined,
  hasContentEditorConfig: boolean
): Supports => ({
  tags: !disable.tags && !!savedObjectsTagging,
  favorites: !disable.favorites && !!favorites,
  userProfiles: !disable.userProfiles && !!core?.userProfile,
  // Content editor requires core services and the contentEditor feature config to be provided.
  contentEditor: !disable.contentEditor && !!core && hasContentEditorConfig,
  // Content insights requires the client to be provided.
  contentInsights: !disable.contentInsights && !!contentInsightsClient,
});

/**
 * Props for {@link useKibanaProviderSetup} hook.
 */
interface UseKibanaProviderSetupProps
  extends Pick<ContentListKibanaProviderBaseProps, 'entityName' | 'disable'> {
  queryKeyScope?: string;
  savedObjectsTagging?: SavedObjectsTaggingProp;
  favorites?: FavoritesServices;
  core: CoreStart;
  contentInsightsClient?: ContentInsightsClientPublic;
  features?: ContentListFeatures;
}

/**
 * Return type for {@link useKibanaProviderSetup} hook.
 */
interface UseKibanaProviderSetupResult {
  supports: Supports;
  /** Resolved queryKeyScope (uses auto-generated ID if not explicitly provided). */
  queryKeyScope: string;
}

/**
 * Hook for common Kibana provider setup logic.
 *
 * Handles query key scope collision warnings and derives support flags.
 * Auto-generates a stable `queryKeyScope` if not explicitly provided to prevent cache collisions.
 */
export const useKibanaProviderSetup = ({
  entityName,
  queryKeyScope: queryKeyScopeProp,
  disable = {},
  savedObjectsTagging,
  favorites,
  core,
  contentInsightsClient,
  features,
}: UseKibanaProviderSetupProps): UseKibanaProviderSetupResult => {
  // Generate a stable unique ID for this provider instance.
  // Used as the default queryKeyScope to prevent cache collisions.
  const generatedId = useId();
  const queryKeyScope = queryKeyScopeProp ?? generatedId;

  // Warn in development if multiple providers share the same explicit queryKeyScope.
  // Only warn when the prop was explicitly provided (not auto-generated).
  useEffect(
    () => warnOnQueryKeyScopeCollision(entityName, queryKeyScopeProp),
    [entityName, queryKeyScopeProp]
  );

  // Determine if contentEditor feature config is provided.
  const hasContentEditorConfig = features?.contentEditor !== undefined;

  return {
    supports: deriveSupports(
      disable,
      savedObjectsTagging,
      favorites,
      core,
      contentInsightsClient,
      hasContentEditorConfig
    ),
    queryKeyScope,
  };
};

/**
 * Props for the {@link ContentListKibanaProvider} component.
 * @internal
 */
interface ContentListKibanaProviderProps extends PropsWithChildren {
  core: CoreStart;
  savedObjectsTagging?: SavedObjectsTaggingProp;
  favorites?: FavoritesServices;
  contentInsightsClient?: ContentInsightsClientPublic;
  supports: Supports;
  dataSource: DataSourceConfig;
  /** Processing strategy: 'client' or 'server'. */
  strategy: ContentListStrategy;
  entityName: string;
  entityNamePlural: string;
  item?: ContentListKibanaProviderBaseProps['item'];
  isReadOnly?: boolean;
  queryKeyScope?: string;
  features: ContentListFeatures;
}

/**
 * Wraps children with Kibana service providers and ContentListContext.
 *
 * Order: QueryClient > Favorites > Tags > ContentInsights > ContentEditor > UserProfiles > ContentListContext > StateProvider
 *
 * Note: ContentEditor must be inside UserProfiles because it uses useUserProfilesServices.
 *
 * @internal
 */
export const ContentListKibanaProvider: React.FC<ContentListKibanaProviderProps> = ({
  children,
  core,
  savedObjectsTagging,
  favorites,
  contentInsightsClient,
  supports,
  dataSource,
  strategy,
  entityName,
  entityNamePlural,
  item,
  isReadOnly,
  queryKeyScope,
  features,
}) => {
  // Create user profile services when user profiles are supported.
  const bulkGetUserProfiles = useCallback(
    async (uids: string[]) => {
      if (uids.length === 0) {
        return [];
      }
      return core.userProfile.bulkGet({ uids: new Set(uids), dataPath: 'avatar' });
    },
    [core.userProfile]
  );

  const userProfileServices: UserProfilesServices | undefined = useMemo(() => {
    if (!supports.userProfiles) {
      return undefined;
    }
    return {
      bulkGetUserProfiles,
      getUserProfile: createBatcher({
        fetcher: bulkGetUserProfiles,
        resolver: (users, id) => users.find((u) => u.uid === id)!,
      }).fetch,
    };
  }, [supports.userProfiles, bulkGetUserProfiles]);

  // Build the context value using shared helper.
  const contextValue = createContextValue(
    { entityName, entityNamePlural, item, isReadOnly },
    dataSource,
    features,
    supports,
    strategy,
    queryKeyScope,
    userProfileServices
  );

  // Build content from innermost to outermost.
  // Provider order (innermost first): ContentListContext -> ContentEditor -> UserProfiles -> ContentInsights -> Tags -> Favorites -> QueryClient
  let content: React.ReactNode = (
    <ContentListContext.Provider value={contextValue}>
      <ContentListStateProvider>{children}</ContentListStateProvider>
    </ContentListContext.Provider>
  );

  // ContentEditor must be INSIDE UserProfiles because it uses useUserProfilesServices.
  // Note: savedObjectsTagging type cast needed because ContentEditorKibanaProvider
  // expects the full tagging API while our prop is a subset.
  // ContentEditorActionProvider is placed INSIDE ContentEditorKibanaProvider so it can
  // safely call useOpenContentEditor (which requires ContentEditorContext).
  if (supports.contentEditor && core) {
    content = (
      <ContentEditorKibanaProvider
        core={core}
        savedObjectsTagging={
          savedObjectsTagging as Parameters<
            typeof ContentEditorKibanaProvider
          >[0]['savedObjectsTagging']
        }
      >
        <ContentEditorActionProvider>{content}</ContentEditorActionProvider>
      </ContentEditorKibanaProvider>
    );
  }
  // UserProfiles wraps ContentEditor so content editor has access to user profile services.
  if (supports.userProfiles && core) {
    content = <UserProfilesKibanaProvider core={core}>{content}</UserProfilesKibanaProvider>;
  }
  // ContentInsights wraps UserProfiles so activity rows can access insights.
  if (supports.contentInsights && contentInsightsClient) {
    content = (
      <ContentInsightsProvider contentInsightsClient={contentInsightsClient}>
        {content}
      </ContentInsightsProvider>
    );
  }
  if (supports.tags && savedObjectsTagging && core) {
    content = (
      <ContentManagementTagsKibanaProvider savedObjectsTagging={savedObjectsTagging} core={core}>
        {content}
      </ContentManagementTagsKibanaProvider>
    );
  }
  if (supports.favorites && favorites) {
    content = <FavoritesContextProvider {...favorites}>{content}</FavoritesContextProvider>;
  }

  return <QueryClientProvider client={contentListQueryClient}>{content}</QueryClientProvider>;
};
