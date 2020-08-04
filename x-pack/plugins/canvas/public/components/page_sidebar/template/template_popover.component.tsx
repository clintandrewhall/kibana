/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC, useState } from 'react';

import { EuiPopover, EuiToolTip, EuiButtonIcon } from '@elastic/eui';
import { templates } from './templates';
import { CanvasPage } from '../../../../types';

interface Props {
  onAddPage: (page?: CanvasPage) => void;
  docked?: boolean;
}

export const PageSidebarTemplatePopover: FC<Props> = ({ onAddPage, docked = false }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onButtonClick = () => setIsPopoverOpen(() => !isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

  let button = (
    <EuiButtonIcon
      color="text"
      iconType="plusInCircle"
      onClick={onButtonClick}
      aria-label="Add page"
    />
  );

  if (!isPopoverOpen) {
    button = (
      <EuiToolTip position="bottom" content={<span>Add page</span>}>
        {button}
      </EuiToolTip>
    );
  }

  const width = 200;
  const scale = width / 1080;
  const height = scale * 720;

  const previews = templates.map((template, index) => {
    return (
      <div
        key={'preview_' + index}
        style={{ marginTop: index === 0 ? '0' : '16px' }}
        onClick={() => {
          onAddPage(template().page);
          closePopover();
        }}
      >
        <div style={{ width, height }}>
          <div
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
            // eslint-disable-next-line
            dangerouslySetInnerHTML={{ __html: template().preview }}
          />
        </div>
      </div>
    );
  });

  return (
    <EuiPopover
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      anchorPosition={docked ? 'rightUp' : 'downLeft'}
    >
      <div style={{ minWidth: width, scale: 0.0925 }}>{previews}</div>
    </EuiPopover>
  );
};
