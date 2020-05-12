/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import 'regenerator-runtime/runtime';

import { fromExpression } from '@kbn/interpreter/target/common';
import { getExpressionsService } from '../lib/expressions';
import { getFunctions } from '../lib/functions';

const ctx: Worker = self as any;
const expressionsService = getExpressionsService(getFunctions());

type Type = 'evaluate' | 'getFunctions' | 'getState';

interface Message {
  type: Type;
}

export interface EvaluateMessage extends Message {
  type: 'evaluate';
  ast: string;
}

// TODO: handle cancel if another message comes in?
const handleEvaluate = async (value: string) => {
  let ast = null;
  let result = null;
  let error = null;
  let debug = null;

  try {
    ast = fromExpression(value);
  } catch (e) {
    error = e;
  }

  if (ast) {
    try {
      const execution = expressionsService.getExecution(ast);
      result = await execution.result;
      debug = execution.state.get().ast.chain;
    } catch (e) {
      error = e;
    }
  }

  return {
    ast,
    result,
    error: error ? error.message : null,
    debug,
  };
};

const post = (message: any) => ctx.postMessage(JSON.parse(JSON.stringify(message)));

// Respond to message from parent thread
ctx.addEventListener('message', async event => {
  const value = event.data as Message;
  const { type } = value;

  switch (type) {
    case 'evaluate':
      post({ type: 'running', result: { type } });
      const result = await handleEvaluate((value as EvaluateMessage).ast);
      post({ type, result });
      break;
    case 'getFunctions':
      post({
        type,
        result: getFunctions().map(fn => ({
          name: fn.name,
          help: fn.help,
        })),
      });
      break;
    default:
      post(null);
  }
});
