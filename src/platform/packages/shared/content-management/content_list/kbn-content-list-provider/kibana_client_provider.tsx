/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import type { UserContentCommonSchema } from '@kbn/content-management-table-list-view-common';
import type { ContentListKibanaProviderBaseProps } from './types';
import type { DataSourceConfig } from './datasource';
import { createFindItemsStrategy } from './datasource';
import { useKibanaProviderSetup, ContentListKibanaProvider } from './kibana_provider';
import { resolveContentEditorConfig } from './features/content_editor/resolve_config';

/**
 * Props for the Client Kibana provider.
 *
 * This provider uses the `_find` API with client-side sorting, filtering, and pagination.
 * Best suited for smaller datasets where all items can be loaded at once.
 *
 * @template T The item type from the datasource.
 */
export interface ContentListClientKibanaProviderProps<T = UserContentCommonSchema>
  extends ContentListKibanaProviderBaseProps<T> {
  /**
   * Fields to search when using the search query.
   * @default ['title', 'description']
   */
  searchFields?: string[];
  /**
   * UI setting key for the maximum number of items to fetch.
   * When provided, uses `core.uiSettings.get(maxLimitSettingKey)` to determine the limit.
   */
  maxLimitSettingKey?: string;
}

/**
 * Client-side Kibana provider for content list functionality.
 *
 * Uses the `_find` API to fetch saved objects with **client-side** sorting, filtering,
 * and pagination. This approach fetches all items up to a configured limit and processes
 * them in the browser.
 *
 * Best suited for:
 * - Smaller datasets (< 10,000 items)
 * - Cases where `maxLimitSettingKey` is configured
 * - Legacy compatibility with TableListView behavior
 *
 * For larger datasets or server-side operations, use `ContentListServerKibanaProvider` instead.
 *
 * @example
 * ```tsx
 * <ContentListClientKibanaProvider
 *   entityName="dashboard"
 *   entityNamePlural="dashboards"
 *   savedObjectType="dashboard"
 *   searchFields={['title', 'description']}
 *   maxLimitSettingKey="savedObjects:listingLimit"
 *   core={coreStart}
 *   savedObjectsTagging={savedObjectsTagging}
 *   favorites={favoritesService}
 * >
 *   <MyContentList />
 * </ContentListClientKibanaProvider>
 * ```
 */
export const ContentListClientKibanaProvider = <
  T extends UserContentCommonSchema = UserContentCommonSchema
>({
  children,
  savedObjectsTagging,
  core,
  favorites,
  contentInsightsClient,
  features = {},
  disable = {},
  entityName,
  entityNamePlural,
  item,
  isReadOnly,
  queryKeyScope,
  savedObjectType,
  searchFields,
  maxLimitSettingKey,
  transform,
}: PropsWithChildren<ContentListClientKibanaProviderProps<T>>): JSX.Element => {
  const { supports, queryKeyScope: resolvedQueryKeyScope } = useKibanaProviderSetup({
    entityName,
    queryKeyScope,
    disable,
    savedObjectsTagging,
    favorites,
    core,
    contentInsightsClient,
    features,
  });

  // Create findItems using the find strategy with client-side processing.
  // This matches the original TableListView behavior: overfetch all items, filter/sort/paginate in browser.
  const resolvedDataSource = useMemo(() => {
    const { findItems } = createFindItemsStrategy({
      savedObjectType,
      http: core.http,
      searchFields,
      maxLimitSettingKey,
      getMaxLimit: maxLimitSettingKey ? () => core.uiSettings.get(maxLimitSettingKey) : undefined,
    });

    return {
      findItems,
      transform,
    } as DataSourceConfig<UserContentCommonSchema>;
  }, [savedObjectType, core.http, core.uiSettings, searchFields, maxLimitSettingKey, transform]);

  // Resolve content editor config, applying defaults for `contentEditor: true`.
  const resolvedFeatures = useMemo(() => {
    const resolvedContentEditor = resolveContentEditorConfig(features.contentEditor, {
      core,
      savedObjectType,
      entityNamePlural,
      contentInsightsClient,
    });

    return {
      ...features,
      contentEditor: resolvedContentEditor,
    };
  }, [features, core, savedObjectType, entityNamePlural, contentInsightsClient]);

  return (
    <ContentListKibanaProvider
      core={core}
      savedObjectsTagging={savedObjectsTagging}
      favorites={favorites}
      contentInsightsClient={contentInsightsClient}
      supports={supports}
      dataSource={resolvedDataSource}
      strategy="client"
      entityName={entityName}
      entityNamePlural={entityNamePlural}
      item={item}
      isReadOnly={isReadOnly}
      queryKeyScope={resolvedQueryKeyScope}
      features={resolvedFeatures}
    >
      {children}
    </ContentListKibanaProvider>
  );
};
