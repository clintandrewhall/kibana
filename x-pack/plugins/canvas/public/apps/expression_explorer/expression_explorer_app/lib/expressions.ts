/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ExpressionAstExpression } from 'src/plugins/expressions/common/ast/types';
import { ExpressionRenderer } from 'src/plugins/expressions/common';

import { Execution } from 'src/plugins/expressions/common/execution/execution';
import { ExpressionFunction } from 'src/plugins/expressions/common/expression_functions/expression_function';
import { ExpressionsService } from 'src/plugins/expressions/common/service/expressions_services';
import { ExpressionRenderDefinition } from 'src/plugins/expressions/common/expression_renderers/types';

import { CanvasFunction } from '../../../../../types';

let expressionsService: ExpressionsService | null = null;

export const getExpressionsService = (
  functionDefinitions: CanvasFunction[] = [],
  rendererDefinitions: ExpressionRenderDefinition[] = []
): {
  getExecution: (ast: ExpressionAstExpression) => Execution;
  getFunctions: () => Record<string, ExpressionFunction>;
  getRenderers: () => Record<string, ExpressionRenderer>;
} => {
  if (!expressionsService) {
    expressionsService = new ExpressionsService();
    const { registerFunction, registerRenderer } = expressionsService;
    functionDefinitions.forEach(fn => registerFunction(fn));
    rendererDefinitions.forEach(fn => registerRenderer(fn));
  }

  return {
    getExecution: ast => {
      if (!expressionsService) {
        throw new Error("expressionsService should exist, but it doesn't");
      }

      const execution = expressionsService.executor.createExecution(
        ast,
        { type: null },
        { debug: true }
      );
      execution.start();
      return execution;
    },
    getFunctions: () => {
      if (!expressionsService) {
        throw new Error("expressionsService should exist, but it doesn't");
      }
      return expressionsService.getFunctions();
    },
    getRenderers: () => {
      if (!expressionsService) {
        throw new Error("expressionsService should exist, but it doesn't");
      }
      return expressionsService.getRenderers();
    },
  };
};
