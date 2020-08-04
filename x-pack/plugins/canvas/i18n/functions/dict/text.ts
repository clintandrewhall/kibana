/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';
import { text } from '../../../canvas_plugin_src/functions/common/text';
import { FunctionHelp } from '../function_help';
import { FunctionFactory } from '../../../types';
import { CSS } from '../../constants';

export const help: FunctionHelp<FunctionFactory<typeof text>> = {
  help: i18n.translate('xpack.canvas.functions.textHelpText', {
    defaultMessage: 'Adds an element that renders text in a single style.',
  }),
  args: {
    content: i18n.translate('xpack.canvas.functions.text.args.contentHelpText', {
      defaultMessage: 'A string of text.',
    }),
    font: i18n.translate('xpack.canvas.functions.text.args.fontHelpText', {
      defaultMessage:
        'The {CSS} font properties for the content. For example, {fontFamily} or {fontWeight}.',
      values: {
        CSS,
        fontFamily: 'font-family',
        fontWeight: 'font-weight',
      },
    }),
    type: i18n.translate('xpack.canvas.functions.text.args.typeHelpText', {
      defaultMessage: 'The type of text to render',
    }),
  },
};
