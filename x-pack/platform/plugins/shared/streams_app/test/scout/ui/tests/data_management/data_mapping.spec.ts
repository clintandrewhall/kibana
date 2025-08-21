/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* eslint-disable playwright/expect-expect */

import { expect } from '@kbn/scout';
import { test } from '../../fixtures';
import { generateLogsData } from '../../fixtures/generators';

test.describe('Stream data mapping - schema editor', { tag: ['@ess', '@svlOblt'] }, () => {
  test.beforeAll(async ({ apiServices, logsSynthtraceEsClient }) => {
    await apiServices.streams.enable();
    // Clear existing rules
    await apiServices.streams.clearStreamChildren('logs');
    // Create a test stream with routing rules first
    await apiServices.streams.forkStream('logs', 'logs.info', {
      field: 'severity_text',
      eq: 'info',
    });

    await generateLogsData(logsSynthtraceEsClient)({ index: 'logs' });
  });

  test.beforeEach(async ({ apiServices, browserAuth, pageObjects, visualRegression }) => {
    await browserAuth.loginAsAdmin();
    // Clear existing mappings before each test
    await apiServices.streams.clearStreamMappings('logs.info');

    await visualRegression.capture('start of test');

    await pageObjects.streams.gotoSchemaEditorTab('logs.info');
    await visualRegression.capture('go to logs schema editor tab');
  });

  test.afterAll(async ({ apiServices, logsSynthtraceEsClient }) => {
    await logsSynthtraceEsClient.clean();
    await apiServices.streams.disable();
  });

  test('should display a list of stream mappings', async ({
    page,
    pageObjects,
    visualRegression,
  }) => {
    // Wait for the schema editor table to load
    await pageObjects.streams.expectSchemaEditorTableVisible();
    await visualRegression.capture('schema editor table visible');

    // Verify the table has the expected columns
    await expect(page.getByRole('columnheader').getByText('Field', { exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader').getByText('Type', { exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader').getByText('Format', { exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader').getByText('Field Parent')).toBeVisible();
    await expect(page.getByRole('columnheader').getByText('Status', { exact: true })).toBeVisible();

    // Verify at least one field is displayed (fields from the stream setup)
    const rows = await pageObjects.streams.getPreviewTableRows();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('should allow searching by field name', async ({ pageObjects, visualRegression }) => {
    // Wait for the schema editor table to load
    await pageObjects.streams.expectSchemaEditorTableVisible();
    await visualRegression.capture('schema editor table visible');

    // Search for a common field like '@timestamp'
    await pageObjects.streams.searchFields('@timestamp');
    await visualRegression.capture('search fields');

    // Verify the search filters the results
    const rows = await pageObjects.streams.getPreviewTableRows();
    expect(rows).toHaveLength(1);
    await pageObjects.streams.expectCellValueContains({
      columnName: 'name',
      rowIndex: 0,
      value: '@timestamp',
    });
    await visualRegression.capture('timestamp search results');

    // Clear the search and verify fields are shown again
    await pageObjects.streams.clearFieldSearch();
    await visualRegression.capture('clear field search');

    const updatedRows = await pageObjects.streams.getPreviewTableRows();
    expect(updatedRows.length).toBeGreaterThan(1);

    // Search for a field with multiple results like 'host'
    await pageObjects.streams.searchFields('host');
    await visualRegression.capture('host search results');

    // Verify the search filters the results
    await pageObjects.streams.expectCellValueContains({
      columnName: 'name',
      rowIndex: 0,
      value: 'resource.attributes.host.name',
    });
    await pageObjects.streams.expectCellValueContains({
      columnName: 'name',
      rowIndex: 1,
      value: 'host',
    });
  });

  test('should allow filtering by field type and status', async ({
    pageObjects,
    visualRegression,
  }) => {
    // Wait for the schema editor table to load
    await pageObjects.streams.expectSchemaEditorTableVisible();
    await visualRegression.capture('schema editor table visible');

    // Test filtering by type
    await pageObjects.streams.clickFieldTypeFilter();
    await visualRegression.capture('click field type filter');
    await pageObjects.streams.selectFilterValue('Number');
    await visualRegression.capture('select filter value');

    const numberRows = await pageObjects.streams.getPreviewTableRows();
    for (let rowIndex = 0; rowIndex < numberRows.length; rowIndex++) {
      await pageObjects.streams.expectCellValueContains({
        columnName: 'type',
        rowIndex,
        value: 'Number',
      });
    }
    await visualRegression.capture('number rows');

    await pageObjects.streams.selectFilterValue('Number'); // Deselect the filter
    await visualRegression.capture('deselect number filter value');
    await pageObjects.streams.clickFieldTypeFilter(); // Close the dropdown
    await visualRegression.capture('close field type filter');

    // Test filtering by status
    await pageObjects.streams.clickFieldStatusFilter();
    await visualRegression.capture('click field status filter');
    await pageObjects.streams.selectFilterValue('Inherited');
    await visualRegression.capture('select filter value inherited');
    await pageObjects.streams.clickFieldStatusFilter(); // Close the dropdown
    await visualRegression.capture('close field status filter');

    const mappedRows = await pageObjects.streams.getPreviewTableRows();
    for (let rowIndex = 0; rowIndex < mappedRows.length; rowIndex++) {
      await pageObjects.streams.expectCellValueContains({
        columnName: 'status',
        rowIndex,
        value: 'Inherited',
      });
    }
  });

  test('should allow mapping a field', async ({ page, pageObjects, visualRegression }) => {
    // Wait for the schema editor table to load
    await pageObjects.streams.expectSchemaEditorTableVisible();
    await visualRegression.capture('schema editor table visible');

    // Search specific unmapped field
    await pageObjects.streams.searchFields('resource.attributes.host.ip');
    await visualRegression.capture('search results');

    // Verify the field is unmapped
    await pageObjects.streams.expectCellValueContains({
      columnName: 'name',
      rowIndex: 0,
      value: 'resource.attributes.host.ip',
    });
    await pageObjects.streams.expectCellValueContains({
      columnName: 'status',
      rowIndex: 0,
      value: 'Unmanaged',
    });

    // Open the field actions menu
    await pageObjects.streams.openFieldActionsMenu();
    await visualRegression.capture('open field actions menu');
    await pageObjects.streams.clickFieldAction('Map field');
    await visualRegression.capture('click map field');

    // Verify the flyout opens and set field mapping type
    await pageObjects.streams.expectFieldFlyoutOpen();
    await visualRegression.capture('field flyout open');
    await pageObjects.streams.setFieldMappingType('ip');
    await visualRegression.capture('set field mapping type');
    await pageObjects.streams.saveFieldMappingChanges();
    await visualRegression.capture('save field mapping changes');

    // Verify the field is now mapped
    await pageObjects.streams.expectCellValueContains({
      columnName: 'name',
      rowIndex: 0,
      value: 'resource.attributes.host.ip',
    });
    await pageObjects.streams.expectCellValueContains({
      columnName: 'status',
      rowIndex: 0,
      value: 'Mapped',
    });
  });

  test('should allow unmapping a field', async ({ pageObjects, visualRegression }) => {
    // Wait for the schema editor table to load
    await pageObjects.streams.expectSchemaEditorTableVisible();
    await visualRegression.capture('schema editor table visible');

    // Search specific unmapped field
    await pageObjects.streams.searchFields('resource.attributes.host.ip');
    await visualRegression.capture('search results');

    // Verify the field is unmapped
    await pageObjects.streams.expectCellValueContains({
      columnName: 'name',
      rowIndex: 0,
      value: 'resource.attributes.host.ip',
    });
    await pageObjects.streams.expectCellValueContains({
      columnName: 'status',
      rowIndex: 0,
      value: 'Unmanaged',
    });

    // Open the field actions menu
    await pageObjects.streams.openFieldActionsMenu();
    await visualRegression.capture('open field actions menu');
    await pageObjects.streams.clickFieldAction('Map field');
    await visualRegression.capture('click map field');

    // Verify the flyout opens and set field mapping type
    await pageObjects.streams.expectFieldFlyoutOpen();
    await visualRegression.capture('field flyout open');
    await pageObjects.streams.setFieldMappingType('ip');
    await visualRegression.capture('set ip field mapping type');
    await pageObjects.streams.saveFieldMappingChanges();
    await visualRegression.capture('save field mapping changes');

    // Verify the field is now mapped
    await pageObjects.streams.expectCellValueContains({
      columnName: 'name',
      rowIndex: 0,
      value: 'resource.attributes.host.ip',
    });
    await pageObjects.streams.expectCellValueContains({
      columnName: 'status',
      rowIndex: 0,
      value: 'Mapped',
    });

    // Now attempt to unmap the field
    await pageObjects.streams.unmapField();
    await visualRegression.capture('unmap field');
    // Verify the field is now unmapped
    await pageObjects.streams.expectCellValueContains({
      columnName: 'name',
      rowIndex: 0,
      value: 'resource.attributes.host.ip',
    });
    await pageObjects.streams.expectCellValueContains({
      columnName: 'status',
      rowIndex: 0,
      value: 'Unmanaged',
    });
  });
});
