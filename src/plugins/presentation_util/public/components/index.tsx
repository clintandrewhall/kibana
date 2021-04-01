/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

export const ExperimentsButton = React.lazy(() => import('./experiments/experiments_button'));
export const ExperimentsFlyout = React.lazy(() => import('./experiments/experiments_flyout'));
export const DashboardPicker = React.lazy(() => import('./dashboard_picker'));
export const SavedObjectSaveModalDashboard = React.lazy(
  () => import('./saved_object_save_modal_dashboard')
);
export { SaveModalDashboardProps } from './saved_object_save_modal_dashboard';
