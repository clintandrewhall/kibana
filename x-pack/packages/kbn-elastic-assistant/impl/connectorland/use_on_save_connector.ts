/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useCallback, useMemo } from 'react';
import type { ActionConnector } from '@kbn/alerts-ui-shared';

import { WELCOME_CONVERSATION } from '../assistant/use_conversation/sample_conversations';
import { Conversation } from '../..';
import { useConversation } from '../assistant/use_conversation';
import { useAssistantContext } from '../assistant_context';
import { useLoadConnectors } from './use_load_connectors';
import { getGenAiConfig } from './helpers';

export interface ConnectorSetupProps {
  conversation?: Conversation;
  onConversationUpdate?: ({ cId, cTitle }: { cId: string; cTitle: string }) => Promise<void>;
  updateConversationsOnSaveConnector?: boolean;
}

export const useOnSaveConnector = ({
  conversation: defaultConversation,
  onConversationUpdate,
  updateConversationsOnSaveConnector = true,
}: ConnectorSetupProps) => {
  const conversation = useMemo(
    () => defaultConversation || WELCOME_CONVERSATION,
    [defaultConversation]
  );

  const { setApiConfig } = useConversation();

  // Access all conversations so we can add connector to all on initial setup
  const { http } = useAssistantContext();

  const { refetch: refetchConnectors } = useLoadConnectors({ http });

  const onSaveConnector = useCallback(
    async (connector: ActionConnector) => {
      if (updateConversationsOnSaveConnector) {
        // this side effect is not required for Attack discovery, because the connector is not used in a conversation
        const config = getGenAiConfig(connector);
        // persist only the active conversation
        const updatedConversation = await setApiConfig({
          conversation,
          apiConfig: {
            ...conversation.apiConfig,
            connectorId: connector.id,
            actionTypeId: connector.actionTypeId,
            provider: config?.apiProvider,
            model: config?.defaultModel,
          },
        });

        if (updatedConversation) {
          onConversationUpdate?.({
            cId: updatedConversation.id,
            cTitle: updatedConversation.title,
          });

          refetchConnectors?.();
        }
      } else {
        refetchConnectors?.();
      }
    },
    [
      conversation,
      onConversationUpdate,
      refetchConnectors,
      setApiConfig,
      updateConversationsOnSaveConnector,
    ]
  );
  return onSaveConnector;
};
