/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC } from 'react';

// @ts-expect-error untyped local
import { Expression } from '../expression';

interface Props {
  isVisible: boolean;
  onClose: Expression['done'];
}

export const ExpressionPanel: FC<Props> = ({ onClose, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="canvasExpressionPanel">
      <Expression done={onClose} />
    </div>
  );
};
