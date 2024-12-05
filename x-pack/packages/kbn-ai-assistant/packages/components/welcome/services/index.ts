/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

// We will expect this to expand significanlty as components are added.

import {
  type AddConnectorKibanaDependencies,
  AddConnectorKibanaProvider,
  AddConnectorProvider,
  type AddConnectorServices,
  _useAddConnectorButtonServices,
} from '@kbn/ai-assistant-components-add-connector';

/** @deprecated Used only for migration compatibility. */
export const _useWelcomeServices = _useAddConnectorButtonServices;

export type WelcomeKibanaDependencies = AddConnectorKibanaDependencies;
export type WelcomeServices = AddConnectorServices;

export const WelcomeServicesProvider = AddConnectorProvider;
export const WelcomeKibanaProvider = AddConnectorKibanaProvider;
