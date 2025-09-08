/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect } from '@kbn/scout';
import { test } from '../../fixtures';

test.describe(
  'Stream data retention - updating data retention',
  { tag: ['@ess', '@svlOblt'] },
  () => {
    test.beforeAll(async ({ apiServices }) => {
      await apiServices.streams.enable();
    });

    test.beforeEach(async ({ apiServices, browserAuth, pageObjects, visualRegression }) => {
      await browserAuth.loginAsAdmin();
      await visualRegression.capture('start of test');
      // Clear existing rules
      await apiServices.streams.clearStreamChildren('logs');
      // Create a test stream with routing rules first
      await apiServices.streams.forkStream('logs', 'logs.nginx', {
        field: 'service.name',
        eq: 'nginx',
      });

      await pageObjects.streams.gotoDataRetentionTab('logs.nginx');
      await visualRegression.capture('go to logs data retention tab');
    });

    test.afterAll(async ({ apiServices }) => {
      await apiServices.streams.disable();
    });

    test('should update a stream data retention policy successfully', async ({
      page,
      pageObjects,
      visualRegression,
    }) => {
      // Update to a specific retention policy first
      await page.getByTestId('streamsAppRetentionMetadataEditDataRetentionButton').click();
      await visualRegression.capture('click edit data retention button');

      await page.getByRole('button', { name: 'Set specific retention days' }).click();
      await visualRegression.capture('click set specific retention days');

      const dialog = page.getByRole('dialog');
      await dialog.getByTestId('streamsAppDslModalDaysField').fill('7');
      await visualRegression.capture('fill days field');

      await dialog.getByRole('button', { name: 'Save' }).click();
      await visualRegression.capture('save data retention policy');

      await expect(
        page.getByTestId('streamsAppRetentionMetadataRetentionPeriod').getByText('7d')
      ).toBeVisible();
      await visualRegression.capture('data retention policy updated');

      await pageObjects.streams.closeToasts();
      await visualRegression.capture('close toasts');
    });

    test('should reset a stream data retention policy successfully', async ({
      page,
      pageObjects,
      visualRegression,
    }) => {
      // Set a specific retention policy first
      await page.getByTestId('streamsAppRetentionMetadataEditDataRetentionButton').click();
      await visualRegression.capture('click edit data retention button');

      await page.getByRole('button', { name: 'Set specific retention days' }).click();
      await visualRegression.capture('click set specific retention days');

      const dialog = page.getByRole('dialog');
      await dialog.getByTestId('streamsAppDslModalDaysField').fill('7');
      await visualRegression.capture('fill days field');

      await dialog.getByRole('button', { name: 'Save' }).click();
      await visualRegression.capture('save data retention policy');

      await expect(
        page.getByTestId('streamsAppRetentionMetadataRetentionPeriod').getByText('7d')
      ).toBeVisible();
      await visualRegression.capture('data retention policy updated');

      await pageObjects.streams.closeToasts();
      await visualRegression.capture('close toasts');

      // Reset the retention policy
      await page.getByTestId('streamsAppRetentionMetadataEditDataRetentionButton').click();
      await visualRegression.capture('click edit data retention button');

      await page.getByRole('button', { name: 'Reset to default', exact: true }).click();
      await visualRegression.capture('click reset to default');

      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Set to default', exact: true })
        .click();
      await visualRegression.capture('click set to default');

      await expect(
        page.getByTestId('streamsAppRetentionMetadataRetentionPeriod').getByText('∞')
      ).toBeVisible();
      await visualRegression.capture('data retention policy reset');

      await pageObjects.streams.closeToasts();
      await visualRegression.capture('close toasts');
    });
  }
);
