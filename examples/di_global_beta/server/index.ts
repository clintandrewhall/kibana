/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { ContainerModule } from 'inversify';
import { Global } from '@kbn/core-di-internal';
import { Route } from '@kbn/core-di-server';
import { BetaServiceToken } from '@kbn/di-global-beta-types';
import { BetaService } from './beta_service';
import { BetaRoute } from './route';

export const module = new ContainerModule(({ bind }) => {
  bind(BetaServiceToken).to(BetaService);
  bind(Global).toConstantValue(BetaServiceToken);
  bind(Route).toConstantValue(BetaRoute);
});
