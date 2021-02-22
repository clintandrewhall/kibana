/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { KibanaContext } from 'src/plugins/data/common';
import {
  Datatable,
  ExpressionValueFilter,
  ExpressionImage,
  PointSeries,
  ExpressionValueRender,
  Style,
  Range,
} from 'src/plugins/expressions';

import { AppState, AssetsState } from '../public/features';

import { CanvasWorkpad } from './canvas';

export { AppState, AssetsState } from '../public/features';

export enum ChromeStateKeys {
  FULLSCREEN = '__fullscreen',
  REFRESH_INTERVAL = '__refreshInterval',
  AUTOPLAY_INTERVAL = '__autoplayInterval',
}

export interface ChromeState {
  [ChromeStateKeys.FULLSCREEN]?: boolean;
  [ChromeStateKeys.REFRESH_INTERVAL]?: string;
  [ChromeStateKeys.AUTOPLAY_INTERVAL]?: string;
}

export interface ElementStats {
  total: number;
  ready: number;
  pending: number;
  error: number;
}

type ExpressionType =
  | Datatable
  | ExpressionValueFilter
  | ExpressionImage
  | KibanaContext
  | PointSeries
  | Style
  | Range
  | View
  | Model
  | Datasource
  | Transform;

export interface ExpressionRenderable {
  state: 'ready' | 'pending';
  value: ExpressionValueRender<ExpressionType> | null;
  error: null;
}

export interface ExpressionContext {
  state: 'ready' | 'pending' | 'error';
  value: ExpressionType;
  error: null | string;
}

export interface ResolvedArgType {
  expressionRenderable?: ExpressionRenderable;
  expressionContext: ExpressionContext;
}

export interface TransientState {
  canUserWrite: boolean;
  zoomScale: number;
  elementStats: ElementStats;
  fullScreen: boolean;
  selectedToplevelNodes: string[];
  resolvedArgs: { [key: string]: ResolvedArgType | undefined };
  refresh: {
    interval: number;
  };
  autoplay: {
    enabled: boolean;
    interval: number;
  };
  inFlight: boolean;
}

export interface PersistentState {
  schemaVersion: number;
  workpad: CanvasWorkpad;
}

export interface State extends Record<string, any> {
  app: AppState;
  assets: AssetsState;
  transient: TransientState;
  persistent: PersistentState;
}
