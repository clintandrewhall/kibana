/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { createAction } from 'redux-actions';
import { without, includes } from 'lodash';
import { createThunk } from '../../lib/create_thunk';
import { getWorkpadColors } from '../selectors/workpad';
// @ts-expect-error
import { fetchAllRenderables } from './elements';
import { CanvasWorkpad, CanvasVariable, CanvasWorkpadTheme } from '../../../types';
import { ColorPalette, Font } from '../../../common/lib';

export interface SizeWorkpadPayload {
  height: number;
  width: number;
}

export type Payloads = SizeWorkpadPayload &
  ColorPalette &
  CanvasWorkpad &
  string &
  string[] &
  number &
  boolean &
  null;

export const SET_WORKPAD = 'setWorkpad';
export const SIZE_WORKPAD = 'sizeWorkpad';
export const SET_NAME = 'setName';
export const SET_WRITEABLE = 'setWriteable';
export const SET_COLORS = 'setColors';
export const SET_REFRESH_INTERVAL = 'setRefreshInterval';
export const SET_WORKPAD_CSS = 'setWorkpadCSS';
export const SET_WORKPAD_THEME = 'setWorkpadTheme';
export const SET_WORKPAD_PALETTE = 'setWorkpadPalette';
export const SET_WORKPAD_FONT_FAMILY = 'setWorkpadFontFamily';
export const SET_WORKPAD_FONT_SIZE = 'setWorkpadFontSize';
export const ENABLE_AUTOPLAY = 'enableAutoplay';
export const SET_AUTOPLAY_INTERVAL = 'setAutoplayInterval';
export const RESET_WORKPAD = 'resetWorkpad';
export const SET_WORKPAD_VARIABLES = 'setWorkpadVariables';

const INITIALIZE_WORKPAD = 'initializeWorkpad';
const ADD_COLOR = 'addColor';
const REMOVE_COLOR = 'removeColor';

export const sizeWorkpad = createAction<SizeWorkpadPayload>(SIZE_WORKPAD);
export const setName = createAction<string>(SET_NAME);
export const setWriteable = createAction<boolean>(SET_WRITEABLE);
export const setColors = createAction<string[]>(SET_COLORS);
export const setRefreshInterval = createAction<number>(SET_REFRESH_INTERVAL);
export const setWorkpadCSS = createAction<string>(SET_WORKPAD_CSS);
export const setWorkpadVariables = createAction<CanvasVariable[]>(SET_WORKPAD_VARIABLES);
export const enableAutoplay = createAction<boolean>(ENABLE_AUTOPLAY);
export const setAutoplayInterval = createAction<number>(SET_AUTOPLAY_INTERVAL);
export const resetWorkpad = createAction<void>(RESET_WORKPAD);

export const initializeWorkpad = createThunk(INITIALIZE_WORKPAD, ({ dispatch }) => {
  dispatch(fetchAllRenderables());
});

export const addColor = createThunk(ADD_COLOR, ({ dispatch, getState }, color: string) => {
  const colors = getWorkpadColors(getState()).slice(0);
  if (!includes(colors, color)) {
    colors.push(color);
  }
  dispatch(setColors(colors));
});

export const removeColor = createThunk(REMOVE_COLOR, ({ dispatch, getState }, color: string) => {
  dispatch(setColors(without(getWorkpadColors(getState()), color)));
});

export const updateWorkpadVariables = createThunk(
  'updateWorkpadVariables',
  ({ dispatch }, vars) => {
    dispatch(setWorkpadVariables(vars));
    dispatch(fetchAllRenderables());
  }
);

export const setWorkpadTheme = createThunk(
  SET_WORKPAD_THEME,
  ({ dispatch, type }, theme: CanvasWorkpadTheme | null) => {
    dispatch(createAction(type)(theme));
    dispatch(fetchAllRenderables());
  }
);
export const setWorkpadPalette = createThunk(
  SET_WORKPAD_PALETTE,
  ({ dispatch, type }, palette: ColorPalette | null) => {
    dispatch(createAction(type)(palette));
    dispatch(fetchAllRenderables());
  }
);

export const setWorkpadFontFamily = createThunk(
  SET_WORKPAD_FONT_FAMILY,
  ({ dispatch, type }, font: Font | null) => {
    dispatch(createAction(type)(font));
    dispatch(fetchAllRenderables());
  }
);

export const setWorkpadFontSize = createThunk(
  SET_WORKPAD_FONT_SIZE,
  ({ dispatch, type }, size: number | null) => {
    dispatch(createAction(type)(size));
    dispatch(fetchAllRenderables());
  }
);

export const setWorkpad = createThunk(
  SET_WORKPAD,
  (
    { dispatch, type },
    workpad: CanvasWorkpad,
    { loadPages = true }: { loadPages?: boolean } = {}
  ) => {
    dispatch(createAction(type)(workpad)); // set the workpad object in state
    if (loadPages) {
      dispatch(initializeWorkpad());
    }
  }
);
