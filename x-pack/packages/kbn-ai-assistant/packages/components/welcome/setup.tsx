/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiText } from '@elastic/eui';
import { AssistantAnimatedIcon, ServiceProviderIcon } from '@kbn/ai-assistant-assets';
import { bedrock, gemini, openai } from '@kbn/ai-assistant-service-providers';
import { AddConnectorButton } from '@kbn/ai-assistant-components-add-connector';

import { TITLE, DESCRIPTION } from './welcome.i18n';
import { useStyles } from './setup.styles';

const Icon = () => (
  <EuiFlexItem grow={false}>
    <AssistantAnimatedIcon size="xxl" backgroundColor="ghost" />
  </EuiFlexItem>
);

const Title = () => (
  <EuiFlexItem grow={false}>
    <EuiText>
      <h3>{TITLE}</h3>
    </EuiText>
  </EuiFlexItem>
);

const Description = () => (
  <EuiFlexItem grow={false}>
    <EuiText color="subdued">
      <p>{DESCRIPTION}</p>
    </EuiText>
  </EuiFlexItem>
);

const Prompt = () => {
  const { prompt } = useStyles();

  return (
    <EuiFlexItem grow={false} css={prompt} data-test-subj="add-connector-prompt">
      <AddConnectorButton />
    </EuiFlexItem>
  );
};

const Connectors = () => (
  <EuiFlexItem grow={false}>
    <EuiFlexGroup>
      <EuiFlexItem grow={false}>
        <ServiceProviderIcon provider={openai} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <ServiceProviderIcon provider={gemini} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <ServiceProviderIcon provider={bedrock} />
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiFlexItem>
);

export const Setup = () => {
  const { panel, root } = useStyles();

  return (
    <EuiFlexGroup css={root} alignItems="center" justifyContent="center">
      <EuiFlexItem grow={false}>
        <EuiPanel hasShadow={false} css={panel} paddingSize="none">
          <EuiFlexGroup
            alignItems="center"
            justifyContent="center"
            direction="column"
            data-test-subj="welcome-setup"
            gutterSize="m"
          >
            <Icon />
            <Title />
            <Description />
            <Prompt />
            <Connectors />
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
