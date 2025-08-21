/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* Assertions are performed by re-using the streams_app fixtures and page objects. */
/* eslint-disable playwright/expect-expect */

import { test } from '../../../fixtures';

test.describe(
  'Stream data routing - reordering routing rules',
  { tag: ['@ess', '@svlOblt'] },
  () => {
    test.beforeAll(async ({ apiServices }) => {
      await apiServices.streams.enable();
    });

    test.beforeEach(async ({ apiServices, browserAuth, pageObjects, visualRegression }) => {
      await browserAuth.loginAsAdmin();
      // Clear existing rules
      await apiServices.streams.clearStreamChildren('logs');
      // Create multiple test streams for reordering
      const streamNames = ['logs.first', 'logs.second', 'logs.third'];
      for (const streamName of streamNames) {
        await apiServices.streams.forkStream('logs', streamName, {
          field: 'service.name',
          eq: streamName.split('.')[1],
        });
      }
      await visualRegression.capture('start of test');

      await pageObjects.streams.gotoPartitioningTab('logs');
      await visualRegression.capture('go to logs partitioning tab');
    });

    test.afterAll(async ({ apiServices }) => {
      // Clear existing rules
      await apiServices.streams.clearStreamChildren('logs');
      await apiServices.streams.disable();
    });

    test('should reorder routing rules via drag and drop', async ({
      pageObjects,
      visualRegression,
    }) => {
      await pageObjects.streams.expectRoutingOrder(['logs.first', 'logs.second', 'logs.third']);
      await visualRegression.capture('routing order');

      await pageObjects.streams.dragRoutingRule('logs.first', 2);
      await visualRegression.capture('drag routing rule');

      await pageObjects.streams.saveRuleOrder();
      await visualRegression.capture('save rule order');

      await pageObjects.streams.expectToastVisible();
      await visualRegression.capture('toast visible');

      await pageObjects.streams.expectRoutingOrder(['logs.second', 'logs.third', 'logs.first']);
      await visualRegression.capture('routing order after saving changes');
    });

    test('should cancel reordering', async ({ pageObjects, visualRegression }) => {
      await pageObjects.streams.expectRoutingOrder(['logs.first', 'logs.second', 'logs.third']);
      await visualRegression.capture('routing order');

      await pageObjects.streams.dragRoutingRule('logs.first', 2);
      await visualRegression.capture('drag routing rule');

      await pageObjects.streams.cancelChanges();
      await visualRegression.capture('cancel changes');

      await pageObjects.streams.expectRoutingOrder(['logs.first', 'logs.second', 'logs.third']);
      await visualRegression.capture('routing order after canceling changes');
    });

    test('should handle multiple reorder operations', async ({ pageObjects, visualRegression }) => {
      // Perform drag operations
      await pageObjects.streams.dragRoutingRule('logs.first', 2);
      await visualRegression.capture('drag routing rule');

      // Perform another reorder while in reordering state
      await pageObjects.streams.dragRoutingRule('logs.third', -1);
      await visualRegression.capture('drag routing rule');

      // Save all changes
      await pageObjects.streams.saveRuleOrder();
      await visualRegression.capture('save rule order');

      await pageObjects.streams.expectToastVisible();
      await visualRegression.capture('toast visible');

      await pageObjects.streams.expectRoutingOrder(['logs.third', 'logs.second', 'logs.first']);
      await visualRegression.capture('routing order after saving changes');
    });
  }
);
