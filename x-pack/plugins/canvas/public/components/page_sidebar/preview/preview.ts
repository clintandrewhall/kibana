/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
// @ts-expect-error untyped local
import * as pageActions from '../../../state/actions/pages';
import { canUserWrite } from '../../../state/selectors/app';
import { isWriteable, getWorkpad } from '../../../state/selectors/workpad';
import { State } from '../../../../types';

import { PageSidebarPreview as Component } from './preview.component';

const mapStateToProps = (state: State) => ({
  isWriteable: isWriteable(state) && canUserWrite(state),
  workpadCSS: getWorkpad(state).css,
  workpadId: getWorkpad(state).id,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onDuplicate: (id: string) => dispatch(pageActions.duplicatePage(id)),
  onDelete: (id: string) => dispatch(pageActions.removePage(id)),
});

export const PageSidebarPreview = connect(mapStateToProps, mapDispatchToProps)(Component);
