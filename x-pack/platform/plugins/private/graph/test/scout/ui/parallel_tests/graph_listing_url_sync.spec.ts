/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { tags, registerContentListUrlSyncTests } from '@kbn/scout';
import { spaceTest } from '../fixtures';

const GRAPH_A = { title: 'Graph Alpha', description: 'First test graph' };
const GRAPH_B = { title: 'Graph Beta', description: 'Second test graph' };
const WORKSPACE_ATTRS = { numLinks: 0, numVertices: 0, wsState: '{}', version: 1 };

/**
 * End-to-end coverage for the Content List URL contract on the Graph listing
 * route. The shared {@link registerContentListUrlSyncTests} suite asserts the
 * `history.push` vs `history.replace` behavior driven by `queryChangeSource`
 * in `kbn-content-list-provider`.
 */
spaceTest.describe(
  'Graph listing page - Content List URL sync',
  { tag: tags.stateful.classic },
  () => {
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

    spaceTest.beforeEach(async ({ browserAuth }) => {
      await browserAuth.loginAsPrivilegedUser();
    });

    spaceTest.afterAll(async ({ scoutSpace }) => {
      await scoutSpace.savedObjects.cleanStandardList();
    });

    registerContentListUrlSyncTests(spaceTest, {
      hash: '#/home',
      goto: (page) => page.gotoApp('graph'),
      gotoWithSearch: (page, search) => page.gotoApp('graph', { hash: `/home${search}` }),
      matchingTerm: 'Alpha',
      matchingItemTitle: /Graph Alpha/,
    });
  }
);
