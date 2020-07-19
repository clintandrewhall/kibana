/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { WorkpadConfig } from '../';
import { WorkpadCSSComponent } from '../workpad_css';
import { WorkpadSizeComponent } from '../workpad_size';
import { withCanvas, getAddonPanelParameters } from '../../../../storybook';

storiesOf('components/WorkpadConfig', module)
  .addDecorator(withCanvas())
  .addParameters(getAddonPanelParameters())
  .addDecorator((story) => <div style={{ width: 325, overflow: 'hidden' }}>{story()}</div>)
  .add('redux', () => <WorkpadConfig />)
  .add('WorkpadCSS Component', () => (
    <WorkpadCSSComponent setWorkpadCSS={action('setWorkpadCSS')} />
  ))
  .add('WorkpadSize Component', () => (
    <WorkpadSizeComponent setSize={action('setSize')} size={{ height: 600, width: 800 }} />
  ));
