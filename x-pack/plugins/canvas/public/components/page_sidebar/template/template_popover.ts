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
import { isWriteable } from '../../../state/selectors/workpad';
import { State, CanvasPage } from '../../../../types';

import { PageSidebarTemplatePopover as Component } from './template_popover.component';

const mapStateToProps = (state: State) => ({
  isWriteable: isWriteable(state) && canUserWrite(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onAddPage: (page?: CanvasPage) => dispatch(pageActions.addPage(page)),
});

export const PageSidebarTemplatePopover = connect(mapStateToProps, mapDispatchToProps)(Component);
