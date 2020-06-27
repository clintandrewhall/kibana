/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { CanvasPage } from '../../../../types';
import { PagePreview } from '../page_preview';

const page: CanvasPage = {
  elements: [],
  groups: [],
  id: 'abc123',
  style: {
    background: '#FFF',
  },
  transition: {},
};

storiesOf('components/PagePreview', module).add('default', () => (
  <PagePreview
    page={page}
    isWriteable={true}
    height={300}
    duplicatePage={action('duplicatePage')}
    confirmDelete={action('confirmDelete')}
  />
));
