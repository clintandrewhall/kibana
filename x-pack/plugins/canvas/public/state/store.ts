/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { configureStore, EnhancedStore, AnyAction } from '@reduxjs/toolkit';
import { isPlainObject } from 'lodash';

import { State } from '../../types';

// @ts-expect-error Untyped local
import { middlewares } from './middleware';
// @ts-expect-error Untyped local
import { getRootReducer } from './reducers';

let store: EnhancedStore<State, AnyAction, any> | undefined;

export function getStore() {
  return store;
}

export function cloneStore() {
  if (!store) {
    throw new Error('Redux store has not been created yet.');
  }

  const state = store.getState();
  store = undefined;

  return createStore(state);
}

export function createStore(initialState: State) {
  if (typeof store !== 'undefined') {
    throw new Error('Redux store can only be initialized once');
  }

  if (!isPlainObject(initialState)) {
    throw new Error('Initial state must be a plain object');
  }

  store = configureStore({
    reducer: getRootReducer(initialState),
    preloadedState: initialState,
    middleware: middlewares,
  });

  return store;
}

// export type RootState = ReturnType<typeof store.getState>;

export function destroyStore() {
  if (store) {
    // Replace reducer so that anything that gets fired after navigating away doesn't really do anything
    // @ts-expect-error TODO: check if this is still relevant
    store.replaceReducer((state) => state);
  }
  store = undefined;
}

export function getState() {
  if (!store) {
    throw new Error('Redux store has not been created yet.');
  }
  return store.getState();
}
