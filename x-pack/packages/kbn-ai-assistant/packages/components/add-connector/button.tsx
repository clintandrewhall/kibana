/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiButton } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { useServices } from './services';

const CONNECTOR_PROMPT = i18n.translate('xpack.ai.assistant.welcome.addConnector.label', {
  defaultMessage: 'AI service provider',
});

export const AddConnectorButton = () => {
  const { onAddConnector } = useServices();

  return (
    <EuiButton iconType="plusInCircle" onClick={() => onAddConnector()}>
      {CONNECTOR_PROMPT}
    </EuiButton>
  );
};
