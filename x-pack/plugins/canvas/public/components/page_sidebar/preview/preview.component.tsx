/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable @typescript-eslint/naming-convention */

import React, { FC } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { EuiPanel, EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';
// @ts-expect-error untyped dependency
import Style from 'style-it';

import { Link } from '../../link';
import { DomPreview } from '../../dom_preview';
import { PageSidebarPreviewControls } from './preview_controls';

import { CanvasPage } from '../../../../types';
import { ComponentStrings } from '../../../../i18n';

const { PageManager: strings } = ComponentStrings;

const WIDTH = 214;

interface Props {
  isWriteable: boolean;
  isSelected: boolean;
  pageNumber: number;
  page: Pick<CanvasPage, 'id' | 'style'>;
  workpadId: string;
  workpadCSS: string;
}

export const PageSidebarPreview: FC<Props> = ({
  pageNumber,
  workpadId,
  isWriteable,
  isSelected,
  page,
  workpadCSS,
}) => (
  <EuiFlexGroup
    gutterSize="none"
    className={classnames({
      canvasPageSidebar__preview: true,
      canvasPageSidebar__previewSelected: isSelected,
    })}
  >
    <EuiFlexItem grow={false}>
      <EuiText size="xs" className="canvasPageSidebar__pageNumber">
        {pageNumber}
      </EuiText>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiPanel paddingSize="none" style={{ backgroundColor: page.style.background }}>
        <Link
          name="loadWorkpad"
          params={{ id: workpadId, page: pageNumber }}
          aria-label={strings.getPageNumberAriaLabel(pageNumber)}
          // @ts-expect-error
          href="#"
        >
          {Style.it(workpadCSS, <DomPreview elementId={page.id} width={WIDTH} />)}
        </Link>
        {isWriteable && <PageSidebarPreviewControls page={page} />}
      </EuiPanel>
    </EuiFlexItem>
  </EuiFlexGroup>
);

PageSidebarPreview.propTypes = {
  isWriteable: PropTypes.bool.isRequired,
  page: PropTypes.shape({
    id: PropTypes.string.isRequired,
    style: PropTypes.shape({
      background: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  workpadId: PropTypes.string.isRequired,
  workpadCSS: PropTypes.string.isRequired,
  pageNumber: PropTypes.number.isRequired,
};
