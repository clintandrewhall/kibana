/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';

export const TITLE = i18n.translate('xpack.ai.assistant.welcome.title', {
  defaultMessage: 'Welcome to AI Assistant!',
});

export const DESCRIPTION = i18n.translate('xpack.ai.assistant.welcome.description', {
  defaultMessage:
    "First things first, we'll need to set up a Generative AI Connector to get this chat experience going!",
});

export const CONNECTOR_PROMPT = i18n.translate('xpack.ai.assistant.welcome.addConnector.label', {
  defaultMessage: 'AI service provider',
});

export const DISCLAIMER = i18n.translate('xpack.ai.assistant.welcome.disclaimer.label', {
  defaultMessage:
    'Responses from AI systems may not always be entirely accurate, although they can seem convincing. For more information on the assistant feature and its usage, please reference the documentation.',
});
