/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { PropsWithChildren, ReactElement, useMemo, useState } from 'react';
import type { ActionConnector } from '@kbn/alerts-ui-shared';

import { type AddConnectorServices, AddConnectorProvider } from './services';
import { type FlyoutProps, GenerativeAIForObservabilityConnectorFeatureId } from './todo';

export interface AddConnectorKibanaDependencies {
  core: {
    application: {
      navigateToApp: (appId: string, options: { path: string }) => void;
      capabilities: {
        management: {
          [sectionId: string]: Record<string, boolean>;
        };
      };
    };
  };
  triggersActionsUi: {
    getAddConnectorFlyout: (props: FlyoutProps) => ReactElement;
  };
}

/**
 * Kibana-specific Provider that maps dependencies to services.
 */
export const AddConnectorKibanaProvider = ({
  children,
  core,
  triggersActionsUi,
  onConnectorAdded: onConnectorAddedProp,
  onAddConnector: onAddConnectorProp,
}: PropsWithChildren<AddConnectorKibanaDependencies & Partial<AddConnectorServices>>) => {
  const {
    application: {
      navigateToApp,
      capabilities: {
        management: {
          insightsAndAlerting: { triggersActions },
        },
      },
    },
  } = core;

  const { getAddConnectorFlyout } = triggersActionsUi;

  const [isConnectorFlyoutOpen, setIsConnectorFlyoutOpen] = useState(false);

  const onAddConnector = () => {
    if (triggersActions) {
      setIsConnectorFlyoutOpen(true);
    } else {
      navigateToApp('management', {
        path: '/insightsAndAlerting/triggersActionsConnectors/connectors',
      });
    }

    onAddConnectorProp?.();
  };

  const onConnectorAdded = (connector: ActionConnector) => {
    setIsConnectorFlyoutOpen(false);
    onConnectorAddedProp?.(connector);
  };

  const ConnectorFlyout = useMemo(() => getAddConnectorFlyout, [getAddConnectorFlyout]);

  return (
    <AddConnectorProvider {...{ onAddConnector, onConnectorAdded }}>
      {children}
      {isConnectorFlyoutOpen ? (
        <ConnectorFlyout
          featureId={GenerativeAIForObservabilityConnectorFeatureId}
          onConnectorCreated={onConnectorAdded}
          onClose={() => setIsConnectorFlyoutOpen(false)}
        />
      ) : null}
    </AddConnectorProvider>
  );
};
