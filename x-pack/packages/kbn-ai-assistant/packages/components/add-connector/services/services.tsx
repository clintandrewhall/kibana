/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { type ActionConnector } from '@kbn/alerts-ui-shared';
import React, { FC, PropsWithChildren, useContext } from 'react';

export interface AddConnectorServices {
  onAddConnector: () => void;
  onConnectorAdded: (connector: ActionConnector) => void;
}

const Context = React.createContext<AddConnectorServices | null>(null);

/**
 * A Context Provider that provides services to the component and its dependencies.
 */
export const AddConnectorProvider: FC<PropsWithChildren<AddConnectorServices>> = ({
  children,
  ...services
}) => {
  return <Context.Provider value={services}>{children}</Context.Provider>;
};

/**
 * React hook for accessing pre-wired services.
 */
export function useServices() {
  const context = useContext(Context);

  if (!context) {
    throw new Error(
      'Add Connector Services Context is missing.  Ensure your component or React root is wrapped with AddConnectorServicesProvider.'
    );
  }

  return context;
}
