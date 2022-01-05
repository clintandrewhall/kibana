/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC, createContext, useContext } from 'react';
import { SharedUXPlatformService } from './platform';
import { servicesFactory } from './stub';

export interface SharedUXServices {
  platform: SharedUXPlatformService;
}

const ServicesContext = createContext<SharedUXServices>(servicesFactory());

export const ServicesProvider: FC<SharedUXServices> = ({ children, ...services }) => (
  <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>
);

export function useServices() {
  return useContext(ServicesContext);
}

export const usePlatformService = () => useServices().platform;
