/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useCallback } from 'react';
import { useKnowledgeBaseStatus } from '../assistant/api/knowledge_base/use_knowledge_base_status';
import { useAssistantContext } from '../assistant_context';
import { useSetupKnowledgeBase } from '../assistant/api/knowledge_base/use_setup_knowledge_base';

/**
 * Hook that provides the status of the knowledge base installation and the ability to install it.
 */
export const useKnowledgeBaseInstall = () => {
  const {
    http,
    toasts,
    assistantAvailability: { isAssistantEnabled },
  } = useAssistantContext();

  const { data: kbStatus } = useKnowledgeBaseStatus({ http, enabled: isAssistantEnabled });

  const { mutate: setupKB, isLoading: isSettingUpKB } = useSetupKnowledgeBase({ http, toasts });

  const isSetupInProgress = kbStatus?.is_setup_in_progress || isSettingUpKB;
  const isSetupComplete = kbStatus?.elser_exists && kbStatus?.security_labs_exists;
  const isSetupAvailable = kbStatus?.is_setup_available;

  const onInstallKnowledgeBase = useCallback(() => {
    setupKB();
  }, [setupKB]);

  return {
    isSetupComplete,
    isSetupInProgress,
    isSetupAvailable,
    onInstallKnowledgeBase,
  };
};
