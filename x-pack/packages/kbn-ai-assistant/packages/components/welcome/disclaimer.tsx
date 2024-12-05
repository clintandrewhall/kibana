/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiText, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import { DISCLAIMER } from './welcome.i18n';

export const Disclaimer = () => {
  const {
    euiTheme: {
      colors: { textDisabled },
    },
  } = useEuiTheme();

  const color = css`
    color: ${textDisabled};
  `;

  return (
    <EuiText css={color} size="xs" textAlign="center" data-test-subj="disclaimer">
      {DISCLAIMER}
    </EuiText>
  );
};
