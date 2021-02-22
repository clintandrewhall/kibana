/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CanvasPage } from '../../../../types';

import { getDefaultWorkpad } from '../../../state/defaults';
import { cloneSubgraphs } from '../../../lib/clone_subgraphs';

// @ts-ignore Untyped local
import { routerProvider } from '../../lib/router_provider';

const clonePage(page: CanvasPage): CanvasPage => {
  const { elements, groups } = page;
  const nodes = cloneSubgraphs([...elements, ...groups]);
}

const pagesSlice = createSlice({
  name: 'pages',
  initialState: getDefaultWorkpad(),
  reducers: {
    addPage: {
      prepare: (page: CanvasPage) => ({ payload: { page } }),
      reducer: (workpad, { payload }: PayloadAction<{ page: CanvasPage }>) => {
        const { page } = payload;
        const activePage = workpad.page + 1;
        workpad.pages.splice(activePage, 0, page);
        workpad.page = activePage;

        // changes to the page require navigation
        const router = routerProvider();
        router.navigateTo('loadWorkpad', { id: workpad.id, page: workpad.page + 1 });

        return workpad;
      },
    },
    duplicatePage: {
      prepare: (pageId: string) => ({ payload: { pageId } }),
      reducer: (workpad, { payload }: PayloadAction<{ pageId: string }>) => {
        const { pageId } = payload;
        const srcPage = workpad.pages.find((page) => page.id === pageId);

        // if the page id is invalid, don't change the state
        if (!srcPage) {
          return workpad;
        }

        const srcIndex = workpad.pages.indexOf(srcPage);
        const newIndex = srcIndex + 1;
        workpad.pages.splice(newIndex, 0, page);

        // changes to the page require navigation
        const router = routerProvider();
        router.navigateTo('loadWorkpad', { id: newState.id, page: newPageIndex + 1 });

        return newState;
      },
    },
  },
});
