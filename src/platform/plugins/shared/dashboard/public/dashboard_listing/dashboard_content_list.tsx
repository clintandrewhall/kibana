/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useCallback, useMemo, useState } from 'react';

import { EuiFlexGroup, EuiFlexItem, EuiPageTemplate, EuiTitle } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { I18nProvider } from '@kbn/i18n-react';
import { QueryClientProvider } from '@kbn/react-query';
import { useExecutionContext } from '@kbn/kibana-react-plugin/public';
import { FavoritesClient } from '@kbn/content-management-favorites-public';
import { ContentInsightsClient } from '@kbn/content-management-content-insights-public';
import { reportPerformanceMetricEvent } from '@kbn/ebt-tools';
import type { IKbnUrlStateStorage } from '@kbn/kibana-utils-plugin/public';
import type { ViewMode as PresentationViewMode } from '@kbn/presentation-publishing';
import type { UserContentCommonSchema } from '@kbn/content-management-table-list-view-common';
import {
  ContentListServerKibanaProvider,
  type ContentListItem,
  type ContentEditorSaveArgs,
  defaultTransform,
  createActivityAppendRows,
} from '@kbn/content-list-provider';
import { ContentListTable } from '@kbn/content-list-table';
import { ContentListToolbar } from '@kbn/content-list-toolbar';
import { ContentListGrid, ViewModeToggle, type ViewMode } from '@kbn/content-list-grid';

import { DASHBOARD_APP_ID } from '../../common/page_bundle_constants';
import { DASHBOARD_SAVED_OBJECT_TYPE } from '../../common/constants';
import { checkForDuplicateDashboardTitle, dashboardClient, findService } from '../dashboard_client';
import { getDashboardBackupService } from '../services/dashboard_backup_service';
import {
  coreServices,
  savedObjectsTaggingService,
  usageCollectionService,
  serverlessService,
} from '../services/kibana_services';
import { logger } from '../services/logger';
import { dashboardQueryClient } from '../services/dashboard_query_client';
import { getDashboardCapabilities } from '../utils/get_dashboard_capabilities';
import { SAVED_OBJECT_DELETE_TIME } from '../utils/telemetry_constants';
import { contentEditorFlyoutStrings } from '../dashboard_app/_dashboard_app_strings';
import {
  dashboardListingTableStrings,
  dashboardListingErrorStrings,
} from './_dashboard_listing_strings';
import { DashboardUnsavedListing } from './dashboard_unsaved_listing';
import { confirmCreateWithUnsaved } from './confirm_overlays';
import { getDashboardListItemLink } from '../dashboard_app/listing_page/get_dashboard_list_item_link';

// =============================================================================
// Types
// =============================================================================

interface DashboardContentListProps {
  /** URL state storage for generating dashboard links with global state. */
  kbnUrlStateStorage: IKbnUrlStateStorage;
  /** Navigate to a dashboard. */
  goToDashboard: (dashboardId?: string, viewMode?: PresentationViewMode) => void;
  /** Optional initial search filter. */
  initialFilter?: string;
  /** Enable session storage integration for unsaved changes. */
  useSessionStorageIntegration?: boolean;
  /** Disable the create dashboard button. */
  disableCreateDashboardButton?: boolean;
  /** Show/hide the create dashboard button. */
  showCreateDashboardButton?: boolean;
}

/**
 * Extended item type with dashboard-specific attributes.
 * The server returns `time_range` which we need for URL generation.
 */
interface DashboardItem extends ContentListItem {
  /** Whether the dashboard has time restore enabled. */
  timeRestore?: boolean;
  /** Dashboard access control permission. */
  canManageAccessControl?: boolean;
  /** Dashboard access mode. */
  accessMode?: string;
}

// =============================================================================
// Strings
// =============================================================================

const strings = {
  tableTitle: dashboardListingTableStrings.getTableListTitle(),
  entityName: dashboardListingTableStrings.getEntityName(),
  entityNamePlural: dashboardListingTableStrings.getEntityNamePlural(),
  pageTitle: i18n.translate('dashboard.contentList.pageTitle', {
    defaultMessage: 'Dashboards',
  }),
};

// =============================================================================
// Transform
// =============================================================================

/**
 * Transform function to convert server response to `DashboardItem`.
 * Extracts `time_range` attribute and converts to `timeRestore` flag.
 */
