/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ExpressionFunctionDefinition, ExpressionValueRender } from 'src/plugins/expressions';
import { getFunctionHelp } from '../../../i18n';

export function placeholder(): ExpressionFunctionDefinition<
  'placeholder',
  void,
  {},
  ExpressionValueRender<{}>
> {
  const { help } = getFunctionHelp().placeholder;

  return {
    name: 'placeholder',
    aliases: [],
    type: 'render',
    help,
    args: {},
    fn: () => ({
      type: 'render',
      as: 'placeholder',
      value: {},
    }),
  };
}
