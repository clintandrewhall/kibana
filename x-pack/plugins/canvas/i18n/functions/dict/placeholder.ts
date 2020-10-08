/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';
import { placeholder } from '../../../canvas_plugin_src/functions/common/placeholder';
import { FunctionHelp } from '../function_help';
import { FunctionFactory } from '../../../types';

export const help: FunctionHelp<FunctionFactory<typeof placeholder>> = {
  help: i18n.translate('xpack.canvas.functions.placeholderHelpText', {
    defaultMessage: 'Reserves a space on a workpad page for an element.',
  }),
  args: {},
};
