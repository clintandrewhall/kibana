/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ScoutPage, Locator } from '@kbn/scout';

/**
 * Page object for the Graph listing page (`/app/graph`).
 *
 * Selectors target Content List `data-test-subj` attributes.
 */
export class GraphListingPage {
  readonly pageHeader: Locator;
  readonly createGraphButton: Locator;
  readonly emptyPromptCreateButton: Locator;
  readonly searchBox: Locator;
  readonly itemLinks: Locator;
  readonly selectionBarDeleteButton: Locator;
  readonly deleteConfirmButton: Locator;
  readonly tableSelectAllCheckbox: Locator;

  constructor(private readonly page: ScoutPage) {
    this.pageHeader = this.page.testSubj.locator('kibana-content-list-page-header');
    this.createGraphButton = this.page.testSubj.locator('graphCreateGraphButton');
    this.emptyPromptCreateButton = this.page.testSubj.locator('graphCreateGraphPromptButton');
    this.searchBox = this.page.testSubj.locator('contentListToolbar-searchBox');
    this.itemLinks = this.page.testSubj.locator('content-list-table-item-link');
    this.selectionBarDeleteButton = this.page.testSubj.locator(
      'contentListSelectionBar-deleteButton'
    );
    this.deleteConfirmButton = this.page.testSubj.locator('confirmModalConfirmButton');
    this.tableSelectAllCheckbox = this.page.testSubj.locator('checkboxSelectAll');
  }

  /** Navigate to the Graph listing page and wait for the header to be visible. */
  async goto() {
    await this.page.gotoApp('graph');
    await this.pageHeader.waitFor({ state: 'visible' });
  }

  /** Type a search query into the toolbar search box and confirm with Enter. */
  async searchFor(text: string) {
    await this.searchBox.fill(text);
    await this.searchBox.press('Enter');
  }

  /** Select all items using the table header checkbox and delete via the selection bar. */
  async selectAllAndDelete() {
    await this.tableSelectAllCheckbox.check();
    await this.selectionBarDeleteButton.click();
    await this.deleteConfirmButton.click();
  }
}
