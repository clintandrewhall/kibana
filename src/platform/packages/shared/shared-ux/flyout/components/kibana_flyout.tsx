/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { EuiFlyout, EuiFlyoutBody, EuiFlyoutProps } from '@elastic/eui';
import { KibanaFlyoutProvider, useKibanaFlyoutContext } from '../context';
import { KibanaFlyoutHeader } from './kibana_flyout_header';
import { KibanaFlyoutFooter } from './kibana_flyout_footer';

export interface KibanaFlyoutProps
  extends Omit<EuiFlyoutProps, 'hideCloseButton' | 'children' | 'size' | 'ownFocus'> {
  children: {
    header?: React.ReactNode;
    body?: React.ReactNode;
    footer?: React.ReactNode;
  };
  size: number; // TODO: clintandrewhall - talk to EUI about exporting calculation.
}

const KibanaFlyoutComponent = ({
  children: { header = null, body = null, footer = null },
  size,
  ...props
}: KibanaFlyoutProps) => {
  const Flyout = () => {
    const { right } = useKibanaFlyoutContext();
    return (
      <EuiFlyout {...{ size, ...props }} css={{ right }} ownFocus={false}>
        {header}
        {body}
        {footer}
      </EuiFlyout>
    );
  };

  return (
    <KibanaFlyoutProvider {...{ size }}>
      <Flyout />
    </KibanaFlyoutProvider>
  );
};

export const KibanaFlyout = Object.assign(KibanaFlyoutComponent, {
  Header: KibanaFlyoutHeader,
  Body: EuiFlyoutBody,
  Footer: KibanaFlyoutFooter,
});
