/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Action, handleActions } from 'redux-actions';
import { unset } from 'lodash';
import { set } from '@elastic/safer-lodash-set';

import { platformService } from '../../services';
import { getDefaultWorkpad } from '../defaults';
import {
  SET_WORKPAD,
  SIZE_WORKPAD,
  SET_NAME,
  SET_WRITEABLE,
  SET_COLORS,
  SET_WORKPAD_CSS,
  SET_WORKPAD_PALETTE,
  SET_WORKPAD_FONT_FAMILY,
  SET_WORKPAD_FONT_SIZE,
  SET_WORKPAD_THEME,
  RESET_WORKPAD,
  Payloads,
  SizeWorkpadPayload,
} from '../actions/workpad';
import { CanvasWorkpad, CanvasWorkpadTheme } from '../../../types';

import { APP_ROUTE_WORKPAD } from '../../../common/lib/constants';
import { ColorPalette, Font } from '../../../common/lib';

export const workpadReducer = handleActions<CanvasWorkpad, Payloads>(
  {
    [SET_WORKPAD]: (_workpadState, { payload }: Action<CanvasWorkpad>) => {
      platformService
        .getService()
        .setRecentlyAccessed(`${APP_ROUTE_WORKPAD}/${payload.id}`, payload.name, payload.id);
      return payload;
    },

    [SIZE_WORKPAD]: (workpadState, { payload }: Action<SizeWorkpadPayload>) => {
      return { ...workpadState, ...payload };
    },

    [SET_COLORS]: (workpadState, { payload }: Action<string[]>) => {
      return { ...workpadState, colors: payload };
    },

    [SET_WORKPAD_THEME]: (workpadState, { payload }: Action<CanvasWorkpadTheme | null>) => {
      return { ...workpadState, theme: payload };
    },

    [SET_WORKPAD_PALETTE]: (workpadState, { payload }: Action<ColorPalette | null>) => {
      if (payload) {
        return set(workpadState, 'theme.palette', payload);
      }
      unset(workpadState, 'theme.palette');
      return workpadState;
    },

    [SET_WORKPAD_FONT_FAMILY]: (workpadState, { payload }: Action<Font | null>) => {
      if (payload) {
        return set(workpadState, 'theme.font.family', payload);
      }
      unset(workpadState, 'theme.font.family');
      return workpadState;
    },

    [SET_WORKPAD_FONT_SIZE]: (workpadState, { payload }: Action<number | null>) => {
      if (payload) {
        return set(workpadState, 'theme.font.size', payload);
      }
      unset(workpadState, 'theme.font.size');
      return workpadState;
    },

    [SET_NAME]: (workpadState, { payload }: Action<string>) => {
      platformService
        .getService()
        .setRecentlyAccessed(`${APP_ROUTE_WORKPAD}/${workpadState.id}`, payload, workpadState.id);
      return { ...workpadState, name: payload };
    },

    [SET_WRITEABLE]: (workpadState, { payload }: Action<boolean>) => {
      return { ...workpadState, isWriteable: Boolean(payload) };
    },

    [SET_WORKPAD_CSS]: (workpadState, { payload }: Action<string>) => {
      return { ...workpadState, css: payload };
    },

    [RESET_WORKPAD]: () => ({ ...getDefaultWorkpad() }),
  },
  getDefaultWorkpad()
);
