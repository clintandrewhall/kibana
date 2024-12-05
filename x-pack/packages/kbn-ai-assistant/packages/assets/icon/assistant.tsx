/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiIcon, EuiIconProps } from '@elastic/eui';

import icon from '!!raw-loader!./assistant.svg';

export type AssistantIconProps = Omit<EuiIconProps, 'type'>;

const type = `data:image/svg+xml;base64,${btoa(icon)}`;

/**
 * Default Elastic AI Assistant avatar
 *
 * TODO: Can be removed once added to EUI.
 */
export const AssistantIcon = ({ size = 'xxl', ...rest }: AssistantIconProps) => (
  <EuiIcon {...{ type, size, ...rest }} />
);
