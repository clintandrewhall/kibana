/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable @typescript-eslint/naming-convention */

import React, { FC } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiTitle, EuiButtonIcon } from '@elastic/eui';
import classnames from 'classnames';

import { PageSidebarThemePopover } from './theme';
import { PageSidebarTemplatePopover } from './template';

interface Props {
  onToggle: (isExpanded: boolean) => void;
  isExpanded: boolean;
}

export const PageSidebarHeader: FC<Props> = ({ onToggle, isExpanded }) => {
  const title = (
    <EuiFlexItem grow={false}>
      <EuiTitle size="xs">
        <h3>Pages</h3>
      </EuiTitle>
    </EuiFlexItem>
  );

  return (
    <EuiFlexGroup
      className="canvasPageSidebar__header"
      gutterSize="none"
      alignItems="center"
      justifyContent="spaceBetween"
    >
      {isExpanded ? title : null}
      <EuiFlexItem grow={false}>
        <EuiFlexGroup
          alignItems="center"
          gutterSize={isExpanded ? 'xs' : 'm'}
          justifyContent="spaceBetween"
          direction={isExpanded ? 'row' : 'columnReverse'}
        >
          <EuiFlexItem grow={false}>
            <PageSidebarTemplatePopover docked={!isExpanded} />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <PageSidebarThemePopover docked={!isExpanded} />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              className={classnames({
                canvasPageSidebar__button: true,
                'canvasPageSidebar__button--open': isExpanded,
              })}
              color="text"
              iconType={isExpanded ? 'menuLeft' : 'menuRight'}
              onClick={() => onToggle(!isExpanded)}
              aria-label="Toggle Page Sidebar"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
