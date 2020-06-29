/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { EuiFlexGroup, EuiFlexItem, EuiButtonIcon, EuiText } from '@elastic/eui';

import { ComponentStrings } from '../../../../i18n';

const { Toolbar: strings } = ComponentStrings;

interface Props {
  workpadId: string;
  selectedPage: number;
  totalPages: number;
}

export const PageSidebarPager: FC<Props> = (
  { workpadId, selectedPage, totalPages },
  { router }
) => {
  const nextPage = () => {
    const pageNumber = Math.min(selectedPage + 1, totalPages);
    router.navigateTo('loadWorkpad', { id: workpadId, page: pageNumber });
  };

  const previousPage = () => {
    const pageNumber = Math.max(1, selectedPage - 1);
    router.navigateTo('loadWorkpad', { id: workpadId, page: pageNumber });
  };

  return (
    <EuiFlexGroup alignItems="center" justifyContent="center">
      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          color="text"
          onClick={previousPage}
          iconType="arrowLeft"
          disabled={selectedPage <= 1}
          aria-label={strings.getPreviousPageAriaLabel()}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiText>{strings.getPageButtonLabel(selectedPage, totalPages)}</EuiText>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          color="text"
          onClick={nextPage}
          iconType="arrowRight"
          disabled={selectedPage >= totalPages}
          aria-label={strings.getNextPageAriaLabel()}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

PageSidebarPager.contextTypes = {
  router: PropTypes.object,
};
