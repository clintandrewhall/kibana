/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
// @ts-expect-error untyped local
import * as pageActions from '../../../state/actions/pages';

import { PageSidebarPreviewControls as Component } from './preview_controls.component';

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onDuplicate: (id: string) => dispatch(pageActions.duplicatePage(id)),
  onDelete: (id: string) => dispatch(pageActions.removePage(id)),
});

export const PageSidebarPreviewControls = connect(null, mapDispatchToProps)(Component);
