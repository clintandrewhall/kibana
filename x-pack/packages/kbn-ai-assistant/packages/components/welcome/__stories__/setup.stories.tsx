/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { decorators } from './decorators';
import { Welcome } from '../welcome';

export default {
  title: 'Welcome/Setup',
  component: Welcome.Setup,
  decorators,
} as ComponentMeta<typeof Welcome.Setup>;

export const Setup: ComponentStory<typeof Welcome.Setup> = () => <Welcome.Setup />;
