/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getInitialAppState } from './app_state';

const appSlice = createSlice({
  name: 'app',
  initialState: getInitialAppState(),
  reducers: {
    appReady: (state) => ({ ...state, ready: true }),
    appError: (state, { payload }: PayloadAction<Error>) => ({ ...state, ready: payload }),
    appUnload: (state) => state,
  },
});

export const { appReady, appError, appUnload } = appSlice.actions;
export const { reducer: appReducer } = appSlice;
