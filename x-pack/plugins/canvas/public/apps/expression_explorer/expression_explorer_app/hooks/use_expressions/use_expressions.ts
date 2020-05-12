/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import url from 'worker!../../workers/expressions.worker.ts';

import { createUseContext } from '../../lib/create_use_context';

import {
  setExpression as setExpressionAction,
  setExpressionAst,
  setExpressionDebug,
  setExpressionError,
  setExpressionResult,
  initialState,
  reducer,
} from './store';

const { Provider, useRead, useActions } = createUseContext(reducer, initialState, 'Expressions');

export const ExpressionsProvider = Provider;
export const useExpressions = useRead;

const expressionWorker = new Worker(url);

export const useExpressionsActions = () => {
  const dispatch = useActions();

  expressionWorker.onmessage = event => {
    console.log(event.data);
    const { ast, result, debug, error } = event.data;
    dispatch(setExpressionAst(ast));
    dispatch(setExpressionDebug(debug));
    dispatch(setExpressionError(error));
    dispatch(setExpressionResult(result));
  };

  const setExpression = (value: string) => {
    dispatch(setExpressionAction(value));
    expressionWorker.postMessage(value);
  };

  return {
    setExpression,
  };
};
