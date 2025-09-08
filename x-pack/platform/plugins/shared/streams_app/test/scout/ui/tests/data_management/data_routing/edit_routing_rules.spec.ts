/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* Assertions are performed by re-using the streams_app fixtures and page objects. */
/* eslint-disable playwright/expect-expect */

import { expect } from '@kbn/scout';
import { test } from '../../../fixtures';

test.describe('Stream data routing - editing routing rules', { tag: ['@ess', '@svlOblt'] }, () => {
  test.beforeAll(async ({ apiServices }) => {
    await apiServices.streams.enable();
  });

  test.beforeEach(async ({ apiServices, browserAuth, pageObjects, visualRegression }) => {
    await browserAuth.loginAsAdmin();
    // Clear existing rules
    await apiServices.streams.clearStreamChildren('logs');
    // Create a test stream with routing rules first
    await apiServices.streams.forkStream('logs', 'logs.edit-test', {
      field: 'service.name',
      eq: 'test-service',
    });

    await visualRegression.capture('start of test');

    await pageObjects.streams.gotoPartitioningTab('logs');
    await visualRegression.capture('go to logs partitioning tab');
  });

  test.afterAll(async ({ apiServices }) => {
    // Clear existing rules
    await apiServices.streams.clearStreamChildren('logs');
    await apiServices.streams.disable();
  });

  test('should edit an existing routing rule', async ({ page, pageObjects, visualRegression }) => {
    await pageObjects.streams.clickEditRoutingRule('logs.edit-test');
    await visualRegression.capture('click edit routing rule');

    // Update condition
    await pageObjects.streams.fillConditionEditor({ value: 'updated-service' });
    await visualRegression.capture('fill condition editor');

    await pageObjects.streams.updateRoutingRule();
    await visualRegression.capture('update routing rule');

    // Verify success
    await expect(page.getByText('service.name eq updated-service')).toBeVisible();
  });

  test('should cancel editing routing rule', async ({ page, pageObjects, visualRegression }) => {
    await pageObjects.streams.clickEditRoutingRule('logs.edit-test');
    await visualRegression.capture('click edit routing rule');

    // Update and cancel changes
    await pageObjects.streams.fillConditionEditor({ value: 'updated-service' });
    await visualRegression.capture('fill condition editor');

    await pageObjects.streams.cancelRoutingRule();
    await visualRegression.capture('cancel routing rule');

    // Verify success
    await expect(page.getByText('service.name eq test-service')).toBeVisible();
  });

  test('should switch between editing different rules', async ({
    page,
    pageObjects,
    visualRegression,
  }) => {
    // Create another test rule
    await pageObjects.streams.clickCreateRoutingRule();
    await visualRegression.capture('click create routing rule');

    await pageObjects.streams.fillRoutingRuleName('logs.edit-test-2');
    await visualRegression.capture('fill routing rule name');

    await pageObjects.streams.fillConditionEditor({
      field: 'log.level',
      value: 'info',
      operator: 'equals',
    });
    await visualRegression.capture('fill condition editor');

    await pageObjects.streams.saveRoutingRule();
    await visualRegression.capture('save routing rule');

    // Edit first rule
    await pageObjects.streams.clickEditRoutingRule('logs.edit-test');
    await visualRegression.capture('click edit test routing rule');

    // Switch to edit second rule without saving
    await pageObjects.streams.clickEditRoutingRule('logs.edit-test-2');
    await visualRegression.capture('click edit test-2 routing rule');

    // Should now be editing the second rule
    await expect(page.getByTestId('streamsAppConditionEditorValueText')).toHaveValue('info');
  });

  test('should remove routing rule with confirmation', async ({
    pageObjects,
    visualRegression,
  }) => {
    await pageObjects.streams.clickEditRoutingRule('logs.edit-test');
    await visualRegression.capture('click edit test routing rule');

    await pageObjects.streams.removeRoutingRule();
    await visualRegression.capture('remove routing rule');

    // Confirm deletion in modal
    await pageObjects.streams.confirmDeleteInModal();
    await visualRegression.capture('confirm delete in modal');

    await pageObjects.streams.expectRoutingRuleHidden('logs.edit-test');
    await visualRegression.capture('routing rule hidden');

    await pageObjects.streams.expectToastVisible();
    await visualRegression.capture('toast visible');
  });

  test('should cancel rule removal', async ({ pageObjects, visualRegression }) => {
    await pageObjects.streams.clickEditRoutingRule('logs.edit-test');
    await visualRegression.capture('click edit test routing rule');

    await pageObjects.streams.removeRoutingRule();
    await visualRegression.capture('remove routing rule');

    // Cancel deletion
    await pageObjects.streams.cancelDeleteInModal();
    await visualRegression.capture('cancel delete in modal');

    // Verify rule still exists
    await pageObjects.streams.expectRoutingRuleVisible('logs.edit-test');
    await visualRegression.capture('routing rule visible');
  });
});
