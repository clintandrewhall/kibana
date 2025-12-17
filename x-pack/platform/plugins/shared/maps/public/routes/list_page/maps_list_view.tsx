/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, memo, useEffect } from 'react';
import type { CoreStart, ScopedHistory } from '@kbn/core/public';
import type { SavedObjectTaggingPluginStart } from '@kbn/saved-objects-tagging-plugin/public';
import { METRIC_TYPE } from '@kbn/analytics';
import { i18n } from '@kbn/i18n';
import { EuiFlexGroup, EuiFlexItem, EuiPageTemplate, EuiTitle } from '@elastic/eui';
import {
  ContentListClientKibanaProvider,
  ContentListServerKibanaProvider,
  type ContentListItem,
} from '@kbn/content-list-provider';
import { ContentListTable } from '@kbn/content-list-table';
import { ContentListToolbar } from '@kbn/content-list-toolbar';

import {
  MAP_SAVED_OBJECT_TYPE,
  APP_ID,
  APP_NAME,
  getEditPath,
  MAP_PATH,
} from '../../../common/constants';
import {
  getMapsCapabilities,
  getCoreChrome,
  getExecutionContextService,
  getNavigateToApp,
  getUsageCollection,
  getServerless,
} from '../../kibana_services';

const onCreate = () => {
  const navigateToApp = getNavigateToApp();
  getUsageCollection()?.reportUiCounter(APP_ID, METRIC_TYPE.CLICK, 'create_maps_vis_editor');
  navigateToApp(APP_ID, {
    path: MAP_PATH,
  });
};

const NAME = i18n.translate('xpack.maps.mapListing.entityName', {
  defaultMessage: 'map',
});
const NAME_PLURAL = i18n.translate('xpack.maps.mapListing.entityNamePlural', {
  defaultMessage: 'maps',
});

interface Props {
  history: ScopedHistory;
  coreStart: CoreStart;
  savedObjectsTagging?: SavedObjectTaggingPluginStart;
}

const MapsListViewComp = ({ history, coreStart, savedObjectsTagging }: Props) => {
  const deleteMap = useCallback(
    async (id: string) => {
      await coreStart.http.delete(`/api/saved_objects/${MAP_SAVED_OBJECT_TYPE}/${id}`);
    },
    [coreStart.http]
  );
  getExecutionContextService().set({
    type: 'application',
    name: APP_ID,
    page: 'list',
  });

  const isReadOnly = !getMapsCapabilities().save;

  // Set breadcrumbs on mount.
  useEffect(() => {
    getCoreChrome().docTitle.change(APP_NAME);
    if (getServerless()) {
      getServerless()!.setBreadcrumbs({ text: APP_NAME });
    } else {
      getCoreChrome().setBreadcrumbs([{ text: APP_NAME }]);
    }
  }, []);

  const onClick = useCallback(
    (item: { id: string }) => {
      history.push(getEditPath(item.id));
    },
    [history]
  );

  const onDelete = useCallback(
    async (item: { id: string }) => {
      await deleteMap(item.id);
    },
    [deleteMap]
  );

  const onSelectionDelete = useCallback(
    async (items: ContentListItem[]) => {
      await Promise.all(items.map((item) => deleteMap(item.id)));
    },
    [deleteMap]
  );

  const providerProps = {
    entityName: NAME,
    entityNamePlural: NAME_PLURAL,
    savedObjectType: MAP_SAVED_OBJECT_TYPE,
    core: coreStart,
    savedObjectsTagging,
    isReadOnly,
    item: {
      getHref: (item: ContentListItem) => getEditPath(item.id),
      actions: {
        onClick,
        onEdit: onClick,
        onDelete,
      },
    },
    features: {
      globalActions: { onCreate },
      selection: {
        onSelectionDelete,
      },
      contentEditor: true,
    },
    children: (
      <EuiPageTemplate.Section>
        <EuiFlexGroup direction="column" gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiTitle size="l">
              <h1>{APP_NAME}</h1>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <ContentListToolbar />
          </EuiFlexItem>
          <EuiFlexItem>
            <ContentListTable title="Maps listing table" />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageTemplate.Section>
    ),
  };

  return (
    <>
      <ContentListServerKibanaProvider {...providerProps} />
      <ContentListClientKibanaProvider {...providerProps} />
    </>
  );
};

export const MapsListView = memo(MapsListViewComp);
