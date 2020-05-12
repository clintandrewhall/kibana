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

// Respond to message from parent thread
ctx.addEventListener('message', async event => {
  const value = event.data;

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

  const message = {
    ast,
    result,
    error,
    debug,
  };

  ctx.postMessage(JSON.parse(JSON.stringify(message)));
});

// ctx.onmessage = e => {
//   const message = e.data;
//   console.log(`[From Main]: ${message}`);
// };

// ctx.onerror = error => {
//   console.log('error', error);
// };

// console.log('ctx', ctx);
