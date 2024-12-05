/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';

const root = css`
  height: 100%;
`;

const panel = css`
  text-align: center;
  max-width: 516px;
`;

export const useStyles = () => {
  const {
    euiTheme: { size },
  } = useEuiTheme();

  const prompt = css`
    margin-top: ${size.m};
    margin-bottom: ${size.s};
  `;

  return { panel, prompt, root };
};
