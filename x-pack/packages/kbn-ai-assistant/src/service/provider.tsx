/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { PropsWithChildren } from 'react';
import { type ActionConnector } from '@kbn/alerts-ui-shared';
import {
  type WelcomeKibanaDependencies,
  WelcomeKibanaProvider,
  WelcomeServicesProvider,
  WelcomeServices,
} from '@kbn/ai-assistant-components-welcome';
import { isSupportedConnectorType } from '@kbn/ai-service-providers';

export type AiAssistantServices = WelcomeServices;

export const AiAssistantProvider = ({
  children,
  ...rest
}: PropsWithChildren<AiAssistantServices>) => (
  <WelcomeServicesProvider {...rest}>{children}</WelcomeServicesProvider>
);

export interface AiAssistantKibanaDependencies extends WelcomeKibanaDependencies {
  knowledgeBase: {
    status: {
      value?: {
        ready: boolean;
      };
    };
    install: () => void;
  };
  connectors: {
    reloadConnectors: () => void;
  };
}

/**
 * Kibana-specific Provider that maps dependencies to services.
 */
export const AiAssistantKibanaProvider = ({
  connectors,
  knowledgeBase,
  children,
  ...rest
}: PropsWithChildren<AiAssistantKibanaDependencies>) => {
  const onConnectorAdded = (connector: ActionConnector) => {
    if (isSupportedConnectorType(connector.actionTypeId)) {
      connectors.reloadConnectors();
    }

    if (!knowledgeBase.status.value || knowledgeBase.status.value?.ready === false) {
      knowledgeBase.install();
    }
  };

  return (
    <WelcomeKibanaProvider {...{ onConnectorAdded, ...rest }}>{children}</WelcomeKibanaProvider>
  );
};
