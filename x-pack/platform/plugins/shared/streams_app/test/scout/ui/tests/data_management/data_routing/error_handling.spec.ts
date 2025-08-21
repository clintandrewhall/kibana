/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect } from '@kbn/scout';
import { test } from '../../../fixtures';

test.describe(
  'Stream data routing - error handling and recovery',
  { tag: ['@ess', '@svlOblt'] },
  () => {
    test.beforeAll(async ({ apiServices }) => {
      await apiServices.streams.enable();
    });

    test.beforeEach(async ({ apiServices, browserAuth, pageObjects, visualRegression }) => {
      await browserAuth.loginAsAdmin();
      await visualRegression.capture('start of test');

      await pageObjects.streams.gotoPartitioningTab('logs');
      await visualRegression.capture('go to logs partitioning tab');
    });

    test.afterAll(async ({ apiServices }) => {
      // Clear existing rules
      await apiServices.streams.clearStreamChildren('logs');
      await apiServices.streams.disable();
    });

    test('should handle network failures during rule creation', async ({
      page,
      context,
      pageObjects,
      visualRegression,
    }) => {
      await pageObjects.streams.clickCreateRoutingRule();
      await visualRegression.capture('click create routing rule');

      await pageObjects.streams.fillRoutingRuleName('logs.network-test');
      await visualRegression.capture('fill routing rule name');

      // Simulate network failure
      await context.setOffline(true);
      await visualRegression.capture('set offline');

      await pageObjects.streams.saveRoutingRule();
      await visualRegression.capture('save routing rule');

      // Should show error and stay in creating state
      await pageObjects.streams.expectToastVisible();
      await visualRegression.capture('toast visible');
      await expect(page.getByText('Failed to fetch')).toBeVisible();
      await pageObjects.streams.closeToasts();
      await visualRegression.capture('close toasts');
      await expect(page.getByTestId('streamsAppRoutingStreamEntryNameField')).toBeVisible();

      // Restore network and retry
      await context.setOffline(false);
      await pageObjects.streams.saveRoutingRule();
      await visualRegression.capture('save routing rule');

      // Should succeed
      await pageObjects.streams.expectRoutingRuleVisible('logs.network-test');
    });

    test('should recover from API errors during rule updates', async ({
      context,
      page,
      pageObjects,
      visualRegression,
    }) => {
      // Create a rule first
      await pageObjects.streams.clickCreateRoutingRule();
      await visualRegression.capture('click create routing rule');

      await pageObjects.streams.fillRoutingRuleName('logs.error-test');
      await visualRegression.capture('fill routing rule name');

      await pageObjects.streams.saveRoutingRule();
      await visualRegression.capture('save routing rule');

      await pageObjects.streams.closeToasts();
      await visualRegression.capture('close toasts');

      // Edit the rule
      await pageObjects.streams.clickEditRoutingRule('logs.error-test');
      await visualRegression.capture('click edit routing rule');

      // Simulate network failure
      await context.setOffline(true);
      await visualRegression.capture('set offline');

      await pageObjects.streams.updateRoutingRule();
      await visualRegression.capture('update routing rule');

      // Should show error and return to editing state
      await pageObjects.streams.expectToastVisible();
      await visualRegression.capture('toast visible');
      await expect(page.getByText('Failed to fetch')).toBeVisible();
      await pageObjects.streams.closeToasts();
      await visualRegression.capture('close toasts');

      // Restore network and retry
      await context.setOffline(false);
      await pageObjects.streams.updateRoutingRule();
      await visualRegression.capture('update routing rule');

      // Should succeed
      await pageObjects.streams.expectToastVisible();
      await visualRegression.capture('toast visible');
      await expect(page.getByText('Stream saved')).toBeVisible();
    });
  }
);
