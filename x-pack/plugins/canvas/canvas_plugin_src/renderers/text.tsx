/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import ReactDOM from 'react-dom';
import React from 'react';
import { RendererStrings } from '../../i18n';
import { RendererFactory } from '../../types';
import { TextType } from '../functions/common/text';

const { text: strings } = RendererStrings;

const typeToClassname: Record<TextType, string> = {
  body: 'canvasTextBody',
  heading_1: 'canvasTextH3',
  heading_2: 'canvasTextH4',
  heading_3: 'canvasTextH5',
  quote: 'canvasTextQuote',
  subtitle: 'canvasTextH2',
  title: 'canvasTextH1',
};

export const text: RendererFactory<{ text: string; type: TextType | null }> = () => ({
  name: 'text',
  displayName: strings.getDisplayName(),
  help: strings.getHelpDescription(),
  reuseDomNode: true,
  render(domNode, { text: textString, type = null }, handlers) {
    const className = type !== null ? typeToClassname[type] : '';
    ReactDOM.render(<div {...{ className }}>{textString}</div>, domNode, () => handlers.done());
    handlers.onDestroy(() => ReactDOM.unmountComponentAtNode(domNode));
  },
});
