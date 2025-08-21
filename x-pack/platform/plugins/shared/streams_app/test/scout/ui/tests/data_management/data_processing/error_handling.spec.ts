/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect } from '@kbn/scout';
import { test } from '../../../fixtures';
import { generateLogsData } from '../../../fixtures/generators';

test.describe(
  'Stream data processing - error handling and recovery',
  { tag: ['@ess', '@svlOblt'] },
  () => {
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

    test('should handle network failures during a processor creation', async ({
      page,
      pageObjects,
      visualRegression,
    }) => {
      await pageObjects.streams.clickAddProcessor();
      await visualRegression.capture('click add processor');

      await pageObjects.streams.fillFieldInput('message');
      await pageObjects.streams.fillGrokPatternInput('%{WORD:attributes.method}');
      await pageObjects.streams.clickSaveProcessor();
      await visualRegression.capture('click save processor');

      // Simulate network failure
      await page.route('**/streams/**/_ingest', (route) => {
        // Abort the request to simulate a network failure
        route.abort();
      });

      await pageObjects.streams.saveProcessorsListChanges();
      await visualRegression.capture('save processors list after aborting request');

      // Should show error and stay in creating state
      await pageObjects.streams.expectToastVisible();
      await visualRegression.capture('toast visible');

      await expect(page.getByText("An issue occurred saving processors' changes")).toBeVisible();
      await pageObjects.streams.closeToasts();
      await visualRegression.capture('close toasts');

      // Restore network and retry
      await page.route('**/streams/**/_ingest', (route) => {
        route.continue();
      });
      await pageObjects.streams.saveProcessorsListChanges();
      await visualRegression.capture('save processors list after restoring network');

      // Should succeed
      expect(await pageObjects.streams.getProcessorsListItems()).toHaveLength(1);
      await visualRegression.capture('processors list');
    });

    test('should recover from API errors during a processor updates', async ({
      page,
      pageObjects,
      visualRegression,
    }) => {
      // Create a processor first
      await pageObjects.streams.clickAddProcessor();
      await visualRegression.capture('click add processor');

      await pageObjects.streams.fillFieldInput('message');
      await pageObjects.streams.fillGrokPatternInput('%{WORD:attributes.method}');
      await pageObjects.streams.clickSaveProcessor();
      await visualRegression.capture('click save processor');

      await pageObjects.streams.saveProcessorsListChanges();
      await visualRegression.capture('save processors list');

      await pageObjects.streams.closeToasts();
      await visualRegression.capture('close toasts');

      // Edit the processor
      await pageObjects.streams.clickEditProcessor(0);
      await pageObjects.streams.fillGrokPatternInput('%{WORD:attributes.hostname}');
      await pageObjects.streams.clickSaveProcessor();
      await visualRegression.capture('click save processor after edit');

      // Simulate network failure
      await page.route('**/streams/**/_ingest', (route) => {
        // Abort the request to simulate a network failure
        route.abort();
      });

      await pageObjects.streams.saveProcessorsListChanges();
      await visualRegression.capture('save processors list after aborting request');

      // Should show error and return to editing state
      await pageObjects.streams.expectToastVisible();
      await visualRegression.capture('toast visible after aborting request');

      await expect(page.getByText("An issue occurred saving processors' changes")).toBeVisible();
      await pageObjects.streams.closeToasts();
      await visualRegression.capture('close toasts');

      // Restore network and retry
      await page.route('**/streams/**/_ingest', (route) => {
        route.continue();
      });
      await pageObjects.streams.saveProcessorsListChanges();
      await visualRegression.capture('save processors list after restoring network');

      // Should succeed
      await pageObjects.streams.expectToastVisible();
      await visualRegression.capture('toast visible after restoring network');

      await expect(page.getByText("Stream's processors updated")).toBeVisible();
    });
  }
);
