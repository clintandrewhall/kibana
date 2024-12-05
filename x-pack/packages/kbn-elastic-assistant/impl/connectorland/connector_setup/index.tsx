/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useState } from 'react';

import { ActionType } from '@kbn/triggers-actions-ui-plugin/public';
import { AddConnectorModal } from '../add_connector_modal';
import { Conversation } from '../../..';
import { useLoadActionTypes } from '../use_load_action_types';
import { useAssistantContext } from '../../assistant_context';
import { useOnSaveConnector } from '../use_on_save_connector';

export interface ConnectorSetupProps {
  conversation?: Conversation;
  onConversationUpdate?: ({ cId, cTitle }: { cId: string; cTitle: string }) => Promise<void>;
  updateConversationsOnSaveConnector?: boolean;
}

export const ConnectorSetup = ({
  conversation,
  onConversationUpdate,
  updateConversationsOnSaveConnector = true,
}: ConnectorSetupProps) => {
  // Access all conversations so we can add connector to all on initial setup
  const { actionTypeRegistry, http } = useAssistantContext();

  const { data: actionTypes } = useLoadActionTypes({ http });

  const [selectedActionType, setSelectedActionType] = useState<ActionType | null>(null);

  const onSaveConnector = useOnSaveConnector({
    conversation,
    onConversationUpdate,
    updateConversationsOnSaveConnector,
  });

  const handleClose = useCallback(() => {
    setSelectedActionType(null);
  }, []);

  return (
    <AddConnectorModal
      actionTypeRegistry={actionTypeRegistry}
      actionTypes={actionTypes}
      onClose={handleClose}
      onSaveConnector={onSaveConnector}
      onSelectActionType={setSelectedActionType}
      selectedActionType={selectedActionType}
      actionTypeSelectorInline={true}
    />
  );
};
