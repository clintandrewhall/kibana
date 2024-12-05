/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { css } from '@emotion/css';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer, useCurrentEuiBreakpoint } from '@elastic/eui';
import { Welcome } from '@kbn/ai-assistant-components-welcome';
import type { UseKnowledgeBaseResult } from '../hooks/use_knowledge_base';
import type { UseGenAIConnectorsResult } from '../hooks/use_genai_connectors';
import { WelcomeMessageKnowledgeBase } from './welcome_message_knowledge_base';
import { StarterPrompts } from './starter_prompts';
import { WelcomeMessageConnectors } from './welcome_message_connectors';

const fullHeightClassName = css`
  height: 100%;
`;

const centerMaxWidthClassName = css`
  max-width: 600px;
  text-align: center;
`;

export function WelcomeMessage({
  connectors,
  knowledgeBase,
  onSelectPrompt,
}: {
  connectors: UseGenAIConnectorsResult;
  knowledgeBase: UseKnowledgeBaseResult;
  onSelectPrompt: (prompt: string) => void;
}) {
  const breakpoint = useCurrentEuiBreakpoint();

  return (
    <>
      <EuiFlexGroup
        alignItems="center"
        direction="column"
        gutterSize="none"
        className={fullHeightClassName}
      >
        <EuiFlexItem grow className={centerMaxWidthClassName}>
          <EuiSpacer size={['xl', 'l'].includes(breakpoint!) ? 'l' : 's'} />
          <WelcomeMessageConnectors {...{ connectors }} />
          {knowledgeBase.status.value?.enabled ? (
            <WelcomeMessageKnowledgeBase connectors={connectors} knowledgeBase={knowledgeBase} />
          ) : null}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <StarterPrompts onSelectPrompt={onSelectPrompt} />
          <EuiSpacer size="l" />
          <Welcome.Disclaimer />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
