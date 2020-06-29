/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC, ReactEventHandler } from 'react';
import PropTypes from 'prop-types';
import { EuiFlexGroup, EuiFlexItem, EuiButtonIcon, EuiToolTip } from '@elastic/eui';

import { CanvasPage } from '../../../../types';
import { ComponentStrings } from '../../../../i18n';

const { PagePreviewPageControls: strings } = ComponentStrings;

interface Props {
  page: Pick<CanvasPage, 'id'>;
  onDelete: (pageId: string) => void;
  onDuplicate: (pageId: string) => void;
}

export const PageSidebarPreviewControls: FC<Props> = ({ page, onDelete, onDuplicate }) => {
  const handleDuplicate: ReactEventHandler = (ev) => {
    ev.preventDefault();
    onDuplicate(page.id);
  };

  const handleDelete: ReactEventHandler = (ev) => {
    ev.preventDefault();
    onDelete(page.id);
  };

  return (
    <EuiFlexGroup
      className="canvasPageSidebar__previewControls"
      gutterSize="xs"
      justifyContent="spaceBetween"
    >
      <EuiFlexItem grow={false}>
        <EuiToolTip content={strings.getClonePageTooltip()}>
          <EuiButtonIcon
            iconType="copy"
            aria-label={strings.getClonePageAriaLabel()}
            onClick={handleDuplicate}
          />
        </EuiToolTip>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiToolTip content={strings.getDeletePageTooltip()}>
          <EuiButtonIcon
            color="danger"
            iconType="trash"
            aria-label={strings.getDeletePageAriaLabel()}
            onClick={handleDelete}
          />
        </EuiToolTip>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

PageSidebarPreviewControls.propTypes = {
  page: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  onDelete: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
};
