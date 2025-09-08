/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect } from '@kbn/scout';
import { test } from '../../../fixtures';
import { generateLogsData } from '../../../fixtures/generators';

test.describe('Stream data processing - editing processors', { tag: ['@ess', '@svlOblt'] }, () => {
  test.beforeAll(async ({ apiServices, logsSynthtraceEsClient }) => {
    await apiServices.streams.enable();
    await generateLogsData(logsSynthtraceEsClient)({ index: 'logs-generic-default' });
  });

  test.beforeEach(async ({ apiServices, browserAuth, pageObjects }) => {
    await browserAuth.loginAsAdmin();
    // Clear existing processors before each test
    await apiServices.streams.updateStreamProcessors('logs-generic-default', {
      steps: [{ action: 'grok', from: 'message', patterns: ['%{WORD:attributes.method}'] }],
    });

    await pageObjects.streams.gotoProcessingTab('logs-generic-default');
  });

  test.afterAll(async ({ apiServices, logsSynthtraceEsClient }) => {
    await logsSynthtraceEsClient.clean();
    await apiServices.streams.disable();
  });

  test('should edit an existing processor', async ({ page, pageObjects, visualRegression }) => {
    await expect(page.getByText('%{WORD:attributes.method}')).toBeVisible();
    await pageObjects.streams.clickEditProcessor(0);
    await visualRegression.capture('click edit processor');

    await pageObjects.streams.fillGrokPatternInput('%{WORD:attributes.hostname}');
    await pageObjects.streams.clickSaveProcessor();
    await visualRegression.capture('click save processor');

    await pageObjects.streams.saveProcessorsListChanges();
    await visualRegression.capture('save processors list');

    expect(await pageObjects.streams.getProcessorsListItems()).toHaveLength(1);
    await expect(page.getByText('%{WORD:attributes.hostname}')).toBeVisible();
  });

  test('should not let edit other processors while one is in progress', async ({
    pageObjects,
    visualRegression,
  }) => {
    await pageObjects.streams.clickAddProcessor();
    await visualRegression.capture('click add processor');

    await expect(await pageObjects.streams.getProcessorEditButton(0)).toBeDisabled();

    await pageObjects.streams.clickCancelProcessorChanges();
    await visualRegression.capture('click cancel processor changes');

    await expect(await pageObjects.streams.getProcessorEditButton(0)).toBeEnabled();
  });

  test('should cancel editing a processor', async ({ page, pageObjects, visualRegression }) => {
    await expect(page.getByText('%{WORD:attributes.method}')).toBeVisible();
    await pageObjects.streams.clickEditProcessor(0);
    await visualRegression.capture('click edit processor');

    await pageObjects.streams.fillGrokPatternInput('%{WORD:attributes.hostname}');

    // Cancel the changes and confirm discard
    await pageObjects.streams.clickCancelProcessorChanges();
    await visualRegression.capture('click cancel processor changes');

    await pageObjects.streams.confirmDiscardInModal();
    await visualRegression.capture('confirm discard in modal');

    expect(await pageObjects.streams.getProcessorsListItems()).toHaveLength(1);
    await expect(page.getByText('%{WORD:attributes.method}')).toBeVisible();
  });

  test('should remove a processor with confirmation', async ({
    page,
    pageObjects,
    visualRegression,
  }) => {
    await pageObjects.streams.removeProcessor(0);
    await visualRegression.capture('remove processor');

    // Confirm deletion in modal
    await pageObjects.streams.confirmDeleteInModal();
    await visualRegression.capture('confirm delete in modal');

    expect(await pageObjects.streams.getProcessorsListItems()).toHaveLength(0);
    await expect(page.getByText('%{WORD:attributes.method}')).toBeHidden();
  });

  test('should cancel a processor removal', async ({ pageObjects, visualRegression }) => {
    await pageObjects.streams.removeProcessor(0);
    await visualRegression.capture('remove processor');

    // Cancel deletion
    await pageObjects.streams.cancelDeleteInModal();
    await visualRegression.capture('cancel delete in modal');

    // Verify processor still exists
    expect(await pageObjects.streams.getProcessorsListItems()).toHaveLength(1);
  });

  test('should handle insufficient privileges gracefully', async ({
    browserAuth,
    pageObjects,
    visualRegression,
  }) => {
    // Login as user with limited privileges
    await browserAuth.loginAsViewer();
    await visualRegression.capture('login as viewer');

    await pageObjects.streams.gotoProcessingTab('logs-generic-default');
    await visualRegression.capture('goto processing tab');

    // Edit button should be disabled or show tooltip
    await expect(await pageObjects.streams.getProcessorEditButton(0)).toBeDisabled();
  });
});
