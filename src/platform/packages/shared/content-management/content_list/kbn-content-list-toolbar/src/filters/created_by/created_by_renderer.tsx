/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useMemo, useCallback } from 'react';
import {
  EuiSelectable,
  EuiFlexGroup,
  EuiFlexItem,
  useEuiTheme,
  type EuiSelectableOption,
  type Query,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import {
  useContentListItems,
  useContentListUserFilter,
} from '@kbn/content-list-provider';
import {
  useUserProfiles,
  UserAvatarTip,
  ManagedAvatarTip,
  NoCreatorTip,
} from '@kbn/content-management-user-profiles';
import { useFilterPopover, FilterPopover } from '../filter_popover';

/** Sentinel value representing items with no creator. */
const NO_CREATOR = '__no_creator__';
/** Sentinel value representing managed (Elastic-created) items. */
const MANAGED = '__managed__';

const i18nText = {
  title: i18n.translate('contentManagement.contentList.createdByFilter.title', {
    defaultMessage: 'Created by',
  }),
  noCreatorLabel: i18n.translate('contentManagement.contentList.createdByFilter.noCreator', {
    defaultMessage: 'No creator',
  }),
  managedLabel: i18n.translate('contentManagement.contentList.createdByFilter.managed', {
    defaultMessage: 'Managed',
  }),
  ariaLabel: i18n.translate('contentManagement.contentList.createdByFilter.ariaLabel', {
    defaultMessage: 'Filter by creator',
  }),
};

/**
 * Props for the {@link CreatedByRenderer} component.
 *
 * When used with `EuiSearchBar` `custom_component` filters, the search bar
 * passes `query` and `onChange` props. The created-by filter doesn't use these
 * (it manages filter state separately via `useContentListUserFilter`), but we
 * accept them for compatibility.
 */
export interface CreatedByRendererProps {
  /** Query object from `EuiSearchBar` (unused). */
  query: Query;
  /** `onChange` callback from `EuiSearchBar` (unused). */
  onChange?: (query: Query) => void;
  /** Optional `data-test-subj` attribute for testing. */
  'data-test-subj'?: string;
}

/**
 * Option item for the created-by selectable list.
 */
interface CreatedByOption extends EuiSelectableOption {
  /** The user ID, or a sentinel value for special options. */
  key: string;
}

/**
 * `CreatedByRenderer` component for the toolbar "Created by" filter popover.
 *
 * Renders a filterable list of unique creators extracted from the current items.
 * Each option shows a user avatar. Special entries are provided for "Managed"
 * items (created by Elastic) and items with no creator.
 *
 * Uses `useContentListUserFilter` from the provider for filter state management.
 */
export const CreatedByRenderer = ({
  'data-test-subj': dataTestSubj = 'contentListCreatedByFilter',
}: CreatedByRendererProps) => {
  const { euiTheme } = useEuiTheme();
  const { items } = useContentListItems();
  const { selectedUsers, setSelectedUsers, hasActiveFilter } = useContentListUserFilter();
  const { isOpen, toggle, close } = useFilterPopover();

  // Extract unique creator UIDs from loaded items.
  const uniqueCreators = useMemo(() => {
    const uids = new Set<string>();
    let hasNoCreator = false;
    let hasManaged = false;

    for (const item of items) {
      if (item.managed) {
        hasManaged = true;
      } else if (item.createdBy) {
        uids.add(item.createdBy);
      } else {
        hasNoCreator = true;
      }
    }

    return { uids: Array.from(uids), hasNoCreator, hasManaged };
  }, [items]);

  // Bulk-fetch user profiles for all unique creator UIDs (only when popover is open).
  const profilesQuery = useUserProfiles(uniqueCreators.uids, { enabled: isOpen });

  // Build selectable options from profiles and special entries.
  const options = useMemo((): CreatedByOption[] => {
    const result: CreatedByOption[] = [];

    // Add managed entry if applicable.
    if (uniqueCreators.hasManaged) {
      result.push({
        key: MANAGED,
        label: i18nText.managedLabel,
        prepend: <ManagedAvatarTip />,
        checked: selectedUsers.includes(MANAGED) ? 'on' : undefined,
      });
    }

    // Add user profile entries.
    if (profilesQuery.data) {
      for (const profile of profilesQuery.data) {
        const uid = profile.uid;
        result.push({
          key: uid,
          label: profile.user.full_name ?? profile.user.username,
          prepend: <UserAvatarTip uid={uid} />,
          checked: selectedUsers.includes(uid) ? 'on' : undefined,
        });
      }
    } else {
      // While profiles are loading, show UID-based entries.
      for (const uid of uniqueCreators.uids) {
        result.push({
          key: uid,
          label: uid,
          checked: selectedUsers.includes(uid) ? 'on' : undefined,
        });
      }
    }

    // Add "no creator" entry if applicable.
    if (uniqueCreators.hasNoCreator) {
      result.push({
        key: NO_CREATOR,
        label: i18nText.noCreatorLabel,
        prepend: <NoCreatorTip />,
        checked: selectedUsers.includes(NO_CREATOR) ? 'on' : undefined,
      });
    }

    return result;
  }, [uniqueCreators, profilesQuery.data, selectedUsers]);

  const handleSelectChange = useCallback(
    (updatedOptions: CreatedByOption[]) => {
      const selected = updatedOptions
        .filter((opt) => opt.checked === 'on')
        .map((opt) => opt.key!);
      setSelectedUsers(selected);
    },
    [setSelectedUsers]
  );

  return (
    <FilterPopover
      title={i18nText.title}
      activeCount={selectedUsers.length}
      isOpen={isOpen}
      onToggle={toggle}
      onClose={close}
      panelWidth={euiTheme.base * 20}
      data-test-subj={dataTestSubj}
    >
      <EuiSelectable<CreatedByOption>
        aria-label={i18nText.ariaLabel}
        options={options}
        onChange={handleSelectChange}
        data-test-subj="createdBySelectOptions"
        listProps={{ bordered: false }}
      >
        {(list) => (
          <EuiFlexGroup direction="column" gutterSize="none">
            <EuiFlexItem grow={false}>{list}</EuiFlexItem>
          </EuiFlexGroup>
        )}
      </EuiSelectable>
    </FilterPopover>
  );
};
