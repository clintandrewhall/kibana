/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { type PropsWithChildren } from 'react';
import { EuiFlyoutHeader, type EuiFlyoutHeaderProps, EuiSpacer } from '@elastic/eui';

export type KibanaFlyoutHeaderProps = PropsWithChildren<Omit<EuiFlyoutHeaderProps, 'hasBorder'>>;

export const KibanaFlyoutHeader = ({ children, ...props }: KibanaFlyoutHeaderProps) => (
  <EuiFlyoutHeader hasBorder {...props}>
    {children}
    <EuiSpacer size="s" />
  </EuiFlyoutHeader>
);
