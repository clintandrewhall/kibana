/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { fromExpression, getType } from '@kbn/interpreter/common';
import { ExpressionValue, ExpressionAstExpression } from 'src/plugins/expressions/public';
import { notifyService, expressionsService } from '../services';
import { CanvasWorkpadTheme } from '../../types';

interface Options {
  castToRender?: boolean;
}

interface ContextOptions {
  variables: Record<string, any>;
  theme: CanvasWorkpadTheme;
}

/**
 * Meant to be a replacement for plugins/interpreter/interpretAST
 */
export async function interpretAst(
  ast: ExpressionAstExpression,
  contextOptions: ContextOptions
): Promise<ExpressionValue> {
  const { variables, theme = {} } = contextOptions;
  const context = { variables: { ...variables, theme } };
  return await expressionsService.getService().execute(ast, null, context).getData();
}

/**
 * Runs interpreter, usually in the browser
 *
 * @param {object} ast - Executable AST
 * @param {any} input - Initial input for AST execution
 * @param {object} contextOptions - variables and theme info passed to the context
 * @param {object} options
 * @param {boolean} options.castToRender - try to cast to a type: render object?
 * @returns {promise}
 */
export async function runInterpreter(
  ast: ExpressionAstExpression,
  input: ExpressionValue,
  contextOptions: ContextOptions,
  options: Options = {}
): Promise<ExpressionValue> {
  const { variables, theme = {} } = contextOptions;
  const context = { variables: { ...variables, theme } };

  try {
    const renderable = await expressionsService.getService().execute(ast, input, context).getData();

    if (getType(renderable) === 'render') {
      return renderable;
    }

    if (options.castToRender) {
      return runInterpreter(fromExpression('render'), renderable, contextOptions, {
        castToRender: false,
      });
    }

    throw new Error(`Ack! I don't know how to render a '${getType(renderable)}'`);
  } catch (err) {
    notifyService.getService().error(err);
    throw err;
  }
}
