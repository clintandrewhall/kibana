/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { clone } from 'lodash';
import addons from '@storybook/addons';

// @ts-expect-error
import { routerProvider } from '../public/lib/router_provider';
// @ts-expect-error
import { routes } from '../public/apps/workpad';

// @ts-expect-error
import withReduxCore from 'addon-redux/withRedux'

// @ts-expect-error
import withReduxEnhancer from 'addon-redux/enhancer'

// @ts-expect-error
import { appReady } from '../public/state/middleware/app_ready';

// @ts-expect-error
import { resolvedArgs } from '../public/state/middleware/resolved_args';

// @ts-expect-error
import { getRootReducer } from '../public/state/reducers/';

import { getDefaultWorkpad } from '../public/state/defaults';
import { CanvasWorkpad } from '../types';

const initialState = {
    app: {}, // Kibana stuff in here
    assets: {}, // assets end up here
    transient: {
      canUserWrite: true,
      zoomScale: 1,
      elementStats: {
        total: 0,
        ready: 0,
        pending: 0,
        error: 0,
      },
      fullscreen: false,
      selectedToplevelNodes: [],
      resolvedArgs: {},
      refresh: {
        interval: 0,
      },
      autoplay: {
        enabled: false,
        interval: 10000,
      },
      // values in resolvedArgs should live under a unique index so they can be looked up.
      // The ID of the element is a great example.
      // In there will live an object with a status (string), value (any), and error (Error) property.
      // If the state is 'error', the error property will be the error object, the value will not change
      // See the resolved_args reducer for more information.
    },
    persistent: {
      schemaVersion: 2,
      workpad: getDefaultWorkpad(),
    },
  };


const middlewares = [
  applyMiddleware(
    thunkMiddleware,
    resolvedArgs,
    appReady,
  ),
];

const store = createStore(getRootReducer(initialState), initialState, compose(...middlewares, withReduxEnhancer));
routerProvider([{
  name: 'loadWorkpad',
  path: '/',
  action: () => {}
}]);
export const withRedux = (workpad: CanvasWorkpad = getDefaultWorkpad()) => {
  const state = clone(initialState);
  state.persistent.workpad = workpad;
  return withReduxCore(addons)({ Provider, store, state });
};