const dashboardTransform = (item: UserContentCommonSchema): DashboardItem => {
  // Use the default transform for base fields.
  const baseItem = defaultTransform(item);

  // Extract dashboard-specific attributes from the raw item.
  const { attributes } = item as {
    attributes: { time_range?: unknown; access_control?: { access_mode?: string } };
  };
  const { time_range: timeRange, access_control: accessControl } = attributes;

  return {
    ...baseItem,
    timeRestore: Boolean(timeRange),
    accessMode: accessControl?.access_mode,
  };
};

// =============================================================================
// Main Component
// =============================================================================

/**
 * Dashboard Content List - Prototype replacement for TableListViewTable.
 *
 * Uses the new Content List components with server-side pagination, sorting,
 * and filtering via the `/internal/content_management/list` route.
 *
 * ## Features
 * - Server-side search, sort, filter, and pagination.
 * - Tags filtering and display.
 * - Favorites support.
 * - User profile filtering (created by).
 * - Unsaved changes listing from session storage.
 * - Capability-based read-only mode.
 * - Content editor flyout for metadata editing (auto-wired via `features.contentEditor`).
 * - Activity/insights display in content editor.
 *
 * @example
 * ```tsx
 * <DashboardContentList
 *   kbnUrlStateStorage={kbnUrlStateStorage}
 *   goToDashboard={(id, viewMode) => redirectTo({ destination: 'dashboard', id, editMode: viewMode === 'edit' })}
 *   useSessionStorageIntegration={true}
 * />
 * ```
 */
