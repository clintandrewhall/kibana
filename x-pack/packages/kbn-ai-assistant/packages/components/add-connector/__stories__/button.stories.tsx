/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { decorators } from './decorators';
import { AddConnectorButton as Component } from '../button';

export default {
  title: 'Add Connector/Button',
  component: Component,
  decorators,
} as ComponentMeta<typeof Component>;

export const Button: ComponentStory<typeof Component> = () => <Component />;
