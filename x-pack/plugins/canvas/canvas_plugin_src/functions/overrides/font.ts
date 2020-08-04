/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { clone } from 'lodash';
import { font as expressionsFontFn } from '../../../../../../src/plugins/expressions/common';
// @ts-expect-error untyped local
import { getState } from '../../../public/state/store';
import { getWorkpadFontFamily } from '../../../public/state/selectors/workpad';

const fontFn = clone(expressionsFontFn);

fontFn.fn = (input, args, context) => {
  let { defaultedArgs } = context;

  if (defaultedArgs.includes('family')) {
    const workpadFont = getWorkpadFontFamily(getState());
    if (workpadFont) {
      args.family = workpadFont.label;
      defaultedArgs = defaultedArgs.filter((arg) => arg !== 'family');
    }
  }

  return expressionsFontFn.fn(input, args, context);
};

export function font() {
  return fontFn;
}
