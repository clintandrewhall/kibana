/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ElementFactory } from '../../../types';

export const text: ElementFactory = () => ({
  name: 'text',
  displayName: 'Text',
  type: 'text',
  help: 'A block of text',
  icon: 'text',
  expression: `text type="title" Title
| render`,
});
