/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getId } from '../../lib/get_id';
import { getInitialAssetsState, AssetsState } from './assets_state';

import { AssetType } from '../../../types';

const assetsSlice = createSlice({
  name: 'assets',
  initialState: getInitialAssetsState(),
  reducers: {
    /**
     * Create a new asset for use on a Canvas Workpad.
     */
    createAsset: {
      prepare: (
        type: AssetType['type'],
        value: AssetType['value'],
        id: AssetType['id'] = getId('asset')
      ) => ({
        payload: { type, value, id },
      }),
      reducer: (state, { payload }: PayloadAction<Pick<AssetType, 'type' | 'value' | 'id'>>) => {
        const { id } = payload;

        state[id] = {
          '@created': new Date().toISOString(),
          ...payload,
        };

        return state;
      },
    },

    /**
     * Remove an asset from a Canvas Workpad.
     */
    removeAsset: (state, { payload: id }: PayloadAction<AssetType['id']>) => {
      delete state[id];
    },

    /**
     * Remove all assets from a Canvas Workpad.
     */
    resetAssets: () => ({}),

    /**
     * Replace the assets on a Canvas Workpad with a new collection.
     */
    setAssets: (_state, { payload }: PayloadAction<AssetsState>) => payload,

    /**
     * Replace the value of an asset with a new `dataurl`.
     */
    setAssetValue: {
      prepare: (id: AssetType['id'], value: AssetType['value']) => ({
        payload: { id, value },
      }),
      reducer: (state, { payload }: PayloadAction<Pick<AssetType, 'id' | 'value'>>) => {
        const { id, value } = payload;
        const asset = state[id];

        if (!asset) {
          throw new Error(`Can not set asset data, id not found: ${id}`);
        }

        asset.value = value;
        state[id] = asset;

        return state;
      },
    },
  },
});

export const {
  createAsset,
  removeAsset,
  resetAssets,
  setAssets,
  setAssetValue,
} = assetsSlice.actions;

export const { reducer: assetsReducer } = assetsSlice;
