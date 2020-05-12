/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// @ts-ignore Webpack-specific module.
import url from 'worker!../../workers/expressions.worker';

import { createUseContext } from '../../lib/create_use_context';

import {
  setExpression as setExpressionAction,
  setExpressionAst,
  setExpressionDebug,
  setExpressionError,
  setExpressionResult,
  setExpressionRunning,
  initialState,
  reducer,
} from './store';

const { Provider, useRead, useActions } = createUseContext(reducer, initialState, 'Expressions');

export const ExpressionsProvider = Provider;
export const useExpressions = useRead;

const expressionWorker = new Worker(url);
expressionWorker.postMessage({ type: 'getFunctions' });

export const useExpressionsActions = () => {
  const dispatch = useActions();

  expressionWorker.onmessage = event => {
    const { data } = event;

    if (data && data.type === 'evaluate') {
      const { ast, result, debug, error } = data.result;
      dispatch(setExpressionRunning(false));
      dispatch(setExpressionAst(ast));
      dispatch(setExpressionDebug(debug));
      dispatch(setExpressionError(error ? new Error(error) : null));
      dispatch(setExpressionResult(result));
    } else if (data && data.type === 'running') {
      dispatch(setExpressionRunning(true));
    } else {
      dispatch(setExpressionRunning(false));
    }
  };

  const setExpression = (value: string) => {
    dispatch(setExpressionAction(value));
    expressionWorker.postMessage({ type: 'evaluate', ast: value });
  };

  return {
    setExpression,
  };
};
