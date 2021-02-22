/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { State, TransientState, PersistentState } from '../../types';
import { platformService } from '../services';
import { getDefaultWorkpad } from './defaults';
import { getInitialAppState, getInitialAssetsState } from '../features';

export { getInitialAppState, getInitialAssetsState } from '../features';

export const getInitialTransientState = (): TransientState => {
  const { getHasWriteAccess } = platformService.getService();

  return {
    canUserWrite: getHasWriteAccess(),
    zoomScale: 1,
    elementStats: {
      total: 0,
      ready: 0,
      pending: 0,
      error: 0,
    },
    fullScreen: false,
    inFlight: false,
    selectedToplevelNodes: [],

    // values in resolvedArgs should live under a unique index so they can be looked up.
    // The ID of the element is a great example.
    // In there will live an object with a status (string), value (any), and error (Error) property.
    // If the state is 'error', the error property will be the error object, the value will not change
    // See the resolved_args reducer for more information.
    resolvedArgs: {},

    refresh: {
      interval: 0,
    },
    autoplay: {
      enabled: false,
      interval: 10000,
    },
  };
};

export const getInitialPersistentState = (): PersistentState => ({
  schemaVersion: 2,
  workpad: getDefaultWorkpad(),
});

export const getInitialState = (): State => ({
  app: getInitialAppState(),
  assets: getInitialAssetsState(),
  transient: getInitialTransientState(),
  persistent: getInitialPersistentState(),
});
