/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import ReactDOM from 'react-dom';
import React from 'react';
import { RendererFactory } from '../../types';
import { Placeholder } from '../../public/components/placeholder';

export const placeholder: RendererFactory<{}> = () => ({
  name: 'placeholder',
  displayName: 'Placeholder',
  help: 'Reserves a space on a workpad page for an element.',
  reuseDomNode: true,
  render(domNode, {}, handlers) {
    ReactDOM.render(<Placeholder />, domNode, () => handlers.done());
    handlers.onDestroy(() => ReactDOM.unmountComponentAtNode(domNode));
  },
});
