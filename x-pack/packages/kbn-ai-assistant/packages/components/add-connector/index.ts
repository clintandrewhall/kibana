/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useServices } from './services';

export { AddConnectorButton } from './button';
export {
  type AddConnectorServices,
  AddConnectorProvider,
  type AddConnectorKibanaDependencies,
  AddConnectorKibanaProvider,
  /** @deprecated Used only for migration compatibility. */
  useServices as _useAddConnectorButtonServices,
} from './services';

export const useAddConnectorEvents = () => {
  const { onAddConnector, onConnectorAdded } = useServices();
  return { onAddConnector, onConnectorAdded };
};
