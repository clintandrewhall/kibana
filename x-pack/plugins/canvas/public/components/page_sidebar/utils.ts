/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// TODO: these shouldn't be here, they're copied wholesale from EUI.  This should be
// exported.  CLINT: open an issue.

// Given an array of objects with key value pairs stop/color returns a css linear-gradient
// Or given an array of hex colors returns a css linear-gradient
export const getLinearGradient = (palette: string[]) => {
  const intervals = palette.length;

  let linearGradient = `linear-gradient(to right, ${palette[0]} 0%,`;

  for (let i = 1; i < intervals - 1; i++) {
    linearGradient = `${linearGradient} ${palette[i]}\ ${Math.floor(
      (100 * i) / (intervals - 1)
    )}%,`;
  }

  const linearGradientStyle = `${linearGradient} ${palette[palette.length - 1]} 100%)`;

  return linearGradientStyle;
};

// Given an array of hex colors returns a css linear-gradient with individual color blocks
export const getFixedLinearGradient = (palette: string[]) => {
  const intervals = palette.length;

  let fixedLinearGradient;

  for (let i = 0; i < intervals; i++) {
    const initialColorStop = `${palette[0]} 0%, ${palette[0]}\ ${Math.floor(
      (100 * 1) / intervals
    )}%`;
    const colorStop = `${palette[i]}\ ${Math.floor((100 * i) / intervals)}%, ${
      palette[i]
    }\ ${Math.floor((100 * (i + 1)) / intervals)}%`;

    if (i === 0) {
      fixedLinearGradient = `linear-gradient(to right, ${initialColorStop},`;
    } else if (i === palette.length - 1) {
      fixedLinearGradient = `${fixedLinearGradient} ${colorStop})`;
    } else {
      fixedLinearGradient = `${fixedLinearGradient} ${colorStop},`;
    }
  }

  return fixedLinearGradient;
};
