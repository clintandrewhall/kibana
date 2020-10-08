/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

export const placeholder = () => ({
  name: 'placeholder',
  displayName: 'Placeholder',
  help: 'Reserves a space on a workpad page for an element.',
  modelArgs: [],
  requiresContext: false,
  args: [
    {
      name: '_',
      argType: 'placeholder',
    },
  ],
});
