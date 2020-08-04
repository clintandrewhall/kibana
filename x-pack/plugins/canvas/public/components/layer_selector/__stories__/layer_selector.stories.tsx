/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { reduxDecorator, getAddonPanelParameters } from '../../../../storybook';

import { state } from './fixtures';
import { LayerSelector } from '../layer_selector';

storiesOf('components/LayerSelector', module)
  .addDecorator(
    reduxDecorator({
      state,
    })
  )
  .addDecorator((story) => <div style={{ textAlign: 'center' }}>{story()}</div>)
  .addParameters(getAddonPanelParameters())
  .add('redux', () => (
    <LayerSelector
      onSelectWorkpad={action('onSelectWorkpad')}
      onSelectNode={action('onSelectNode')}
      onAddItem={action('onAddItem')}
      onHoverNode={action('onHoverNode')}
    />
  ));
