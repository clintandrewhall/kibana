/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { tags } from '@kbn/scout';
import { expect } from '@kbn/scout/ui';
import { spaceTest } from '../fixtures';

const GRAPH_A = { title: 'Graph Alpha', description: 'First test graph' };
const GRAPH_B = { title: 'Graph Beta', description: 'Second test graph' };

const WORKSPACE_ATTRS = { numLinks: 0, numVertices: 0, wsState: '{}', version: 1 };

spaceTest.describe('Graph listing page', { tag: tags.stateful.classic }, () => {
  // Read and search tests share a stable data set created once per worker.
  spaceTest.beforeAll(async ({ kbnClient, scoutSpace }) => {
    await scoutSpace.savedObjects.cleanStandardList();
    await kbnClient.savedObjects.create({
      type: 'graph-workspace',
      attributes: { ...GRAPH_A, ...WORKSPACE_ATTRS },
      space: scoutSpace.id,
    });
    await kbnClient.savedObjects.create({
      type: 'graph-workspace',
      attributes: { ...GRAPH_B, ...WORKSPACE_ATTRS },
      space: scoutSpace.id,
    });
  });

  spaceTest.afterAll(async ({ scoutSpace }) => {
    await scoutSpace.savedObjects.cleanStandardList();
  });

  spaceTest.beforeEach(async ({ browserAuth }) => {
    await browserAuth.loginAsPrivilegedUser();
  });

  spaceTest('renders the page header and saved graphs', async ({ pageObjects }) => {
    await pageObjects.graphListing.goto();
    await expect(pageObjects.graphListing.pageHeader).toBeVisible();
    await expect(pageObjects.graphListing.itemLinks).toHaveCount(2);
  });

  spaceTest('search filters items by title', async ({ pageObjects }) => {
    await pageObjects.graphListing.goto();
    await pageObjects.graphListing.searchFor(GRAPH_A.title);
    await expect(pageObjects.graphListing.itemLinks).toHaveCount(1);
    await expect(pageObjects.graphListing.itemLinks.filter({ hasText: GRAPH_A.title })).toHaveCount(
      1
    );
  });

  spaceTest(
    'create graph button navigates to the workspace editor',
    async ({ pageObjects, page }) => {
      await pageObjects.graphListing.goto();
      await pageObjects.graphListing.createGraphButton.click();
      await expect(page).toHaveURL(/\/app\/graph#\/workspace\//);
    }
  );
});

// Destructive test is isolated so the shared data set above is not affected.
spaceTest.describe('Graph listing page - delete flow', { tag: tags.stateful.classic }, () => {
  spaceTest.beforeAll(async ({ kbnClient, scoutSpace }) => {
    await scoutSpace.savedObjects.cleanStandardList();
    await kbnClient.savedObjects.create({
      type: 'graph-workspace',
      attributes: { ...GRAPH_A, ...WORKSPACE_ATTRS },
      space: scoutSpace.id,
    });
    await kbnClient.savedObjects.create({
      type: 'graph-workspace',
      attributes: { ...GRAPH_B, ...WORKSPACE_ATTRS },
      space: scoutSpace.id,
    });
  });

  spaceTest.afterAll(async ({ scoutSpace }) => {
    await scoutSpace.savedObjects.cleanStandardList();
  });

  spaceTest.beforeEach(async ({ browserAuth }) => {
    await browserAuth.loginAsPrivilegedUser();
  });

  spaceTest(
    'select all and delete removes all graphs and shows empty state',
    async ({ pageObjects }) => {
      await pageObjects.graphListing.goto();
      await expect(pageObjects.graphListing.itemLinks).toHaveCount(2);
      await pageObjects.graphListing.selectAllAndDelete();
      await expect(pageObjects.graphListing.emptyPromptCreateButton).toBeVisible();
    }
  );
});
