/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';

export const GET_DASHBOARD_API_ERROR = (apiProvider: string) =>
  i18n.translate('xpack.stackConnectors.components.genAi.error.dashboardApiError', {
    values: { apiProvider },
    defaultMessage: 'Error finding {apiProvider} Token Usage Dashboard.',
  });
