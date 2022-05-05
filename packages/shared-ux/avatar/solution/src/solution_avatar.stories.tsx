/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { KibanaLogoAvatar, KibanaLogoAvatarProps } from './logo_avatar';
import { KibanaAppAvatar, KibanaAppAvatarProps } from './app_avatar';

export default {
  title: 'Solution Avatar',
  description: 'A wrapper around EuiAvatar, specifically to stylize Elastic Solutions',
};

const argTypes = {
  size: {
    control: 'select',
    options: ['s', 'm', 'l', 'xl', 'xxl'],
    defaultValue: 'xxl',
  },
  name: {
    control: {
      type: 'text',
      defaultValue: '',
    },
  },
};

export const Logo = (params: Pick<KibanaLogoAvatarProps, 'size' | 'solution'>) => {
  return <KibanaLogoAvatar {...params} />;
};

Logo.argTypes = {
  solution: {
    control: 'select',
    options: ['Elastic', 'Kibana', 'Observability', 'Maps', 'Cloud', 'Security'],
    defaultValue: 'Kibana',
  },
  ...argTypes,
};

export const App = (params: Pick<KibanaAppAvatarProps, 'size' | 'app'>) => {
  return <KibanaAppAvatar {...params} />;
};

App.argTypes = {
  app: {
    control: 'select',
    options: ['security', 'console', 'agent', 'apm'],
    defaultValue: 'security',
  },
  ...argTypes,
};
