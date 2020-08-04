/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { PageSidebar } from '../';
import { reduxDecorator } from '../../../../storybook';
import { getDefaultPage } from '../../../state/defaults';

storiesOf('components/PageSidebar', module)
  .addDecorator(reduxDecorator({ pages: [getDefaultPage(), getDefaultPage(), getDefaultPage()] }))
  .addDecorator((fn: Function) => (
    <div
      style={{
        minHeight: '300px',
        display: 'flex',
        alignItems: 'stretch',
        flexGrow: 1,
      }}
    >
      {fn()}
    </div>
  ))
  .add('default', () => <PageSidebar isExpanded={false} onToggle={action('onToggle')} />);
