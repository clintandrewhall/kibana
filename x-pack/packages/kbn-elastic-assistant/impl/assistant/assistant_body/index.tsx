/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { EuiEmptyPrompt, EuiFlexGroup, EuiFlexItem, EuiPanel } from '@elastic/eui';
import { HttpSetup } from '@kbn/core-http-browser';
import { euiThemeVars } from '@kbn/ui-theme';
import { css } from '@emotion/react';
import { PromptResponse } from '@kbn/elastic-assistant-common';
import { Welcome } from '@kbn/ai-assistant-components-welcome';
import { AssistantAnimatedIcon } from '../assistant_animated_icon';
import { EmptyConvo } from './empty_convo';
import { Conversation } from '../../..';
import { UpgradeLicenseCallToAction } from '../upgrade_license_cta';

interface Props {
  allSystemPrompts: PromptResponse[];
  comments: JSX.Element;
  currentConversation: Conversation | undefined;
  currentSystemPromptId: string | undefined;
  isAssistantEnabled: boolean;
  isSettingsModalVisible: boolean;
  isWelcomeSetup: boolean;
  isLoading: boolean;
  http: HttpSetup;
  setCurrentSystemPromptId: (promptId: string | undefined) => void;
  setIsSettingsModalVisible: Dispatch<SetStateAction<boolean>>;
}

export const AssistantBody: FunctionComponent<Props> = ({
  allSystemPrompts,
  comments,
  currentConversation,
  currentSystemPromptId,
  setCurrentSystemPromptId,
  http,
  isAssistantEnabled,
  isLoading,
  isSettingsModalVisible,
  isWelcomeSetup,
  setIsSettingsModalVisible,
}) => {
  const isEmptyConversation = useMemo(
    () => currentConversation?.messages.length === 0,
    [currentConversation?.messages.length]
  );

  const disclaimer = useMemo(
    () => isEmptyConversation && <Welcome.Disclaimer />,
    [isEmptyConversation]
  );

  // Start Scrolling
  const commentsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const parent = commentsContainerRef.current?.parentElement;

    if (!parent) {
      return;
    }
    // when scrollHeight changes, parent is scrolled to bottom
    parent.scrollTop = parent.scrollHeight;

    (
      commentsContainerRef.current?.childNodes[0].childNodes[0] as HTMLElement
    ).lastElementChild?.scrollIntoView();
  });
  //  End Scrolling

  if (!isAssistantEnabled) {
    return <UpgradeLicenseCallToAction http={http} />;
  }

  return (
    <EuiFlexGroup direction="column" justifyContent="spaceBetween">
      <EuiFlexItem grow={isWelcomeSetup}>
        {isLoading ? (
          <EuiEmptyPrompt data-test-subj="animatedLogo" icon={<AssistantAnimatedIcon />} />
        ) : isWelcomeSetup ? (
          <Welcome.Setup />
        ) : isEmptyConversation ? (
          <EmptyConvo
            allSystemPrompts={allSystemPrompts}
            currentSystemPromptId={currentSystemPromptId}
            isSettingsModalVisible={isSettingsModalVisible}
            setCurrentSystemPromptId={setCurrentSystemPromptId}
            setIsSettingsModalVisible={setIsSettingsModalVisible}
          />
        ) : (
          <EuiPanel
            hasShadow={false}
            panelRef={(element) => {
              commentsContainerRef.current = (element?.parentElement as HTMLDivElement) || null;
            }}
          >
            {comments}
          </EuiPanel>
        )}
      </EuiFlexItem>
      <EuiFlexItem
        grow={false}
        css={css`
          padding: 0 ${euiThemeVars.euiSizeL} ${euiThemeVars.euiSizeM} ${euiThemeVars.euiSizeL};
        `}
      >
        {disclaimer}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
