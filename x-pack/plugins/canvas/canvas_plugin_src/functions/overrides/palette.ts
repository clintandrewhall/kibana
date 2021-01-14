/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  palette as chartsPaletteFn,
  defaultCustomColors,
} from '../../../../../../src/plugins/charts/public';

// @ts-expect-error untyped local
import { getState } from '../../../public/state/store';
import { getWorkpadPalette } from '../../../public/state/selectors/workpad';

const paletteFn = chartsPaletteFn();

paletteFn.fn = (input, args) => {
  const { color, reverse } = args;
  let { gradient } = args;
  let colors = ([] as string[]).concat(color || defaultCustomColors);

  if (!color) {
    const workpadPalette = getWorkpadPalette(getState());

    if (workpadPalette) {
      colors = workpadPalette.colors;
      gradient = workpadPalette.gradient;
    }
  }

  return {
    type: 'palette',
    name: 'custom',
    params: {
      colors: reverse ? colors.reverse() : colors,
      gradient,
    },
  };
};

export function palette() {
  return paletteFn;
}
