/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Dispatch } from 'redux';
import { connect } from 'react-redux';
// @ts-expect-error untyped local
import * as pageActions from '../../../state/actions/pages';
import { getSelectedPage, getPages, getWorkpad } from '../../../state/selectors/workpad';
import { State } from '../../../../types';

import { PageSidebarPager as Component } from './pager.component';

const mapStateToProps = (state: State) => ({
  pages: getPages(state),
  selectedPageId: getSelectedPage(state),
  workpadCSS: getWorkpad(state).css,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSetPage: (index: number) => dispatch(pageActions.setPage(index)),
});

export const PageSidebarPager = connect(mapStateToProps, mapDispatchToProps)(Component);
