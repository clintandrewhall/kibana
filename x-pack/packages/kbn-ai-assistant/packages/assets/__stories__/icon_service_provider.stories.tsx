/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { getServiceProviderIds } from '@kbn/ai-assistant-service-providers';
import { ServiceProviderIcon as Component } from '../icon';

export default {
  title: 'Assets/Icon/Service Provider',
  component: Component,
  argTypes: {
    size: {
      control: 'select',
      options: ['original', 's', 'm', 'l', 'xl', 'xxl'],
      defaultValue: 'l',
    },
    id: {
      control: 'select',
      options: getServiceProviderIds(),
      defaultValue: 'openai',
    },
  },
} as ComponentMeta<typeof Component>;

export const ServiceProvider: ComponentStory<typeof Component> = (args) => <Component {...args} />;
