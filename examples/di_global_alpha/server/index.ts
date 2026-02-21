/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { ContainerModule } from 'inversify';
import { Start } from '@kbn/core-di';
import { Global } from '@kbn/core-di-internal';
import { Route } from '@kbn/core-di-server';
import { AlphaServiceToken, type IAlphaService } from '@kbn/di-global-alpha-types';
import { AlphaRoute } from './route';
import { DiGlobalAlphaPlugin } from './plugin';

/**
 * Classic plugin factory.  The classic `start()` returns the
 * {@link IAlphaService} contract.
 */
export const plugin = () => new DiGlobalAlphaPlugin();

/**
 * DI module that publishes the classic start contract globally.
 *
 * `AlphaServiceToken` is bound via `Start`, which the platform auto-bridges
 * with the value returned by the classic `start()` method.  No `rebindSync`
 * workaround is needed.
 */
export const module = new ContainerModule(({ bind }) => {
  bind(AlphaServiceToken).toResolvedValue((start: IAlphaService) => start, [Start]);
  bind(Global).toConstantValue(AlphaServiceToken);
  bind(Route).toConstantValue(AlphaRoute);
});
