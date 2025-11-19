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
import { createSearchItemsStrategy } from './datasource';
import { useKibanaProviderSetup, ContentListKibanaProvider } from './kibana_provider';
import { resolveContentEditorConfig } from './features/content_editor/resolve_config';

/**
 * Props for the Server Kibana provider.
 *
 * This provider uses the `/internal/content_management/list` route with server-side
 * sorting, filtering, and pagination.
 *
 * @template T The item type from the datasource.
 */
export interface ContentListServerKibanaProviderProps<T = UserContentCommonSchema>
  extends ContentListKibanaProviderBaseProps<T> {
  /**
   * Additional attribute fields to include in the response beyond the baseline.
   *
   * Baseline fields always included: id, type, title, description, createdAt, createdBy,
   * updatedAt, updatedBy, managed, tags (via references).
   *
   * Use this for custom attributes needed for display, filtering, or sorting.
   *
   * @example
   * ```ts
   * additionalAttributes: ['status', 'version']
   * ```
   */
  additionalAttributes?: string[];
}

/**
 * Server-side Kibana provider for content list functionality.
 *
 * Uses the `/internal/content_management/list` route with **server-side** sorting,
 * filtering, and pagination via Elasticsearch. This approach is more efficient for
 * large datasets as it only fetches the current page of results.
 *
 * Features:
 * - Full sorting support (including title) via runtime mappings
 * - Server-side tag filtering
 * - Server-side favorites filtering (via terms lookup query)
 * - Efficient pagination
 *
 * Best suited for:
 * - Large datasets
 * - Cases requiring title sorting
 * - Production use with optimal performance
 *
 * For smaller datasets or legacy TableListView compatibility, use
 * `ContentListClientKibanaProvider` instead.
 *
 * @example
 * ```tsx
 * <ContentListServerKibanaProvider
 *   entityName="map"
 *   entityNamePlural="maps"
 *   savedObjectType="map"
 *   additionalAttributes={['status']}
 *   core={coreStart}
 *   savedObjectsTagging={savedObjectsTagging}
 *   favorites={favoritesService}
 * >
 *   <MyContentList />
 * </ContentListServerKibanaProvider>
 * ```
 */
export const ContentListServerKibanaProvider = <
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
  additionalAttributes,
  transform,
}: PropsWithChildren<ContentListServerKibanaProviderProps<T>>): JSX.Element => {
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

  // Create findItems using the search strategy.
  const resolvedDataSource = useMemo(() => {
    const { findItems } = createSearchItemsStrategy({
      savedObjectType,
      http: core.http,
      searchFieldsConfig: additionalAttributes ? { additionalAttributes } : undefined,
    });

    return {
      findItems,
      transform,
    } as DataSourceConfig<UserContentCommonSchema>;
  }, [savedObjectType, core.http, additionalAttributes, transform]);

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
      strategy="server"
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
