/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { APM_AGENT_CONFIGURATION_INDEX } from '@kbn/apm-sources-access-plugin/server';
import { SERVICE_NAME, SERVICE_ENVIRONMENT } from '../../../../../common/es_fields/apm';
import { ALL_OPTION_VALUE } from '../../../../../common/agent_configuration/all_option';
import type { APMInternalESClient } from '../../../../lib/helpers/create_es_client/create_internal_es_client';

export async function getExistingEnvironmentsForService({
  serviceName,
  internalESClient,
  size,
}: {
  serviceName: string | undefined;
  internalESClient: APMInternalESClient;
  size: number;
}) {
  const bool = serviceName
    ? { filter: [{ term: { [SERVICE_NAME]: serviceName } }] }
    : { must_not: [{ exists: { field: SERVICE_NAME } }] };

  const params = {
    index: APM_AGENT_CONFIGURATION_INDEX,
    size: 0,
    query: { bool },
    aggs: {
      environments: {
        terms: {
          field: SERVICE_ENVIRONMENT,
          missing: ALL_OPTION_VALUE,
          size,
        },
      },
    },
  };

  const resp = await internalESClient.search('get_existing_environments_for_service', params);
  const existingEnvironments =
    resp.aggregations?.environments.buckets.map((bucket) => bucket.key as string) || [];
  return existingEnvironments;
}
