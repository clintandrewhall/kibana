/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { ExpressionFunction } from 'src/plugins/expressions';
import {
  createStore as createReduxStore,
  destroyStore as destroy,
  getStore,
  cloneStore,
} from './state/store';
import { getInitialState } from './state/initial_state';

import { CoreSetup } from '../../../../src/core/public';
import { API_ROUTE_FUNCTIONS } from '../common/lib/constants';

export async function createStore(core: CoreSetup) {
  if (getStore()) {
    return cloneStore();
  }

  return createFreshStore(core);
}

export async function createFreshStore(core: CoreSetup) {
  const initialState = getInitialState();

  const basePath = core.http.basePath.get();

  // Retrieve server functions
  const serverFunctionsResponse = await core.http.get(API_ROUTE_FUNCTIONS);
  const serverFunctions = Object.values<ExpressionFunction>(serverFunctionsResponse);

  initialState.app = {
    basePath,
    serverFunctions,
    ready: false,
  };

  return createReduxStore(initialState);
}

export function destroyStore() {
  destroy();
}
