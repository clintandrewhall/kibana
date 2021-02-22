/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ExpressionFunction } from 'src/plugins/expressions';

export interface AppState {
  basePath: string;
  serverFunctions: ExpressionFunction[];
  ready: Error | boolean;
}

export const getInitialAppState = (): AppState => ({
  basePath: '',
  serverFunctions: [],
  ready: false,
});
