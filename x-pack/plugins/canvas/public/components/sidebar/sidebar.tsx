/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC } from 'react';

import { EuiFlexGroup, EuiFlexItem, EuiButtonEmpty } from '@elastic/eui';

// @ts-expect-error unconverted component
import { SidebarContent } from './sidebar_content';

interface Props {
  commit: Function;
  isVisible: boolean;
  onClose?: () => void;
}

export const Sidebar: FC<Props> = ({ commit, isVisible, onClose = () => {} }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="canvasSidebar">
      <EuiFlexGroup direction="column" gutterSize="none" className="canvasSidebar__content">
        <EuiFlexItem grow={true}>
          <SidebarContent commit={commit} />
        </EuiFlexItem>
        <EuiFlexItem grow={false} className="canvasSidebar__footer">
          <EuiButtonEmpty size="s" onClick={onClose}>
            Close
          </EuiButtonEmpty>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};
