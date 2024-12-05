/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ServiceProviderID } from './id';

const CONNECTOR_TYPES = ['.bedrock', '.gen-ai', '.gemini'] as const;

/**
 * Available connector types for AI Service Providers.
 */
export type ConnectorType = (typeof CONNECTOR_TYPES)[number];

// There are more service providers and connector types in @kbn/stack-connectors-plugin,
// but until we know which other logos or properties we'd like to migrate, we're only
// including those currently in use by the AI Assistant.
export const SERVICE_PROVIDER_CONNECTOR_TYPES: Record<ServiceProviderID, ConnectorType> = {
  bedrock: '.bedrock',
  openai: '.gen-ai',
  gemini: '.gemini',
};

/**
 * Returns true if the given string is a supported connector type, false otherwise.
 */
export const isSupportedConnectorType = (type: string): type is ConnectorType =>
  (CONNECTOR_TYPES as readonly string[]).includes(type);
