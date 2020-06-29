/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC, useState } from 'react';

import {
  EuiPopover,
  EuiToolTip,
  EuiButtonIcon,
  EuiListGroup,
  EuiListGroupItem,
} from '@elastic/eui';

interface Props {
  onTogglePageSidebar: () => void;
  onToggleConfigSidebar: () => void;
  showPageSidebar: boolean;
  showConfigSidebar: boolean;
}

export const SidebarMenu: FC<Props> = ({
  onToggleConfigSidebar,
  onTogglePageSidebar,
  showConfigSidebar,
  showPageSidebar,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onButtonClick = () => setIsPopoverOpen(() => !isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

  let button = (
    <EuiButtonIcon
      color="primary"
      iconType="tableOfContents"
      onClick={onButtonClick}
      aria-label="Add page"
    />
  );

  if (!isPopoverOpen) {
    button = (
      <EuiToolTip position="bottom" content={<span>Toggle sidebars</span>}>
        {button}
      </EuiToolTip>
    );
  }

  return (
    <EuiPopover
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      anchorPosition="downLeft"
      panelPaddingSize="s"
    >
      <EuiListGroup flush={true}>
        <EuiListGroupItem
          onClick={() => {
            onTogglePageSidebar();
            closePopover();
          }}
          label="Page Sidebar"
          iconType={showPageSidebar ? 'check' : 'empty'}
        />
        <EuiListGroupItem
          onClick={() => {
            onToggleConfigSidebar();
            closePopover();
          }}
          label="Configuration Sidebar"
          iconType={showConfigSidebar ? 'check' : 'empty'}
        />
      </EuiListGroup>
    </EuiPopover>
  );
};
