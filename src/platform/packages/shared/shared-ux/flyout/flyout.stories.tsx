/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useEffect, useState } from 'react';
import { Meta } from '@storybook/react';
import { EuiButton } from '@elastic/eui';
import { KibanaFlyout as KibanaFlyoutComponent } from './components';

export default {
  title: 'Flyout/Kibana Flyout',
  description: 'A potentially nested flyout.',
  parameters: {},
} as Meta<typeof KibanaFlyoutComponent>;

export const KibanaFlyout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChildOpen, setIsChildOpen] = useState(false);

  const childFlyout = (
    <KibanaFlyoutComponent
      size={300}
      onClose={() => {
        setIsChildOpen(false);
      }}
    >
      {{
        header: <KibanaFlyoutComponent.Header>Child Flyout</KibanaFlyoutComponent.Header>,
        body: (
          <KibanaFlyoutComponent.Body>
            <p>This is a child flyout.</p>
            <p>You can put any content here.</p>
          </KibanaFlyoutComponent.Body>
        ),
      }}
    </KibanaFlyoutComponent>
  );

  const flyout = (
    <KibanaFlyoutComponent
      size={300}
      onClose={() => {
        setIsOpen(false);
      }}
    >
      {{
        header: <KibanaFlyoutComponent.Header>Test</KibanaFlyoutComponent.Header>,
        body: (
          <KibanaFlyoutComponent.Body>
            <p>This is a test flyout.</p>
            <p>You can put any content here.</p>
            <EuiButton onClick={() => setIsChildOpen(!isChildOpen)}>Open Child</EuiButton>
            {isChildOpen && childFlyout}
          </KibanaFlyoutComponent.Body>
        ),
      }}
    </KibanaFlyoutComponent>
  );

  useEffect(() => {
    if (!isOpen) {
      setIsChildOpen(false); // Close child flyout when parent is closed
    }
  }, [isOpen]);

  return (
    <>
      <EuiButton onClick={() => setIsOpen(true)}>Open Flyout</EuiButton>
      {isOpen && flyout}
    </>
  );
};
