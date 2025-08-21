/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect } from '@kbn/scout';
import { test } from '../../../fixtures';
import { generateLogsData } from '../../../fixtures/generators';

test.describe('Stream data processing - creating processors', { tag: ['@ess', '@svlOblt'] }, () => {
  test.beforeAll(async ({ apiServices, logsSynthtraceEsClient }) => {
    await apiServices.streams.enable();
    await generateLogsData(logsSynthtraceEsClient)({ index: 'logs-generic-default' });
  });

  test.beforeEach(async ({ apiServices, browserAuth, pageObjects }) => {
    await browserAuth.loginAsAdmin();
    // Clear existing processors before each test
    await apiServices.streams.clearStreamProcessors('logs-generic-default');

    await pageObjects.streams.gotoProcessingTab('logs-generic-default');
  });

  test.afterAll(async ({ apiServices, logsSynthtraceEsClient }) => {
    await logsSynthtraceEsClient.clean();
    await apiServices.streams.disable();
  });

  test('should create a new processor successfully', async ({ pageObjects, visualRegression }) => {
    await pageObjects.streams.clickAddProcessor();
    await visualRegression.capture('click add processor');

    await pageObjects.streams.fillFieldInput('message');
    await pageObjects.streams.fillGrokPatternInput('%{WORD:attributes.method}');
    await pageObjects.streams.clickSaveProcessor();
    await visualRegression.capture('click save processor');

    await pageObjects.streams.saveProcessorsListChanges();
    await visualRegression.capture('processors list');
    expect(await pageObjects.streams.getProcessorsListItems()).toHaveLength(1);
  });

  test('should disable creating new processors while one is in progress', async ({
    page,
    pageObjects,
    visualRegression,
  }) => {
    await pageObjects.streams.clickAddProcessor();
    await visualRegression.capture('click add processor');

    await expect(
      page.getByTestId('streamsAppStreamDetailEnrichmentAddProcessorButton')
    ).toBeDisabled();

    // Cancel the operation
    await pageObjects.streams.clickCancelProcessorChanges();
    await visualRegression.capture('click cancel processor changes');

    // Verify we're back to idle state
    await expect(
      page.getByTestId('streamsAppStreamDetailEnrichmentAddProcessorButton')
    ).toBeEnabled();
  });

  test('should disable saving the pipeline while one is in progress', async ({
    page,
    pageObjects,
    visualRegression,
  }) => {
    // Create a new processor ready to be saved
    await pageObjects.streams.clickAddProcessor();
    await visualRegression.capture('click add processor');

    await pageObjects.streams.fillFieldInput('message');
    await pageObjects.streams.fillGrokPatternInput('%{WORD:attributes.method}');
    await pageObjects.streams.clickSaveProcessor();
    await visualRegression.capture('click save processor');

    // Verify save button is enabled
    await expect(page.getByRole('button', { name: 'Save changes' })).toBeEnabled();

    await pageObjects.streams.clickEditProcessor(0);
    await visualRegression.capture('click edit processor');

    // Verify save button is disabled
    await expect(page.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await pageObjects.streams.clickCancelProcessorChanges();
    await visualRegression.capture('click cancel processor changes');

    // Verify save button is enabled
    await expect(page.getByRole('button', { name: 'Save changes' })).toBeEnabled();
  });

  test('should cancel creating a new processor', async ({ pageObjects, visualRegression }) => {
    await pageObjects.streams.clickAddProcessor();
    await visualRegression.capture('click add processor');

    // Fill in some data
    await pageObjects.streams.fillFieldInput('message');
    await pageObjects.streams.fillGrokPatternInput('%{WORD:attributes.method}');

    // Cancel the changes and confirm discard
    await pageObjects.streams.clickCancelProcessorChanges();
    await visualRegression.capture('click cancel processor changes');
    await pageObjects.streams.confirmDiscardInModal();
    await visualRegression.capture('confirm discard in modal');

    // Verify we're back to idle state
    expect(await pageObjects.streams.getProcessorsListItems()).toHaveLength(0);
  });

  test('should show validation errors for invalid processors configuration', async ({
    page,
    pageObjects,
    visualRegression,
  }) => {
    await pageObjects.streams.clickAddProcessor();
    await visualRegression.capture('click add processor');

    // Try to create without filling required fields
    await pageObjects.streams.clickSaveProcessor();
    await expect(page.getByText('A field value is required.')).toBeVisible();
    await visualRegression.capture('click save processor with empty field');

    await pageObjects.streams.fillFieldInput('message');
    await pageObjects.streams.clickSaveProcessor();
    await expect(page.getByText('Empty patterns are not allowed.')).toBeVisible();
    await visualRegression.capture('click save processor with empty pattern');

    await pageObjects.streams.fillGrokPatternInput('%{WORD:attributes.method}');
    await pageObjects.streams.clickSaveProcessor();
    await visualRegression.capture('click save processor with valid pattern');

    await pageObjects.streams.saveProcessorsListChanges();
    await visualRegression.capture('save processors list');
    expect(await pageObjects.streams.getProcessorsListItems()).toHaveLength(1);
  });

  test('should handle insufficient privileges gracefully', async ({
    page,
    browserAuth,
    pageObjects,
    visualRegression,
  }) => {
    // Login as user with limited privileges
    await browserAuth.loginAsViewer();
    await pageObjects.streams.gotoProcessingTab('logs-generic-default');
    await visualRegression.capture('goto processing tab');

    // Create button should be disabled or show tooltip
    const createButton = page.getByTestId('streamsAppStreamDetailEnrichmentAddProcessorButton');
    await expect(createButton).toBeHidden();
    await visualRegression.capture('create button is hidden');
  });
});
