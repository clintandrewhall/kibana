/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { DecoratorFn } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { AddConnectorProvider } from '../services';

export const decorators: DecoratorFn[] = [
  (Story) => (
    <AddConnectorProvider
      onAddConnector={action('onAddConnector')}
      onConnectorAdded={action('onConnectorAdded')}
    >
      <Story />
    </AddConnectorProvider>
  ),
];
