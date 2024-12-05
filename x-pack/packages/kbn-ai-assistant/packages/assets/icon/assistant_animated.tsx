/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { AssistantIcon } from './assistant';
import { useStyles, type UseStylesParams } from './assistant_animated.styles';

export type AssistantAnimatedIconProps = UseStylesParams;

export const AssistantAnimatedIcon = ({
  backgroundColor,
  size = 'xxl',
}: AssistantAnimatedIconProps) => {
  const { root, rings } = useStyles({ backgroundColor, size });

  return (
    <div css={root}>
      <AssistantIcon {...{ size }} />
      <span css={rings} />
    </div>
  );
};

AssistantAnimatedIcon.displayName = 'AssistantAnimatedIcon';
