/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useState } from 'react';
import { EuiButton, EuiIcon, EuiNotificationBadge, EuiButtonProps } from '@elastic/eui';

import { pluginServices } from '../../services';
import { ExperimentsFlyout, Props as FlyoutProps } from './experiments_flyout';

export type Props = EuiButtonProps & Pick<FlyoutProps, 'solutions'>;

export const ExperimentsButton = ({ solutions, ...props }: Props) => {
  const { experiments: experimentsService } = pluginServices.getHooks();
  const { getExperiments } = experimentsService.useService();
  const [isOpen, setIsOpen] = useState(false);

  const experiments = getExperiments();

  const [overrideCount, onEnabledCountChange] = useState(
    Object.values(experiments).filter((experiment) => experiment.status.isOverride).length
  );

  const onButtonClick = () => setIsOpen((open) => !open);
  const onClose = () => setIsOpen(false);

  return (
    <>
      <EuiButton {...props} onClick={onButtonClick} minWidth={0}>
        <EuiIcon type="beaker" />
        {overrideCount > 0 ? (
          <EuiNotificationBadge color="subdued" style={{ marginLeft: 2 }}>
            {overrideCount}
          </EuiNotificationBadge>
        ) : null}
      </EuiButton>
      {isOpen ? <ExperimentsFlyout {...{ onClose, solutions, onEnabledCountChange }} /> : null}
    </>
  );
};

// required for dynamic import using React.lazy()
// eslint-disable-next-line import/no-default-export
export default ExperimentsButton;
