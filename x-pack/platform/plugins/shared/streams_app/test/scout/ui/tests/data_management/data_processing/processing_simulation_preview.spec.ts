/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect } from '@kbn/scout';
import { test } from '../../../fixtures';
import { generateLogsData } from '../../../fixtures/generators';

test.describe('Stream data processing - simulation preview', { tag: ['@ess', '@svlOblt'] }, () => {
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

  test('should display default samples when no processors are configured', async ({
    pageObjects,
    visualRegression,
  }) => {
    const rows = await pageObjects.streams.getPreviewTableRows();
    expect(rows.length).toBeGreaterThan(0);
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      await pageObjects.streams.expectCellValueContains({
        columnName: 'message',
        rowIndex,
        value: 'Test log message',
      });
    }
    await visualRegression.capture('default samples no processors');
  });

  test('should display simulation preview when configuring a new processor', async ({
    page,
    pageObjects,
    visualRegression,
  }) => {
    await pageObjects.streams.clickAddProcessor();
    await visualRegression.capture('click add processor');

    await pageObjects.streams.selectProcessorType('rename');
    await visualRegression.capture('select processor type');
    await pageObjects.streams.fillFieldInput('message');
    await page.locator('input[name="to"]').fill('message');

    const rows = await pageObjects.streams.getPreviewTableRows();
    await visualRegression.capture('preview table rows');
    expect(rows.length).toBeGreaterThan(0);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      await pageObjects.streams.expectCellValueContains({
        columnName: 'message',
        rowIndex,
        value: 'Test log message',
      });
    }
  });

  test('should automatically update the simulation preview when changing a new processor config', async ({
    page,
    pageObjects,
    visualRegression,
  }) => {
    await pageObjects.streams.clickAddProcessor();
    await visualRegression.capture('click add processor');

    await pageObjects.streams.selectProcessorType('rename');
    await visualRegression.capture('select processor type');

    await pageObjects.streams.fillFieldInput('message');
    await page.locator('input[name="to"]').fill('message');

    const rows = await pageObjects.streams.getPreviewTableRows();
    await visualRegression.capture('preview table rows');
    expect(rows.length).toBeGreaterThan(0);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      await pageObjects.streams.expectCellValueContains({
        columnName: 'message',
        rowIndex,
        value: 'Test log message',
      });
    }

    await page.locator('input[name="to"]').fill('custom_message');
    await visualRegression.capture('fill custom message');

    const updatedRows = await pageObjects.streams.getPreviewTableRows();
    await visualRegression.capture('updated preview table rows');

    expect(updatedRows.length).toBeGreaterThan(0);
    for (let rowIndex = 0; rowIndex < updatedRows.length; rowIndex++) {
      await pageObjects.streams.expectCellValueContains({
        columnName: 'custom_message',
        rowIndex,
        value: 'Test log message',
      });
    }
  });

  test('should update the simulation preview to previous state when discarding a new processor', async ({
    page,
    pageObjects,
    visualRegression,
  }) => {
    await pageObjects.streams.clickAddProcessor();
    await visualRegression.capture('click add processor');

    await pageObjects.streams.selectProcessorType('rename');
    await visualRegression.capture('select processor type');

    await pageObjects.streams.fillFieldInput('message');
    await page.locator('input[name="to"]').fill('message');

    const rows = await pageObjects.streams.getPreviewTableRows();
    await visualRegression.capture('preview table rows');
    expect(rows.length).toBeGreaterThan(0);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      await pageObjects.streams.expectCellValueContains({
        columnName: 'message',
        rowIndex,
        value: 'Test log message',
      });
    }

    // Cancel the changes and confirm discard
    await pageObjects.streams.clickCancelProcessorChanges();
    await visualRegression.capture('click cancel processor changes');

    await pageObjects.streams.confirmDiscardInModal();
    await visualRegression.capture('confirm discard in modal');

    const updatedRows = await pageObjects.streams.getPreviewTableRows();
    await visualRegression.capture('updated preview table rows');

    expect(updatedRows.length).toBeGreaterThan(0);
    for (let rowIndex = 0; rowIndex < updatedRows.length; rowIndex++) {
      await pageObjects.streams.expectCellValueContains({
        columnName: 'message',
        rowIndex,
        value: 'Test log message',
      });
    }
  });

  test('should update the simulation preview with outcome of multiple new processors', async ({
    page,
    pageObjects,
    visualRegression,
  }) => {
    await pageObjects.streams.clickAddProcessor();
    await visualRegression.capture('click add processor');

    await pageObjects.streams.selectProcessorType('rename');
    await visualRegression.capture('select rename processor type');

    await pageObjects.streams.fillFieldInput('message');
    await page.locator('input[name="to"]').fill('message');
    await pageObjects.streams.clickSaveProcessor();
    await visualRegression.capture('click rename save processor');

    await pageObjects.streams.clickAddProcessor();
    await visualRegression.capture('click add processor');

    await pageObjects.streams.selectProcessorType('set');
    await visualRegression.capture('select setprocessor type');

    await pageObjects.streams.fillFieldInput('custom_threshold');
    await page.locator('input[name="value"]').fill('1024');
    await pageObjects.streams.clickSaveProcessor();
    await visualRegression.capture('click setsave processor');

    const rows = await pageObjects.streams.getPreviewTableRows();
    await visualRegression.capture('preview table rows');
    expect(rows.length).toBeGreaterThan(0);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      await pageObjects.streams.expectCellValueContains({
        columnName: 'message',
        rowIndex,
        value: 'Test log message',
      });
      await pageObjects.streams.expectCellValueContains({
        columnName: 'custom_threshold',
        rowIndex,
        value: '1024',
      });
    }

    // Remove first processor
    await pageObjects.streams.removeProcessor(0);
    await visualRegression.capture('remove processor');

    await pageObjects.streams.confirmDeleteInModal();
    await visualRegression.capture('confirm delete in modal');

    const updatedRows = await pageObjects.streams.getPreviewTableRows();
    await visualRegression.capture('updated preview table rows after removing processor');

    expect(updatedRows.length).toBeGreaterThan(0);
    for (let rowIndex = 0; rowIndex < updatedRows.length; rowIndex++) {
      await pageObjects.streams.expectCellValueContains({
        columnName: 'message',
        rowIndex,
        value: 'Test log message',
      });
      await pageObjects.streams.expectCellValueContains({
        columnName: 'custom_threshold',
        rowIndex,
        value: '1024',
      });
    }
  });
});
