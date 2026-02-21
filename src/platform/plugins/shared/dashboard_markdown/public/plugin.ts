/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { CoreStart, Plugin } from '@kbn/core/public';
import { CONTEXT_MENU_TRIGGER } from '@kbn/ui-actions-plugin/common/trigger_ids';
import type { UiActionsStart } from '@kbn/ui-actions-plugin/public';
import { ADD_PANEL_TRIGGER } from '@kbn/ui-actions-plugin/common/trigger_ids';
import { ADD_MARKDOWN_ACTION_ID, CONVERT_LEGACY_MARKDOWN_ACTION_ID } from './constants';

export interface StartDeps {
  uiActions: UiActionsStart;
}

export class DashboardMarkdownPlugin implements Plugin<void, void, object, StartDeps> {
  public setup() {}

  public start(core: CoreStart, deps: StartDeps) {
    deps.uiActions.addTriggerActionAsync(ADD_PANEL_TRIGGER, ADD_MARKDOWN_ACTION_ID, async () => {
      const { createMarkdownAction } = await import('./async_services');
      return createMarkdownAction();
    });

    deps.uiActions.addTriggerActionAsync(
      CONTEXT_MENU_TRIGGER,
      CONVERT_LEGACY_MARKDOWN_ACTION_ID,
      async () => {
        const { getConvertLegacyMarkdownAction } = await import('./async_services');
        return getConvertLegacyMarkdownAction();
      }
    );
  }

  public stop() {}
}
