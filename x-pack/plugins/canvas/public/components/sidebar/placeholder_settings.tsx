/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC } from 'react';
import { ElementPosition } from '../../../types';

interface Props {
  position: ElementPosition;
}

export const PlaceholderSettings: FC<Props> = ({ position }) => {
  return <div />;
};
