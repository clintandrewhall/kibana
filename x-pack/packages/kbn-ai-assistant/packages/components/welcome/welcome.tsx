/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { Setup } from './setup';
import { Disclaimer } from './disclaimer';

// This component is currently empty, as we'll be replacing portions of existing components
// with components that comprise this one.  Eventually, it will render the entire Welcome
// experience.
const Component = () => {
  return <></>;
};

export const Welcome = Object.assign(Component, {
  Setup,
  Disclaimer,
});
