/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { EuiIcon } from '@elastic/eui';

export const Placeholder = () => {
  return (
    <div className="canvasPlaceholder">
      <EuiIcon className="canvasPlaceholder__icon" type="canvasApp" size="xl" color="ghost" />
    </div>
  );
};
