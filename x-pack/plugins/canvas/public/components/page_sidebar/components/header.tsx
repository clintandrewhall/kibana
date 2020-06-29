/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiTitle, EuiToolTip, EuiButtonIcon } from '@elastic/eui';

import { PageSidebarThemePopover } from '../theme_popover';
import { PageSidebarTemplatePopover } from '../template_popover';

interface Props {
  onAddPage: () => void;
}

export const PageSidebarHeader: FC<Props> = ({ onAddPage }) => {
  return (
    <EuiFlexGroup
      className="canvasPageSidebar__header"
      gutterSize="none"
      alignItems="center"
      justifyContent="spaceBetween"
    >
      <EuiFlexItem grow={false}>
        <EuiTitle size="xs">
          <h3>Pages</h3>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup alignItems="center" gutterSize="xs" justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <PageSidebarThemePopover />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <PageSidebarTemplatePopover />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