export const DashboardContentList = ({
  kbnUrlStateStorage,
  goToDashboard,
  initialFilter,
  useSessionStorageIntegration = true,
  disableCreateDashboardButton,
  showCreateDashboardButton = true,
}: DashboardContentListProps) => {
  useExecutionContext(coreServices.executionContext, {
    type: 'application',
    page: 'list',
  });

  const dashboardBackupService = useMemo(() => getDashboardBackupService(), []);
  const { showWriteControls } = getDashboardCapabilities();

  // Track unsaved dashboard IDs from session storage.
  const [unsavedDashboardIds, setUnsavedDashboardIds] = useState<string[]>(
    dashboardBackupService.getDashboardIdsWithUnsavedChanges()
  );

  // View mode state for table/grid toggle.
  const [listViewMode, setListViewMode] = useState<ViewMode>('table');

  const refreshUnsavedDashboards = useCallback(
    () => setUnsavedDashboardIds(dashboardBackupService.getDashboardIdsWithUnsavedChanges()),
    [dashboardBackupService]
  );

  // =========================================================================
  // Services
  // =========================================================================

  const favoritesService = useMemo(() => {
    const favoritesClient = new FavoritesClient(DASHBOARD_APP_ID, DASHBOARD_SAVED_OBJECT_TYPE, {
      http: coreServices.http,
      usageCollection: usageCollectionService,
      userProfile: coreServices.userProfile,
    });
    return { favoritesClient };
  }, []);

  const contentInsightsClient = useMemo(
    () => new ContentInsightsClient({ http: coreServices.http, logger }, { domainId: 'dashboard' }),
    []
  );

  // =========================================================================
  // Content Editor Configuration
  // =========================================================================

  /**
   * Update dashboard metadata (title, description, tags).
   * Called when the content editor flyout saves.
   */
  const updateItemMeta = useCallback(
    async ({ id, ...updatedState }: ContentEditorSaveArgs) => {
      const dashboard = await findService.findById(id);
      if (dashboard.status === 'error') {
        return;
      }
      const { references, ...currentState } = dashboard.attributes;
      await dashboardClient.update(
        id,
        {
          ...currentState,
          ...updatedState,
        },
        dashboard.references
      );

      setUnsavedDashboardIds(dashboardBackupService.getDashboardIdsWithUnsavedChanges());
    },
    [dashboardBackupService]
  );

  /**
   * Custom validators for the content editor form.
   * Warns about duplicate dashboard titles.
   */
  const contentEditorValidators = useMemo(
    () => ({
      title: [
        {
          type: 'warning' as const,
          fn: async (value: string, id: string) => {
            if (id) {
              try {
                const dashboard = await findService.findById(id);
                if (dashboard.status === 'error') {
                  return;
                }

                const validTitle = await checkForDuplicateDashboardTitle({
                  title: value,
                  copyOnSave: false,
                  lastSavedTitle: dashboard.attributes.title,
                  isTitleDuplicateConfirmed: false,
                });

                if (!validTitle) {
                  throw new Error(dashboardListingErrorStrings.getDuplicateTitleWarning(value));
                }
              } catch (e) {
                return (e as Error).message;
              }
            }
            return undefined;
          },
        },
      ],
    }),
    []
  );

  /**
   * Determine if an item is readonly based on permissions.
   */
  const isItemReadonly = useCallback(
    (item: ContentListItem): boolean => {
      const dashboardItem = item as DashboardItem;
      if (!showWriteControls) return true;
      if (dashboardItem.isManaged) return true;
      if (
        dashboardItem.canManageAccessControl === false &&
        dashboardItem.accessMode === 'write_restricted'
      ) {
        return true;
      }
      return false;
    },
    [showWriteControls]
  );

  /**
   * Get the reason an item is readonly.
   */
  const getReadonlyReason = useCallback(
    (item: ContentListItem): string | undefined => {
      const dashboardItem = item as DashboardItem;
      if (!showWriteControls) {
        return contentEditorFlyoutStrings.readonlyReason.missingPrivileges;
      }
      if (dashboardItem.isManaged) {
        return contentEditorFlyoutStrings.readonlyReason.managedEntity;
      }
      if (
        dashboardItem.canManageAccessControl === false &&
        dashboardItem.accessMode === 'write_restricted'
      ) {
        return contentEditorFlyoutStrings.readonlyReason.accessControl;
      }
      return undefined;
    },
    [showWriteControls]
  );

  // =========================================================================
  // Item Actions
  // =========================================================================

  /**
   * Generate href for item links.
   * Uses `timeRestore` to determine if global time state should be included.
   */
  const getHref = useCallback(
    (item: DashboardItem) => {
      return getDashboardListItemLink(kbnUrlStateStorage, item.id, item.timeRestore ?? false);
    },
    [kbnUrlStateStorage]
  );

  /**
   * Primary click handler - navigate to view mode.
   */
  const onClick = useCallback(
    (item: DashboardItem) => {
      goToDashboard(item.id);
    },
    [goToDashboard]
  );

  /**
   * Edit action handler - navigate to edit mode.
   */
  const onEdit = useCallback(
    (item: DashboardItem) => {
      goToDashboard(item.id, 'edit');
    },
    [goToDashboard]
  );

  /**
   * Delete action handler - delete via dashboard client.
   */
  const onDelete = useCallback(
    async (item: DashboardItem) => {
      try {
        const deleteStartTime = window.performance.now();
        await dashboardClient.delete(item.id);
        dashboardBackupService.clearState(item.id);

        const deleteDuration = window.performance.now() - deleteStartTime;
        reportPerformanceMetricEvent(coreServices.analytics, {
          eventName: SAVED_OBJECT_DELETE_TIME,
          duration: deleteDuration,
          meta: {
            saved_object_type: DASHBOARD_SAVED_OBJECT_TYPE,
            total: 1,
          },
        });
      } catch (error) {
        coreServices.notifications.toasts.addError(error as Error, {
          title: dashboardListingErrorStrings.getErrorDeletingDashboardToast(),
        });
      }

      refreshUnsavedDashboards();
    },
    [dashboardBackupService, refreshUnsavedDashboards]
  );

  /**
   * Determine if edit/delete actions are enabled for an item.
   * Inverse of `isItemReadonly` - actions are enabled when item is not readonly.
   */
  const isItemActionEnabled = useCallback(
    (item: DashboardItem) => !isItemReadonly(item),
    [isItemReadonly]
  );

  // =========================================================================
  // Selection Actions
  // =========================================================================

  /**
   * Bulk delete handler for selected items.
   */
  const onSelectionDelete = useCallback(
    async (items: ContentListItem[]) => {
      try {
        const deleteStartTime = window.performance.now();

        await Promise.all(
          items.map(async (item) => {
            await dashboardClient.delete(item.id);
            dashboardBackupService.clearState(item.id);
          })
        );

        const deleteDuration = window.performance.now() - deleteStartTime;
        reportPerformanceMetricEvent(coreServices.analytics, {
          eventName: SAVED_OBJECT_DELETE_TIME,
          duration: deleteDuration,
          meta: {
            saved_object_type: DASHBOARD_SAVED_OBJECT_TYPE,
            total: items.length,
          },
        });
      } catch (error) {
        coreServices.notifications.toasts.addError(error as Error, {
          title: dashboardListingErrorStrings.getErrorDeletingDashboardToast(),
        });
      }

      refreshUnsavedDashboards();
    },
    [dashboardBackupService, refreshUnsavedDashboards]
  );

  // =========================================================================
  // Global Actions
  // =========================================================================

  /**
   * Create new dashboard handler.
   * Shows confirmation if there are unsaved changes in session storage.
   */
  const onCreate = useCallback(() => {
    if (useSessionStorageIntegration && dashboardBackupService.dashboardHasUnsavedEdits()) {
      confirmCreateWithUnsaved(
        () => {
          dashboardBackupService.clearState();
          goToDashboard();
        },
        () => goToDashboard()
      );
      return;
    }
    goToDashboard();
  }, [dashboardBackupService, goToDashboard, useSessionStorageIntegration]);

  // =========================================================================
  // Configuration
  // =========================================================================

  const isReadOnly = !showWriteControls;
  const showCreateButton =
    showWriteControls && showCreateDashboardButton && !disableCreateDashboardButton;

  return (
    <I18nProvider>
      <QueryClientProvider client={dashboardQueryClient}>
        <ContentListServerKibanaProvider
          entityName={strings.entityName}
          entityNamePlural={strings.entityNamePlural}
          savedObjectType={DASHBOARD_SAVED_OBJECT_TYPE}
          additionalAttributes={['time_range', 'access_control']}
          transform={dashboardTransform}
          core={coreServices}
          savedObjectsTagging={savedObjectsTaggingService?.getTaggingApi()}
          favorites={favoritesService}
          contentInsightsClient={contentInsightsClient}
          isReadOnly={isReadOnly}
          item={{
            getHref,
            actions: {
              onClick,
              // onViewDetails is auto-wired from features.contentEditor
              onEdit: {
                handler: onEdit,
                isEnabled: isItemActionEnabled,
              },
              onDelete: {
                handler: onDelete,
                isEnabled: isItemActionEnabled,
              },
            },
          }}
          features={{
            globalActions: showCreateButton ? { onCreate } : undefined,
            selection: showWriteControls ? { onSelectionDelete } : undefined,
            search: {
              initialQuery: initialFilter,
            },
            sorting: {
              initialSort: { field: 'updatedAt', direction: 'desc' },
            },
            contentEditor: {
              onSave: updateItemMeta,
              customValidators: contentEditorValidators,
              isReadonly: isItemReadonly,
              readonlyReason: getReadonlyReason,
              appendRows: !serverlessService
                ? createActivityAppendRows(contentInsightsClient, strings.entityNamePlural)
                : undefined,
            },
          }}
        >
          <EuiPageTemplate.Section>
            <EuiFlexGroup direction="column" gutterSize="m">
              {/* Page Title with View Mode Toggle */}
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
                  <EuiFlexItem grow={true}>
                    <EuiTitle size="l">
                      <h1 data-test-subj="dashboardListingHeading">{strings.pageTitle}</h1>
                    </EuiTitle>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <ViewModeToggle
                      viewMode={listViewMode}
                      onChange={setListViewMode}
                      data-test-subj="dashboardViewModeToggle"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>

              {/* Unsaved Changes Listing */}
              {unsavedDashboardIds.length > 0 && (
                <EuiFlexItem grow={false}>
                  <DashboardUnsavedListing
                    goToDashboard={goToDashboard}
                    unsavedDashboardIds={unsavedDashboardIds}
                    refreshUnsavedDashboards={refreshUnsavedDashboards}
                  />
                </EuiFlexItem>
              )}

              {/* Toolbar with Search, Filters, and Actions */}
              <EuiFlexItem grow={false}>
                <ContentListToolbar data-test-subj="dashboardListingToolbar" />
              </EuiFlexItem>

              {/* Table or Grid */}
              <EuiFlexItem>
                {listViewMode === 'table' ? (
                  <ContentListTable
                    title={strings.tableTitle}
                    data-test-subj="dashboardListingTable"
                  />
                ) : (
                  <ContentListGrid iconType="dashboardApp" data-test-subj="dashboardListingGrid" />
                )}
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPageTemplate.Section>
        </ContentListServerKibanaProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
};

// Default export for lazy loading.
// eslint-disable-next-line import/no-default-export
export default DashboardContentList;
