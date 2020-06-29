/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
// @ts-expect-error untyped local
import * as pageActions from '../../state/actions/pages';
import { getSelectedPage, getPages } from '../../state/selectors/workpad';
import { State } from '../../../types';

import { PageSidebar as Component } from './components/page_sidebar';

const mapStateToProps = (state: State) => ({
  pages: getPages(state),
  selectedPageId: getSelectedPage(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onMovePage: (id: string, position: number) => dispatch(pageActions.movePage(id, position)),
});

export const PageSidebar = connect(mapStateToProps, mapDispatchToProps)(Component);
