/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { type ActionConnector } from '@kbn/alerts-ui-shared';

// this is a copy from x-pack/plugins/actions/common/connector_feature_config.ts
// it needs to be relocated out of the plugin and into a package.
export const GenerativeAIForObservabilityConnectorFeatureId = 'generativeAIForObservability';

// this is a copy from x-pack/plugins/triggers_actions_ui/public/plugin.ts
// it needs to be relocated out of the plugin and into a package.
export interface FlyoutProps {
  onClose: () => void;
  featureId?: string;
  onConnectorCreated?: (connector: ActionConnector) => void;
  onTestConnector?: (connector: ActionConnector) => void;
}
